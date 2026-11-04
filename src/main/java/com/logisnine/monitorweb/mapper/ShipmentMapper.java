package com.logisnine.monitorweb.mapper;

import com.logisnine.monitorweb.domain.Shipment;
import com.logisnine.monitorweb.dto.DriverCheckInForm;
import com.logisnine.monitorweb.dto.DriverCheckInView;
import com.logisnine.monitorweb.dto.JudgementRuleView;
import com.logisnine.monitorweb.dto.LatestReadingView;
import com.logisnine.monitorweb.dto.MapAlertView;
import com.logisnine.monitorweb.dto.ReadingChartView;
import com.logisnine.monitorweb.dto.RoutePointView;
import com.logisnine.monitorweb.dto.ShipmentDetailView;
import com.logisnine.monitorweb.dto.ShipmentListView;
import com.logisnine.monitorweb.dto.ShipmentRegisterForm;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ShipmentMapper {

    ShipmentDetailView findDetailById(@Param("shipmentId") Long shipmentId);

    List<LatestReadingView> findLatestReadings(
            @Param("shipmentId") Long shipmentId,
            @Param("startedAt") LocalDateTime startedAt,
            @Param("endedAt") LocalDateTime endedAt
    );

    List<ShipmentDetailView.AlertView> findAlertsByShipmentId(@Param("shipmentId") Long shipmentId);

    List<ReadingChartView> findReadingsForChart(
            @Param("shipmentId") Long shipmentId,
            @Param("loggerId") String loggerId,
            @Param("startedAt") LocalDateTime startedAt,
            @Param("endedAt") LocalDateTime endedAt
    );

    List<RoutePointView> findRoutePoints(
            @Param("shipmentId") Long shipmentId,
            @Param("startedAt") LocalDateTime startedAt,
            @Param("endedAt") LocalDateTime endedAt
    );

    List<MapAlertView> findMapAlerts(@Param("shipmentId") Long shipmentId);

    List<ShipmentListView> findShipmentList();


    List<JudgementRuleView> findEnabledRules();

    void insertShipment(ShipmentRegisterForm form);

    void insertDeviceAssignment(
            @Param("shipmentId") Long shipmentId,
            @Param("gatewayId") String gatewayId
    );

    DriverCheckInView findDriverCheckInByGatewayId(@Param("gatewayId") String gatewayId);

    int updateDriverInfo(DriverCheckInForm form);
}
