package com.logisnine.monitorweb.mapper;

import com.logisnine.monitorweb.domain.Shipment;
import com.logisnine.monitorweb.dto.LatestReadingView;
import com.logisnine.monitorweb.dto.ReadingChartView;
import com.logisnine.monitorweb.dto.ShipmentDetailView;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ShipmentMapper {
    ShipmentDetailView findDetailById(@Param("shipmentId") Long shipmentId);

    List<LatestReadingView> findLatestReadings(
            @Param("gatewayId") String gatewayId,
            @Param("startedAt") LocalDateTime startedAt,
            @Param("endedAt") LocalDateTime endedAt
    );

    List<ShipmentDetailView.AlertView> findAlertsByShipmentId(@Param("shipmentId") Long shipmentId);

    List<ReadingChartView> findReadingsForChart(
            @Param("gatewayId") String gatewayId,
            @Param("loggerId") String loggerId,
            @Param("startedAt") LocalDateTime startedAt,
            @Param("endedAt") LocalDateTime endedAt
    );
}
