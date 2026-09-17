package com.franck.ecommerce.catalog;

import java.util.List;

import com.franck.ecommerce.config.AuthenticatedUser;
import com.franck.ecommerce.handler.BusinessException;
import com.franck.ecommerce.sale.SaleResponse;
import com.franck.ecommerce.sale.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Suivi de commande côté client : distinct de /catalog/products/** (public) — cette route
// nécessite d'être authentifié pour ne renvoyer que les commandes du client courant, voir
// le matcher dédié dans SecurityConfig (plus spécifique que le permitAll de /catalog/**).
@RestController
@RequestMapping("/api/v1/shops/catalog/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final SaleService saleService;

    @GetMapping("/mine")
    public ResponseEntity<List<SaleResponse>> findMyOrders(@AuthenticationPrincipal AuthenticatedUser user) {
        if (user == null || user.customerId() == null) {
            throw new BusinessException("No customer profile associated with this account");
        }
        return ResponseEntity.ok(saleService.findMyOrders(user.customerId()));
    }
}
