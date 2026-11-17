package com.logisnine.monitorweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShipmentListView {

    private Long shipmentId;

    private String gatewayId;

    private String cargoName;

    private String departureLocation;
    private String destinationLocation;

    private String vehicleNumber;

    private String status;
    private String statusName;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;

    private Integer tempDeviationCount;
    private Integer shockCount;
    private Integer activeTempAlertCount;

    // 메인 관제 지도 / 선택 패널용 최신 측정값
    private String latestLoggerId;
    private Double latestTemperature;
    private Double latestHumidity;
    private Integer latestBatteryPct;
    private LocalDateTime latestMeasuredAt;

    private Double markerLatitude;
    private Double markerLongitude;
}
