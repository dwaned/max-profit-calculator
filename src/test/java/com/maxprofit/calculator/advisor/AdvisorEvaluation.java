package com.maxprofit.calculator.advisor;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.SerializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * The top of the AI agent pyramid, run on demand against a local Ollama
 * (never in CI): {@code mvn test -Pagent-evals}.
 *
 * <ul>
 *   <li><b>Probabilistic performance:</b> every task in
 *   {@code advisor/evals/tasks.json} is asked many times. One run says little;
 *   the rates say a lot: how often the right tool arguments are sent, how often
 *   the answer is verified against the calculator, and how often the agent
 *   refuses to calculate with data the user never gave.</li>
 *   <li><b>Vibes and judgment:</b> a larger model from a different family grades
 *   a sample of answers against {@link OllamaJudge#RUBRIC}, with three votes per
 *   answer.</li>
 * </ul>
 *
 * <p>A full run writes {@code site/frontend/src/data/agentEvalResults.json} for
 * the Testing AI Agents page; {@code -Devals.tasks=id1,id2} runs only those
 * tasks and writes nothing. The run fails if a rate drops below its floor.
 */
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class AdvisorEvaluation {

    /** A task from tasks.json; {@code expected} is null when no calculation should run. */
    record Task(String id, String title, String question, Map<String, Object> expected) {
    }

    private static final String OLLAMA = System.getProperty("advisor.ollama-url", "http://localhost:11434");
    private static final String MODEL = System.getProperty("advisor.model", "qwen3.5:4b");
    private static final String JUDGE = System.getProperty("evals.judge-model", "gemma3:12b");
    private static final int RUNS = Integer.getInteger("evals.runs", 10);
    private static final int JUDGED = Integer.getInteger("evals.judged", 3);
    private static final Path RESULTS = Path.of("site/frontend/src/data/agentEvalResults.json");

    /** Minimum acceptable rates. Below these the run fails. */
    private static final double MIN_CORRECT_ARGUMENTS = 0.8;
    private static final double MIN_VERIFIED = 0.8;
    private static final double MIN_SAFE_REFUSALS = 0.8;
    private static final double MIN_JUDGED_PASS_OR_PARTIAL = 0.8;

    private final JsonMapper json = JsonMapper.builder().enable(SerializationFeature.INDENT_OUTPUT).build();

    @Test
    void shouldMeetTheQualityBarAcrossRepeatedRuns() throws Exception {
        final List<String> only = List.of(System.getProperty("evals.tasks", "").split(","));
        final List<Task> tasks = json.<List<Task>>readValue(
                Files.readString(Path.of("src/test/resources/advisor/evals/tasks.json")), new TypeReference<>() { })
                .stream().filter(task -> only.equals(List.of("")) || only.contains(task.id())).toList();
        final StockAdvisor advisor = new StockAdvisor(new OllamaChatModel(RestClient.builder(),
                new AdvisorProperties(true, OLLAMA, MODEL, 0.3, 120, 4)), 4);
        final OllamaJudge judge = new OllamaJudge(OLLAMA, JUDGE);

        final List<Map<String, Object>> taskResults = new ArrayList<>();
        final List<Long> allLatencies = new ArrayList<>();
        int calcRuns = 0;
        int correctArgs = 0;
        int verified = 0;
        int refusalRuns = 0;
        int safeRefusals = 0;
        int judged = 0;
        int judgedOk = 0;
        final Map<String, Integer> verdicts = new LinkedHashMap<>(Map.of("pass", 0, "partial", 0, "fail", 0));

        for (final Task task : tasks) {
            final boolean calculates = task.expected() != null;
            final Map<String, Object> expectedResult = calculates ? ProfitTool.run(task.expected()).result() : null;
            final List<Long> latencies = new ArrayList<>();
            final List<AdvisorAnswer> answers = new ArrayList<>();
            int taskCorrect = 0;
            int taskFirstTry = 0;
            int taskVerified = 0;
            int taskSafe = 0;
            for (int run = 0; run < RUNS; run++) {
                final long start = System.nanoTime();
                final AdvisorAnswer answer = advisor.ask(task.question());
                latencies.add((System.nanoTime() - start) / 1_000_000);
                answers.add(answer);
                if (calculates) {
                    final boolean correct = answer.toolCalls().stream()
                            .anyMatch(call -> call.result() != null && sameArguments(call.arguments(), task.expected()));
                    taskCorrect += correct ? 1 : 0;
                    taskFirstTry += !answer.toolCalls().isEmpty()
                            && sameArguments(answer.toolCalls().get(0).arguments(), task.expected()) ? 1 : 0;
                    taskVerified += answer.verified() ? 1 : 0;
                } else {
                    taskSafe += answer.toolCalls().stream().allMatch(call -> call.result() == null) ? 1 : 0;
                }
            }
            allLatencies.addAll(latencies);

            final List<Map<String, Object>> examples = new ArrayList<>();
            final Map<String, Integer> taskVerdicts = new LinkedHashMap<>(Map.of("pass", 0, "partial", 0, "fail", 0));
            int tieBreaks = 0;
            for (int i = 0; i < Math.min(JUDGED, answers.size()); i++) {
                final AdvisorAnswer answer = answers.get(i);
                final String calculation = calculates
                        ? json.writeValueAsString(expectedResult) : "No calculation was possible from the question.";
                final OllamaJudge.Judgement judgement = judge.judge(task.question(), calculation, answer.answer());
                taskVerdicts.merge(judgement.verdict(), 1, Integer::sum);
                verdicts.merge(judgement.verdict(), 1, Integer::sum);
                tieBreaks += judgement.tieBreak() ? 1 : 0;
                judged++;
                judgedOk += "fail".equals(judgement.verdict()) ? 0 : 1;
                final Map<String, Object> example = new LinkedHashMap<>();
                example.put("answer", answer.answer());
                example.put("verdict", judgement.verdict());
                example.put("votes", judgement.votes().stream().map(OllamaJudge.Vote::verdict).toList());
                example.put("reason", judgement.votes().stream().filter(v -> v.verdict().equals(judgement.verdict()))
                        .map(OllamaJudge.Vote::reason).findFirst().orElse(""));
                examples.add(example);
            }

            final Map<String, Object> result = new LinkedHashMap<>();
            result.put("id", task.id());
            result.put("title", task.title());
            result.put("question", task.question());
            result.put("kind", calculates ? "calculate" : "refuse");
            result.put("runs", RUNS);
            if (calculates) {
                result.put("expected", expectedResult);
                result.put("correctArguments", rate(taskCorrect));
                result.put("firstTryCorrect", rate(taskFirstTry));
                result.put("verified", rate(taskVerified));
                calcRuns += RUNS;
                correctArgs += taskCorrect;
                verified += taskVerified;
            } else {
                result.put("safeRefusals", rate(taskSafe));
                refusalRuns += RUNS;
                safeRefusals += taskSafe;
            }
            result.put("medianLatencyMs", percentile(latencies, 50));
            result.put("judge", Map.of("verdicts", taskVerdicts, "tieBreaks", tieBreaks, "examples", examples));
            taskResults.add(result);
            System.out.printf("%-22s %s%n", task.id(), result.entrySet().stream()
                    .filter(e -> e.getValue() instanceof Double).map(e -> e.getKey() + "=" + e.getValue()).toList());
        }

        final Map<String, Object> overall = new LinkedHashMap<>();
        overall.put("correctArguments", (double) correctArgs / calcRuns);
        overall.put("verified", (double) verified / calcRuns);
        overall.put("safeRefusals", (double) safeRefusals / refusalRuns);
        overall.put("judgedPassOrPartial", (double) judgedOk / judged);
        overall.put("verdicts", verdicts);
        overall.put("medianLatencyMs", percentile(allLatencies, 50));
        overall.put("p95LatencyMs", percentile(allLatencies, 95));

        final Map<String, Object> floors = new LinkedHashMap<>();
        floors.put("correctArguments", MIN_CORRECT_ARGUMENTS);
        floors.put("verified", MIN_VERIFIED);
        floors.put("safeRefusals", MIN_SAFE_REFUSALS);
        floors.put("judgedPassOrPartial", MIN_JUDGED_PASS_OR_PARTIAL);

        final Map<String, Object> report = new LinkedHashMap<>();
        report.put("generatedAt", Instant.now().truncatedTo(ChronoUnit.SECONDS).toString());
        report.put("advisorModel", MODEL);
        report.put("judgeModel", JUDGE);
        report.put("runsPerTask", RUNS);
        report.put("judgedPerTask", JUDGED);
        report.put("floors", floors);
        report.put("overall", overall);
        report.put("tasks", taskResults);
        if (only.equals(List.of(""))) {
            Files.writeString(RESULTS, json.writeValueAsString(report) + System.lineSeparator());
        }
        System.out.println("Overall: " + overall);

        assertThat((double) overall.get("correctArguments")).as("correct tool arguments").isGreaterThanOrEqualTo(MIN_CORRECT_ARGUMENTS);
        assertThat((double) overall.get("verified")).as("verified answers").isGreaterThanOrEqualTo(MIN_VERIFIED);
        assertThat((double) overall.get("safeRefusals")).as("no calculation on missing data").isGreaterThanOrEqualTo(MIN_SAFE_REFUSALS);
        assertThat((double) overall.get("judgedPassOrPartial")).as("judge: pass or partial").isGreaterThanOrEqualTo(MIN_JUDGED_PASS_OR_PARTIAL);
    }

    // Compares through JSON so 5 and 5.0, or Integer and Long, are equal.
    private boolean sameArguments(final Map<String, Object> actual, final Map<String, Object> expected) {
        return json.valueToTree(normalise(actual)).equals(json.valueToTree(normalise(expected)));
    }

    private static Object normalise(final Object value) {
        if (value instanceof Number number && number.doubleValue() == Math.rint(number.doubleValue())) {
            return number.longValue();
        }
        if (value instanceof List<?> list) {
            return list.stream().map(AdvisorEvaluation::normalise).toList();
        }
        if (value instanceof Map<?, ?> map) {
            final Map<Object, Object> out = new LinkedHashMap<>();
            map.forEach((k, v) -> out.put(k, normalise(v)));
            return out;
        }
        return value;
    }

    private static double rate(final int count) {
        return Math.round(1000.0 * count / RUNS) / 1000.0;
    }

    private static long percentile(final List<Long> values, final int percentile) {
        final List<Long> sorted = values.stream().sorted().toList();
        return sorted.get(Math.min(sorted.size() - 1, (int) Math.ceil(percentile / 100.0 * sorted.size()) - 1));
    }
}
