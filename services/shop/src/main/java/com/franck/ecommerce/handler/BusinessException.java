package com.franck.ecommerce.handler;

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
