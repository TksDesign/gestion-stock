package com.franck.ecommerce.stock;

import java.util.List;

import com.franck.ecommerce.config.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shops/mine/stock")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SHOP_MANAGER')")
public class StockController {

    private final StockService stockService;

    @PostMapping
    public ResponseEntity<StockItemResponse> create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody @Valid StockItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stockService.create(user.userId(), request));
    }

    @GetMapping
    public ResponseEntity<List<StockItemResponse>> findAll(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(name = "lowStockOnly", defaultValue = "false") boolean lowStockOnly
    ) {
        return ResponseEntity.ok(stockService.findAll(user.userId(), lowStockOnly));
    }

    @GetMapping("/{item-id}")
    public ResponseEntity<StockItemResponse> findById(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("item-id") Integer itemId
    ) {
        return ResponseEntity.ok(stockService.findById(user.userId(), itemId));
    }

    @PutMapping("/{item-id}")
    public ResponseEntity<StockItemResponse> update(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("item-id") Integer itemId,
            @RequestBody @Valid StockItemRequest request
    ) {
        return ResponseEntity.ok(stockService.update(user.userId(), itemId, request));
    }

    @PatchMapping("/{item-id}/quantity")
    public ResponseEntity<StockItemResponse> adjustQuantity(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("item-id") Integer itemId,
            @RequestBody @Valid StockAdjustmentRequest request
    ) {
        return ResponseEntity.ok(stockService.adjustQuantity(user.userId(), itemId, request));
    }

    @DeleteMapping("/{item-id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable("item-id") Integer itemId
    ) {
        stockService.delete(user.userId(), itemId);
        return ResponseEntity.noContent().build();
    }
}
