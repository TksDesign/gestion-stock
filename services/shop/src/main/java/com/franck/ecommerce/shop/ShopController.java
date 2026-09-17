package com.franck.ecommerce.shop;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    // ---- Admin endpoints ----

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShopResponse> createShop(@RequestBody @Valid CreateShopRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(shopService.createShop(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ShopResponse>> findAll() {
        return ResponseEntity.ok(shopService.findAll());
    }

    @GetMapping("/{shop-id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShopResponse> findById(@PathVariable("shop-id") Integer shopId) {
        return ResponseEntity.ok(shopService.findById(shopId));
    }

    @PutMapping("/{shop-id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShopResponse> updateStatus(
            @PathVariable("shop-id") Integer shopId,
            @RequestParam ShopStatus status
    ) {
        return ResponseEntity.ok(shopService.updateShopStatus(shopId, status));
    }

    @PutMapping("/{shop-id}/manager")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShopResponse> assignManager(
            @PathVariable("shop-id") Integer shopId,
            @RequestParam String managerId,
            @RequestParam String managerEmail
    ) {
        return ResponseEntity.ok(shopService.assignManager(shopId, managerId, managerEmail));
    }

    // ---- Shop manager endpoints ----

    @GetMapping("/mine")
    @PreAuthorize("hasRole('SHOP_MANAGER')")
    public ResponseEntity<ShopResponse> getMyShop(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(shopService.findByManagerId(user.userId()));
    }

    @PutMapping("/mine")
    @PreAuthorize("hasRole('SHOP_MANAGER')")
    public ResponseEntity<ShopResponse> updateMyShop(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody @Valid ShopRequest request
    ) {
        return ResponseEntity.ok(shopService.updateMyShop(user.userId(), request));
    }
}
