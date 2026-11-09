package com.logisnine.monitorweb.mapper;

import com.logisnine.monitorweb.dto.GatewayView;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface GatewayMapper {

    List<GatewayView> findAvailableGateways();

    List<GatewayView> findAvailableGatewaysForShipment(
            @Param("shipmentId") Long shipmentId
    );

    boolean isGatewayAvailableForShipment(
            @Param("gatewayId") String gatewayId,
            @Param("shipmentId") Long shipmentId
    );
}