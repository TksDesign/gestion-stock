package com.franck.ecommerce.auth;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class CustomerClient {

    private final RestTemplate restTemplate;

    @Value("${application.config.customer-url:http://localhost:8222/api/v1/customers}")
    private String customerUrl;

    public CustomerClient() {
        this.restTemplate = new RestTemplate();
    }

    public String createCustomer(String firstname, String lastname, String email) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        var body = Map.of(
                "firstname", firstname,
                "lastname", lastname,
                "email", email
        );
        var request = new HttpEntity<>(body, headers);
        return restTemplate.postForObject(customerUrl, request, String.class);
    }
}
