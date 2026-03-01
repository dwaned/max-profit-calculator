package com.maxprofit.calculator;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@SuppressWarnings({"checkstyle:DesignForExtension", "checkstyle:LineLength", 
    "checkstyle:MissingJavadocMethod"})
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Max Profit Calculator API")
                        .version("1.0.0")
                        .description("API for calculating maximum profit from stock prices. "
                                + "Given savings and buy/sell prices, returns the optimal buy and sell indices.")
                        .contact(new Contact()
                                .name("Developer")
                                .url("https://github.com/dwaned/max-profit-calculator"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")));
    }
}
