/**
 * Step definitions for the acceptance scenarios in {@code MaxProfit.feature}.
 */
package com.maxprofit.calculator.steps;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import io.cucumber.java.After;
import io.cucumber.java.AfterAll;
import io.cucumber.java.Before;
import io.cucumber.java.BeforeAll;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Drives the calculator UI in a real browser (Playwright), the way a user would:
 * enter savings and prices, submit, and read the result. The scenarios are
 * acceptance criteria written with the business, so they are automated
 * end-to-end against the running application rather than against the engine.
 *
 * <p>The UI is expected at {@code PLAYWRIGHT_BASE_URL} (default
 * {@code http://localhost:3000}, the Docker Compose frontend). Run with
 * {@code mvn test -Pplaywright-tests}.
 */
@SuppressWarnings({"checkstyle:DesignForExtension", "checkstyle:MagicNumber"})
public class StepDefinitions {

    private static final String BASE_URL = System.getenv().getOrDefault(
            "PLAYWRIGHT_BASE_URL", "http://localhost:3000");

    // The form renders a desktop table and a mobile card layout; with a desktop
    // viewport only the table is visible, so every selector is scoped to it.
    private static final String BUY_INPUTS = "table input[aria-label^='Buy price']";
    private static final String SELL_INPUTS = "table input[aria-label^='Sell price']";
    private static final String REMOVE_BUTTONS = "table button[aria-label^='Remove']";

    private static Playwright playwright;
    private static Browser browser;

    private BrowserContext context;
    private Page page;
    private boolean submitted;

    @BeforeAll
    public static void launchBrowser() {
        playwright = Playwright.create();
        browser = playwright.chromium().launch();
    }

    @AfterAll
    public static void closeBrowser() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }

    @Before
    public void openCalculator() {
        context = browser.newContext(new Browser.NewContextOptions().setViewportSize(1280, 900));
        page = context.newPage();
        page.navigate(BASE_URL + "/#/calculator");
        page.waitForSelector("#savings-amount");
        submitted = false;
    }

    @After
    public void closePage() {
        if (context != null) {
            context.close();
        }
    }

    @Given("I have {int} Euros of savings")
    public void iHaveEurosOfSavings(final int savings) {
        page.fill("#savings-amount", Integer.toString(savings));
    }

    @When("Array of current stock prices are {string}")
    public void arrayOfCurrentStockPricesAre(final String currentPrices) {
        List<String> prices = parse(currentPrices);
        setNumberOfStocks(prices.size());
        fillAll(BUY_INPUTS, prices);
    }

    @And("Array of future stock prices are {string}")
    public void arrayOfFutureStockPricesAre(final String futurePrices) {
        List<String> prices = parse(futurePrices);
        assertEquals(page.locator(SELL_INPUTS).count(), prices.size(),
                "Future prices must match the number of current prices");
        fillAll(SELL_INPUTS, prices);
    }

    @Then("the best combination of indices for max profit is {string}")
    public void theBestCombinationOfIndicesForMaxProfitIs(final String expected) {
        submitOnce();
        Locator chips = page.getByTestId("buy-indices").locator("span");
        List<String> actual = chips.allTextContents().stream()
                .map(text -> text.replace("#", "").trim())
                .toList();
        assertEquals(parse(expected), actual, "Buy indices shown in the results");
    }

    @Then("profit is {int} Euros")
    public void profitIsEuros(final int profit) {
        submitOnce();
        assertEquals("€" + profit, page.getByTestId("max-profit").textContent().trim(),
                "Max profit shown in the results");
    }

    @Then("there is no best combination for max profit")
    public void thereIsNoBestCombinationForMaxProfit() {
        submitOnce();
        assertTrue(page.getByTestId("no-profit").isVisible(), "Expected the 'no profitable stocks' message");
        assertEquals(0, page.getByTestId("buy-indices").count(), "No buy indices should be shown");
    }

    @And("no profit is made")
    public void noProfitIsMade() {
        profitIsEuros(0);
    }

    /** Adds or removes rows with the real UI controls until there are {@code count} stocks. */
    private void setNumberOfStocks(final int count) {
        while (page.locator(BUY_INPUTS).count() > count) {
            page.locator(REMOVE_BUTTONS).last().click();
        }
        while (page.locator(BUY_INPUTS).count() < count) {
            page.getByRole(com.microsoft.playwright.options.AriaRole.BUTTON,
                    new Page.GetByRoleOptions().setName("+ Add Stock")).click();
        }
    }

    private void fillAll(final String selector, final List<String> values) {
        Locator inputs = page.locator(selector);
        for (int i = 0; i < values.size(); i++) {
            inputs.nth(i).fill(values.get(i));
        }
    }

    /** Submits the form the first time a result is needed, then waits for the result card. */
    private void submitOnce() {
        if (!submitted) {
            page.click("button[type='submit']");
            page.getByTestId("results").waitFor();
            submitted = true;
        }
    }

    private static List<String> parse(final String commaSeparated) {
        return Stream.of(commaSeparated.split(",")).map(String::trim).toList();
    }
}
