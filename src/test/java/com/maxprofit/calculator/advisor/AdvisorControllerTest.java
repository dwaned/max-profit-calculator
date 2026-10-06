package com.maxprofit.calculator.advisor;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;

import com.maxprofit.calculator.controller.GlobalExceptionHandler;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

/**
 * The advisor endpoints with a scripted model: status codes, validation and
 * the disabled state.
 */
@SuppressWarnings({"checkstyle:magicnumber", "checkstyle:LineLength"})
class AdvisorControllerTest {

    private static final String QUESTION = "{\"question\": \"I have 5 euros...\"}";

    private static MockMvc mvc(final boolean enabled, final ChatModel model) {
        final AdvisorProperties properties = new AdvisorProperties(enabled, "http://unused", "qwen3.5:4b", 0.3, 30, 4);
        return MockMvcBuilders.standaloneSetup(new AdvisorController(new StockAdvisor(model, 4), properties))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void shouldReportItsStatus() throws Exception {
        mvc(false, new ScriptedChatModel()).perform(get("/advisor/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false))
                .andExpect(jsonPath("$.model").value("qwen3.5:4b"));
    }

    @Test
    void shouldAnswerWhenEnabled() throws Exception {
        final ScriptedChatModel model = new ScriptedChatModel()
                .callTool("calculate_max_profit", Map.of("savings", 5, "buyPrices", List.of(4, 1, 3), "sellPrices", List.of(5, 2, 6)))
                .reply("Buy stocks 2 and 3 for a profit of €4.");

        mvc(true, model).perform(post("/advisor").contentType(MediaType.APPLICATION_JSON).content(QUESTION))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("Buy stocks 2 and 3 for a profit of €4."))
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.toolCalls[0].result.stocksToBuy[1]").value(3));
    }

    @Test
    void shouldAnswer503WhenDisabled() throws Exception {
        mvc(false, new ScriptedChatModel()).perform(post("/advisor").contentType(MediaType.APPLICATION_JSON).content(QUESTION))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value("The advisor runs on a local Ollama model and is turned off in this deployment"));
    }

    @Test
    void shouldAnswer503WhenTheModelIsUnreachable() throws Exception {
        final ChatModel down = new ChatModel() {
            @Override
            public ChatMessage chat(final List<ChatMessage> messages, final List<Map<String, Object>> tools) {
                throw new AdvisorUnavailableException("The local model could not be reached or replied unexpectedly", null);
            }

            @Override
            public String name() {
                return "down";
            }
        };

        mvc(true, down).perform(post("/advisor").contentType(MediaType.APPLICATION_JSON).content(QUESTION))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").value("The local model could not be reached or replied unexpectedly"));
    }

    @Test
    void shouldRejectBlankAndOverlongQuestions() throws Exception {
        final MockMvc mvc = mvc(true, new ScriptedChatModel());
        mvc.perform(post("/advisor").contentType(MediaType.APPLICATION_JSON).content("{\"question\": \"  \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid input: Question is required"));
        mvc.perform(post("/advisor").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\": \"" + "x".repeat(501) + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid input: Question must not exceed 500 characters"));
        // 500 characters passes validation (and reaches the disabled check)
        mvc(false, new ScriptedChatModel()).perform(post("/advisor").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\": \"" + "x".repeat(500) + "\"}"))
                .andExpect(status().isServiceUnavailable());
    }
}
