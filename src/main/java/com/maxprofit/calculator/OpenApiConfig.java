package com.maxprofit.calculator;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
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
                        .version("1.0")
                        .description("API for calculating maximum profit from stock investments")
                        .contact(new Contact()
                                .name("Developer")
                                .url("https://github.com/dwaned/max-profit-calculator")));
    }
}
