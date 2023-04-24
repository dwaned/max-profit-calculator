package com.maxprofit.calculator;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@SuppressWarnings({"checkstyle:LineLength", "checkstyle:magicnumber"})
public class PlaywrightUITests {
    /**
     * Browser object.
     */
    private Browser browser;
    /**
     * Page object.
     */
    private Page page;

    /**
     * Setup the browser and page.
     */
    @BeforeEach
    public void setUp() {
        browser = Playwright.create().chromium().launch(new BrowserType.LaunchOptions().setHeadless(true).setSlowMo(50));
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
     * Test the UI.
     */
    @Test
    public void testCalculateUsingUI() {
        page.navigate("http://localhost:3000");
        Assertions.assertEquals("MAX-PROFIT-CALCULATOR", page.title(), "Did not find expected title");
        page.click("id=prompt");
        page.type("id=prompt", "calculate 1 [1] [2]");
        page.keyboard().press("Enter");
        String result = page.textContent("xpath=//p[contains(text(),\"maxProfit\")]").toString();
        Assertions.assertTrue(page.isVisible("xpath=//p[contains(text(), '{\"maxProfit\":1,\"indices\":[[0]]}')]"),
                "Did not find expected Calculate result. Found: " + result);
    }
}
