package com.maxprofit.calculator;

import com.github.javafaker.Faker;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class CompanyNameGenerator {

    private static final Faker FAKER = new Faker();
    private static final Set<String> GENERATED_NAMES = new HashSet<>();

    private CompanyNameGenerator() {
    }

    public static List<String> generateCompanyNames(final int count) {
        List<String> names = new ArrayList<>();
        int attempts = 0;
        int maxAttempts = count * 10;

        while (names.size() < count && attempts < maxAttempts) {
            String name = FAKER.company().name();
            if (!GENERATED_NAMES.contains(name)) {
                GENERATED_NAMES.add(name);
                names.add(name);
            }
            attempts++;
        }

        while (names.size() < count) {
            String name = FAKER.company().name() + " " + (names.size() + 1);
            names.add(name);
        }

        return names;
    }

    public static void clearCache() {
        GENERATED_NAMES.clear();
    }
}
