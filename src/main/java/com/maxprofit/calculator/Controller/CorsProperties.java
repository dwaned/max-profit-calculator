package com.maxprofit.calculator.controller;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@SuppressWarnings("checkstyle:ParameterName")
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOrigins) {
}