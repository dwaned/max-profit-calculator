package com.maxprofit.calculator;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.cfg.CoercionAction;
import tools.jackson.databind.cfg.CoercionInputShape;
import tools.jackson.databind.type.LogicalType;

/**
 * Makes JSON request binding match the OpenAPI schema: a value must already
 * have the declared type. By default Jackson silently turns {@code false} or
 * {@code 42} into the strings {@code "false"} / {@code "42"}, {@code "5"} into
 * the integer 5, and {@code 1.5} into 1, so requests the schema forbids were
 * accepted (found by API fuzzing). Such requests now fail with 400.
 */
@Configuration
@SuppressWarnings("checkstyle:DesignForExtension")
public class JacksonConfig {

    @Bean
    public JsonMapperBuilderCustomizer strictScalarTypes() {
        return builder -> builder
                .withCoercionConfig(LogicalType.Textual, config -> config
                        .setCoercion(CoercionInputShape.Boolean, CoercionAction.Fail)
                        .setCoercion(CoercionInputShape.Integer, CoercionAction.Fail)
                        .setCoercion(CoercionInputShape.Float, CoercionAction.Fail))
                .withCoercionConfig(LogicalType.Integer, config -> config
                        .setCoercion(CoercionInputShape.String, CoercionAction.Fail)
                        .setCoercion(CoercionInputShape.Float, CoercionAction.Fail)
                        .setCoercion(CoercionInputShape.Boolean, CoercionAction.Fail));
    }
}
