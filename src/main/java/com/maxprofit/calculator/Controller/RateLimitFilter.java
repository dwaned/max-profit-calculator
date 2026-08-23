package com.maxprofit.calculator.controller;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Servlet filter that enforces per-IP rate limiting on the {@code /api/calculate}
 * endpoint via {@link RateLimiterService}.
 *
 * <p>When the bucket has tokens, the request is forwarded to the controller
 * chain. When the bucket is empty, the filter responds directly with HTTP 429
 * and a JSON body of the form {@code {"message": "Rate limit exceeded"}}.
 *
 * <p>The filter checks the request URI internally so only {@code /api/calculate}
 * is rate-limited; other endpoints (notably {@code /api/health}) are passed
 * through unconditionally. Client identification prefers {@code X-Forwarded-For}
 * (Render / load balancer proxy) over {@code request.getRemoteAddr()}.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final String X_FORWARDED_FOR = "X-Forwarded-For";
    private static final String CALCULATE_PATH = "/api/calculate";

    private final RateLimiterService limiter;

    public RateLimitFilter(final RateLimiterService limiter) {
        this.limiter = limiter;
    }

    @Override
    protected void doFilterInternal(final HttpServletRequest request,
                                    final HttpServletResponse response,
                                    final FilterChain chain) throws ServletException, IOException {
        if (!isRateLimited(request)) {
            chain.doFilter(request, response);
            return;
        }
        final String clientKey = clientKey(request);
        if (limiter.tryAcquire(clientKey)) {
            chain.doFilter(request, response);
        } else {
            LOGGER.warn("Rate limit exceeded for client {}", clientKey);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"message\": \"Rate limit exceeded\"}");
        }
    }

    /**
     * @return {@code true} iff the request URI is the {@code /api/calculate}
     *         endpoint and should be rate-limited. Uses {@code endsWith} so the
     *         filter works whether or not a servlet context path is configured
     *         (production has context path {@code /api}; MockMvc tests do not).
     */
    static boolean isRateLimited(final HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri != null && uri.endsWith("/calculate");
    }

    /**
     * Resolves the per-request client key. Honours {@code X-Forwarded-For} so
     * the filter behaves correctly behind Render's reverse proxy / load balancer.
     *
     * @param request the inbound servlet request
     * @return the client IP (or proxy-resolved address)
     */
    static String clientKey(final HttpServletRequest request) {
        String forwarded = request.getHeader(X_FORWARDED_FOR);
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return (comma >= 0 ? forwarded.substring(0, comma) : forwarded).trim();
        }
        return request.getRemoteAddr();
    }
}