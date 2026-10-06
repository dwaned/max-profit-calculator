package com.maxprofit.calculator.advisor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tools.jackson.databind.json.JsonMapper;

/**
 * The agent loop. It sends the question to the model with the calculator as
 * a tool, runs each tool call the model asks for, feeds the result back, and
 * stops when the model replies in text or the turn limit is reached.
 *
 * <p>The model writes the answer, but the calculator decides it. An answer is
 * marked {@link AdvisorAnswer#verified() verified} only when it quotes the
 * profit the calculator returned: a deterministic check on a non-deterministic
 * output.
 */
public class StockAdvisor {

    /** Instructions given to the model before every question. */
    public static final String SYSTEM_PROMPT = """
            You are a stock-buying advisor. The user gives their savings in euros, today's price of each \
            stock and its forecast future price.
            Always call the calculate_max_profit tool to decide which stocks to buy; never do the \
            arithmetic yourself.
            Only pass the tool numbers the user actually gave. Never assume a price: if the savings, today's \
            prices or the future prices are missing, ask for them instead of calling the tool.
            Then answer in two or three short sentences: which stocks to buy (numbered from 1 in the order \
            the user listed them), the total profit in euros (say 0 euros if nothing is worth buying), and \
            how much of the savings is used. Only use numbers from the tool result.
            If the question is not about choosing stocks, say so briefly.""";

    private static final Logger LOGGER = LoggerFactory.getLogger(StockAdvisor.class);

    private final ChatModel model;
    private final int maxTurns;
    private final JsonMapper json = JsonMapper.builder().build();

    /**
     * @param model    the chat model that drives the agent
     * @param maxTurns model calls allowed per question
     */
    public StockAdvisor(final ChatModel model, final int maxTurns) {
        if (maxTurns < 1) {
            throw new IllegalArgumentException("maxTurns must be at least 1");
        }
        this.model = model;
        this.maxTurns = maxTurns;
    }

    /**
     * Answers one question.
     *
     * @param question the user's question, in plain language
     * @return the answer, the tool calls behind it and whether it is verified
     * @throws AdvisorUnavailableException if the model cannot be reached
     */
    public AdvisorAnswer ask(final String question) {
        final List<ChatMessage> messages = new ArrayList<>();
        messages.add(ChatMessage.system(SYSTEM_PROMPT));
        messages.add(ChatMessage.user(question));
        final List<Map<String, Object>> tools = List.of(ProfitTool.definition());
        final List<ToolInvocation> invocations = new ArrayList<>();

        for (int turn = 1; turn <= maxTurns; turn++) {
            final ChatMessage reply = model.chat(List.copyOf(messages), tools);
            messages.add(reply);
            if (reply.toolCalls().isEmpty()) {
                return new AdvisorAnswer(reply.content().strip(), invocations,
                        quotesProfit(reply.content(), invocations), true, turn, model.name());
            }
            for (final ToolCall call : reply.toolCalls()) {
                final ToolInvocation invocation = ProfitTool.NAME.equals(call.name())
                        ? ProfitTool.run(call.arguments())
                        : new ToolInvocation(call.name(), call.arguments(), null,
                                "Unknown tool " + call.name() + "; the only tool is " + ProfitTool.NAME);
                invocations.add(invocation);
                messages.add(ChatMessage.tool(call.name(), toJson(invocation)));
            }
        }
        LOGGER.warn("Advisor reached its limit of {} turns without a final answer", maxTurns);
        return new AdvisorAnswer("Sorry, I couldn't work that out. Please check the prices and savings and try again.",
                invocations, false, false, maxTurns, model.name());
    }

    private String toJson(final ToolInvocation invocation) {
        return invocation.error() != null
                ? json.writeValueAsString(Map.of("error", invocation.error()))
                : json.writeValueAsString(invocation.result());
    }

    /**
     * True when the answer mentions the profit from the last successful
     * calculation as a whole number (so 8 matches "€8" but not "18").
     */
    static boolean quotesProfit(final String answer, final List<ToolInvocation> invocations) {
        for (int i = invocations.size() - 1; i >= 0; i--) {
            final Map<String, Object> result = invocations.get(i).result();
            if (result != null) {
                final Pattern profit = Pattern.compile("(?<![\\d.,])" + result.get("maxProfit") + "(?![\\d]|[.,]\\d)");
                return profit.matcher(answer).find();
            }
        }
        return false;
    }
}
