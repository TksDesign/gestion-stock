package com.franck.ecommerce.shop;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.handler.BusinessException;
import com.franck.ecommerce.handler.ResourceNotFoundException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ShopServiceTest {

    @Mock
    private ShopRepository shopRepository;

    private ShopService service;

    @BeforeEach
    void setUp() {
        service = new ShopService(shopRepository);
    }

    private static Shop shop(Integer id, String managerId, ShopStatus status) {
        return Shop.builder().id(id).name("Boutique " + id).managerId(managerId).status(status).build();
    }

    @Test
    void createShop_withNewManager_createsActiveShop() {
        var request = new CreateShopRequest("Boutique Marie", "desc", "rue", "ville", "75000", "manager-1", "marie@kshop.com");
        when(shopRepository.existsByManagerId("manager-1")).thenReturn(false);
        when(shopRepository.save(any(Shop.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.createShop(request);

        assertThat(response.name()).isEqualTo("Boutique Marie");
        assertThat(response.status()).isEqualTo(ShopStatus.ACTIVE);
        assertThat(response.managerId()).isEqualTo("manager-1");
    }

    @Test
    void createShop_whenManagerAlreadyAssigned_throwsBusinessException() {
        var request = new CreateShopRequest("Boutique Marie", "desc", "rue", "ville", "75000", "manager-1", "marie@kshop.com");
        when(shopRepository.existsByManagerId("manager-1")).thenReturn(true);

        assertThatThrownBy(() -> service.createShop(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already assigned");

        verify(shopRepository, never()).save(any());
    }

    @Test
    void findAll_mapsEveryStoredShop() {
        when(shopRepository.findAll()).thenReturn(List.of(shop(1, "m1", ShopStatus.ACTIVE), shop(2, "m2", ShopStatus.INACTIVE)));

        var result = service.findAll();

        assertThat(result).hasSize(2);
    }

    @Test
    void findById_withExistingId_returnsMappedResponse() {
        when(shopRepository.findById(1)).thenReturn(Optional.of(shop(1, "m1", ShopStatus.ACTIVE)));

        var response = service.findById(1);

        assertThat(response.id()).isEqualTo(1);
    }

    @Test
    void findById_withUnknownId_throwsResourceNotFoundException() {
        when(shopRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(999))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void findByManagerId_withAssignedShop_returnsMappedResponse() {
        when(shopRepository.findByManagerId("manager-1")).thenReturn(Optional.of(shop(1, "manager-1", ShopStatus.ACTIVE)));

        var response = service.findByManagerId("manager-1");

        assertThat(response.managerId()).isEqualTo("manager-1");
    }

    @Test
    void findByManagerId_withoutAssignedShop_throwsResourceNotFoundException() {
        when(shopRepository.findByManagerId("manager-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findByManagerId("manager-1"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getShopEntityByManagerId_withoutAssignedShop_throwsResourceNotFoundException() {
        when(shopRepository.findByManagerId("manager-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getShopEntityByManagerId("manager-1"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateShopByAdmin_updatesAllFieldsRegardlessOfManager() {
        var existing = shop(1, "manager-1", ShopStatus.ACTIVE);
        when(shopRepository.findById(1)).thenReturn(Optional.of(existing));
        when(shopRepository.save(any(Shop.class))).thenAnswer(inv -> inv.getArgument(0));
        var request = new ShopRequest("Nouveau nom", "nouvelle desc", "rue2", "ville2", "75001");

        var response = service.updateShopByAdmin(1, request);

        assertThat(response.name()).isEqualTo("Nouveau nom");
        assertThat(response.city()).isEqualTo("ville2");
    }

    @Test
    void updateShopByAdmin_withUnknownId_throwsResourceNotFoundException() {
        when(shopRepository.findById(999)).thenReturn(Optional.empty());
        var request = new ShopRequest("Nom", null, null, null, null);

        assertThatThrownBy(() -> service.updateShopByAdmin(999, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateShopStatus_changesStatusAndSaves() {
        var existing = shop(1, "manager-1", ShopStatus.ACTIVE);
        when(shopRepository.findById(1)).thenReturn(Optional.of(existing));
        when(shopRepository.save(any(Shop.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.updateShopStatus(1, ShopStatus.INACTIVE);

        assertThat(response.status()).isEqualTo(ShopStatus.INACTIVE);
    }

    @Test
    void updateMyShop_scopedToManagerId_updatesFields() {
        var existing = shop(1, "manager-1", ShopStatus.ACTIVE);
        when(shopRepository.findByManagerId("manager-1")).thenReturn(Optional.of(existing));
        when(shopRepository.save(any(Shop.class))).thenAnswer(inv -> inv.getArgument(0));
        var request = new ShopRequest("Ma boutique", "desc", "rue", "ville", "75000");

        var response = service.updateMyShop("manager-1", request);

        assertThat(response.name()).isEqualTo("Ma boutique");
    }

    @Test
    void updateMyShop_withoutAssignedShop_throwsResourceNotFoundException() {
        when(shopRepository.findByManagerId("manager-1")).thenReturn(Optional.empty());
        var request = new ShopRequest("Nom", null, null, null, null);

        assertThatThrownBy(() -> service.updateMyShop("manager-1", request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void assignManager_toUnassignedShop_setsManagerFields() {
        var existing = shop(1, null, ShopStatus.ACTIVE);
        when(shopRepository.existsByManagerId("manager-2")).thenReturn(false);
        when(shopRepository.findById(1)).thenReturn(Optional.of(existing));
        when(shopRepository.save(any(Shop.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.assignManager(1, "manager-2", "sophie@kshop.com");

        assertThat(response.managerId()).isEqualTo("manager-2");
        assertThat(response.managerEmail()).isEqualTo("sophie@kshop.com");
    }

    @Test
    void assignManager_whenManagerAlreadyAssignedElsewhere_throwsBusinessException() {
        when(shopRepository.existsByManagerId("manager-2")).thenReturn(true);

        assertThatThrownBy(() -> service.assignManager(1, "manager-2", "sophie@kshop.com"))
                .isInstanceOf(BusinessException.class);

        verify(shopRepository, never()).findById(any());
    }

    @Test
    void assignManager_withUnknownShopId_throwsResourceNotFoundException() {
        when(shopRepository.existsByManagerId("manager-2")).thenReturn(false);
        when(shopRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.assignManager(999, "manager-2", "sophie@kshop.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
