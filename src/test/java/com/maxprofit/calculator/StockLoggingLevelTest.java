package com.maxprofit.calculator;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Guards against the engine hot path emitting WARN-level log events.
 * The previous brute-force permutation loop used to log WARN thousands
 * of times per request; Phase 2's DP rewrite eliminated that loop.
 *
 * <p>This test fails immediately if anyone reintroduces a {@code LOGGER.warn}
 * call inside {@code Stock.returnIndicesMaxProfit}.
 */
class StockLoggingLevelTest {

    private Logger stockLogger;
    private Level originalLevel;
    private ListAppender<ILoggingEvent> appender;

    @BeforeEach
    void attachAppender() {
        stockLogger = (Logger) LoggerFactory.getLogger(Stock.class);
        originalLevel = stockLogger.getLevel();
        stockLogger.setLevel(Level.DEBUG);
        appender = new ListAppender<>();
        appender.start();
        stockLogger.addAppender(appender);
    }

    @AfterEach
    void detachAppender() {
        stockLogger.setLevel(originalLevel);
        stockLogger.detachAppender(appender);
    }

    @Test
    void engineHotPathLogsAtDebugNotWarn() {
        Stock.returnIndicesMaxProfit(7,
                Arrays.asList(1, 2, 5), Arrays.asList(2, 3, 20));
        List<Level> levels = appender.list.stream()
                .map(ILoggingEvent::getLevel)
                .toList();
        assertThat(levels).doesNotContain(Level.WARN);
    }
}