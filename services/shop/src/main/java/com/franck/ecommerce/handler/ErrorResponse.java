package com.franck.ecommerce.handler;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(Instant timestamp, int status, Map<String, String> errors) {

    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(Instant.now(), status, Map.of("error", message));
    }

    public static ErrorResponse of(int status, Map<String, String> errors) {
        return new ErrorResponse(Instant.now(), status, errors);
    }
}
