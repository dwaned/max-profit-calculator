package com.maxprofit.calculator;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * End-to-end browser test for the calculator UI.
 *
 * <p>Drives the real frontend (not the API) through a real Chromium instance
 * to confirm the form, the API call, and the results card all render and
 * work together. Runs under the {@code -Pplaywright-tests} profile which
 * adds the {@code com.microsoft.playwright:playwright} dependency and gates
 * this class behind a profile-scoped surefire {@code <include>}.
 *
 * <p>The test expects the frontend to be reachable at the URL below
 * ({@code PLAYWRIGHT_BASE_URL}, defaults to {@code http://localhost:3000}).
 * In CI the {@code containers.yml} job brings the full stack up via
 * docker-compose before running {@code mvn test -Pplaywright-tests}.
 *
 * <p>The default surefire config in {@code pom.xml} excludes this class so
 * it does not run under {@code mvn test} (where there is no browser binary
 * and no frontend). The reports workflow likewise excludes it explicitly
 * via {@code -Dtest='…,!PlaywrightUITests, …'}.
 */
@SuppressWarnings({"checkstyle:LineLength", "checkstyle:magicnumber"})
public class PlaywrightUITests {
    /** Base URL where the React dev server / nginx is reachable. */
    private static final String BASE_URL = System.getenv().getOrDefault(
        "PLAYWRIGHT_BASE_URL", "http://localhost:3000"
    );

    /** Browser object. */
    private Browser browser;
    /** Page object. */
    private Page page;

    /**
     * Setup the browser and page.
     */
    @BeforeEach
    public void setUp() {
        browser = Playwright.create().chromium().launch(
            new BrowserType.LaunchOptions().setHeadless(true)
        );
        page = browser.newPage();
    }

    /**
     * Close the browser.
     */
    @AfterEach
    public void tearDown() {
        browser.close();
    }

    /**
     * Drive the calculator form with the default sample data
     * (savings=10, buy=[5,5,10], sell=[15,10,35]) and assert the
     * algorithm picks stock #2 for max profit of 25.
     */
    @Test
    public void testCalculateUsingUI() {
        page.navigate(BASE_URL + "/#/calculator");

        // Wait for the form to render before touching it. The dev server /
        // first load can take a few seconds in CI.
        page.waitForSelector("#savings-amount");
        page.waitForSelector("button[type='submit']");

        // Fill the form (aria-labels are stable selectors across the
        // desktop/table and mobile/card layouts).
        page.fill("#savings-amount", "10");
        // The default form starts with three rows. The aria-labels include the
        // company name when present (e.g. "Buy price for Acme Corp"); fall
        // back to a generic label otherwise. nth() is positional and survives
        // either form.
        page.locator("input[type='number'][aria-label*='Buy price']").nth(0).fill("5");
        page.locator("input[type='number'][aria-label*='Buy price']").nth(1).fill("5");
        page.locator("input[type='number'][aria-label*='Buy price']").nth(2).fill("10");
        page.locator("input[type='number'][aria-label*='Sell price']").nth(0).fill("15");
        page.locator("input[type='number'][aria-label*='Sell price']").nth(1).fill("10");
        page.locator("input[type='number'][aria-label*='Sell price']").nth(2).fill("35");

        // Submit and wait for the result card to render.
        page.click("button[type='submit']");
        page.waitForSelector("text=Max Profit");

        // The result is rendered inside the "Max Profit" tile as
        // `€<value>`. Stock #2 (buy=10, sell=35) is the unique max-profit
        // pick for this input set.
        String maxProfitText = page.locator("text=€").first().textContent();
        Assertions.assertTrue(
            maxProfitText.contains("25"),
            "Expected max profit to be €25, got: " + maxProfitText
        );
    }
}
