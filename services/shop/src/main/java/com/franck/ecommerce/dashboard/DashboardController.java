package com.franck.ecommerce.dashboard;

import com.franck.ecommerce.config.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shops/mine/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SHOP_MANAGER')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getDashboard(user.userId()));
    }
}
