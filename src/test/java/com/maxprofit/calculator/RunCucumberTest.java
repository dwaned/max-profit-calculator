package com.maxprofit.calculator;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("com/maxprofit/calculator")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "json:target/cucumber-report/report.json")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "html:targer/cucumber-report/report.html")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.maxprofit.calculator")
public class RunCucumberTest {
}