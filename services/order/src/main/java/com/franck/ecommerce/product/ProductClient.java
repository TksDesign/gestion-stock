package com.franck.ecommerce.product;

import com.franck.ecommerce.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.springframework.http.HttpHeaders.CONTENT_TYPE;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductClient {

    @Value("${application.config.product-url}")
    private String productUrl;
    private final RestTemplate restTemplate;

    public List<PurchaseResponse> purchaseProducts(List<PurchaseRequest> requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(CONTENT_TYPE, APPLICATION_JSON_VALUE);

        HttpEntity<List<PurchaseRequest>> requestEntity = new HttpEntity<>(requestBody, headers);
        ParameterizedTypeReference<List<PurchaseResponse>> responseType = new ParameterizedTypeReference<>() {
        };
        ResponseEntity<List<PurchaseResponse>> responseEntity = restTemplate.exchange(
                productUrl + "/purchase",
                POST,
                requestEntity,
                responseType
        );

        if (responseEntity.getStatusCode().isError()) {
            throw new BusinessException("An error occurred while processing the products purchase: " + responseEntity.getStatusCode());
        }
        return  responseEntity.getBody();
    }

    /**
     * Compensation (saga légère) : réincrémente le stock précédemment décrémenté par
     * {@link #purchaseProducts}, lorsqu'une étape ultérieure de la création de commande
     * échoue (client, paiement, sauvegarde...). Best-effort : un échec de la compensation
     * elle-même est loggué en ERROR (intervention manuelle potentiellement nécessaire) mais
     * ne masque jamais l'exception d'origine qui a déclenché la compensation.
     */
    public void restoreStock(List<PurchaseRequest> requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set(CONTENT_TYPE, APPLICATION_JSON_VALUE);
            HttpEntity<List<PurchaseRequest>> requestEntity = new HttpEntity<>(requestBody, headers);
            restTemplate.exchange(productUrl + "/restore", POST, requestEntity, Void.class);
        } catch (Exception e) {
            log.error("Failed to compensate (restore) stock for products {} -- manual intervention may be required", requestBody, e);
        }
    }

}
