package com.franck.ecommerce.sale;

import java.util.List;

import com.franck.ecommerce.config.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shops/mine/sales")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SHOP_MANAGER')")
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    public ResponseEntity<SaleResponse> recordSale(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody @Valid SaleRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.recordSale(user.userId(), request));
    }

    @GetMapping
    public ResponseEntity<List<SaleResponse>> findAll(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(saleService.findAll(user.userId()));
    }

    @GetMapping("/{sale-id}")
    public ResponseEntity<SaleResponse> findById(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("sale-id") Integer saleId
    ) {
        return ResponseEntity.ok(saleService.findById(user.userId(), saleId));
    }

    @PatchMapping("/{sale-id}/items/{item-id}/status")
    public ResponseEntity<SaleItemResponse> updateItemStatus(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("sale-id") Integer saleId,
            @PathVariable("item-id") Integer itemId,
            @RequestBody @Valid SaleItemStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(saleService.updateItemStatus(user.userId(), saleId, itemId, request));
    }
}
