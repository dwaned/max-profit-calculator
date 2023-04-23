package com.maxprofit.calculator;


import com.microsoft.playwright.*;
import org.junit.jupiter.api.*;

public class PlaywrightUITests {
    private Browser browser;
    private Page page;

    @BeforeEach
    public void setUp() {
        browser = Playwright.create().chromium().launch(new BrowserType.LaunchOptions().setHeadless(true).setSlowMo(50));
        page = browser.newPage();
    }

    @AfterEach
    public void tearDown() {
        browser.close();
    }

    @Test
    public void testCalculateUsingUI() {
        page.navigate("http://localhost:3000");
        Assertions.assertEquals("MAX-PROFIT-CALCULATOR", page.title());
        page.click("id=prompt");
        page.type("id=prompt", "calculate 1 [1] [2]");
        page.keyboard().press("Enter");
        Assertions.assertTrue(page.isVisible("xpath=//p[contains(text(), '{\"maxProfit\":1,\"indices\":[[0]]}')]"),"Did not find expected text");
    }
}