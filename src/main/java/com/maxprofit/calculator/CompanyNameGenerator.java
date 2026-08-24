package com.maxprofit.calculator;

import com.github.javafaker.Faker;

import java.util.ArrayList;
import java.util.List;

public final class CompanyNameGenerator {

    private static final Faker FAKER = new Faker();

    private CompanyNameGenerator() {
    }

    public static List<String> generateCompanyNames(final int count) {
        List<String> names = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            names.add(FAKER.company().name());
        }
        return names;
    }
}