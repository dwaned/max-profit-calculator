package com.maxprofit.calculator.advisor;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * LLM-as-judge: a second, larger model grades the advisor's answers against
 * a written rubric. Each answer gets three independent votes and the majority
 * wins; if all three disagree, a fourth vote breaks the tie.
 */
final class OllamaJudge {

    /** A single grading. */
    record Vote(String verdict, String reason) {
    }

    /** The outcome for one answer. */
    record Judgement(String verdict, List<Vote> votes, boolean tieBreak) {
    }

    static final String RUBRIC = """
            You grade answers from a stock-buying advisor. You get the user's question, the result of the \
            calculator the advisor used (or a note that no calculation was possible), and the advisor's answer.

            Grade the answer:
            - "pass": it states the same stocks, profit and savings used as the calculator result (stocks are \
            numbered from 1), adds no numbers or claims the question and result do not support, and is clear \
            and brief (at most three sentences). When no calculation was possible, it says what information \
            is needed or politely declines, without inventing any numbers.
            - "partial": the key facts are right but it is unclear, too long, or adds a minor unsupported claim.
            - "fail": it gives wrong stocks or numbers, invents data, or does not answer.

            Reply with JSON: {"verdict": "pass" | "partial" | "fail", "reason": "<one sentence>"}""";

    private static final int VOTES = 3;
    private static final Map<String, Object> FORMAT = Map.of(
            "type", "object",
            "properties", Map.of(
                    "verdict", Map.of("type", "string", "enum", List.of("pass", "partial", "fail")),
                    "reason", Map.of("type", "string")),
            "required", List.of("verdict", "reason"));

    private final RestClient client;
    private final String model;
    private final JsonMapper json = JsonMapper.builder().build();

    OllamaJudge(final String ollamaUrl, final String model) {
        final SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setReadTimeout(Duration.ofMinutes(3));
        this.client = RestClient.builder().baseUrl(ollamaUrl).requestFactory(requestFactory).build();
        this.model = model;
    }

    String model() {
        return model;
    }

    Judgement judge(final String question, final String calculatorResult, final String answer) {
        final List<Vote> votes = new ArrayList<>();
        for (int i = 0; i < VOTES; i++) {
            votes.add(vote(question, calculatorResult, answer));
        }
        final String majority = majority(votes);
        if (majority != null) {
            return new Judgement(majority, votes, false);
        }
        final Vote tieBreaker = vote(question, calculatorResult, answer);
        votes.add(tieBreaker);
        return new Judgement(tieBreaker.verdict(), votes, true);
    }

    private static String majority(final List<Vote> votes) {
        final Map<String, Integer> counts = new LinkedHashMap<>();
        votes.forEach(vote -> counts.merge(vote.verdict(), 1, Integer::sum));
        return counts.entrySet().stream().filter(e -> e.getValue() * 2 > votes.size())
                .map(Map.Entry::getKey).findFirst().orElse(null);
    }

    private Vote vote(final String question, final String calculatorResult, final String answer) {
        final String prompt = "Question:\n" + question + "\n\nCalculator result:\n" + calculatorResult
                + "\n\nAdvisor's answer:\n" + answer;
        final Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("stream", false);
        body.put("think", false);
        body.put("format", FORMAT);
        body.put("options", Map.of("temperature", 0.7));
        body.put("messages", List.of(
                Map.of("role", "system", "content", RUBRIC),
                Map.of("role", "user", "content", prompt)));
        final String response = client.post().uri("/api/chat").contentType(MediaType.APPLICATION_JSON)
                .body(json.writeValueAsString(body)).retrieve().body(String.class);
        final JsonNode content = json.readTree(json.readTree(response).path("message").path("content").asString());
        return new Vote(content.path("verdict").asString("fail"), content.path("reason").asString(""));
    }
}
