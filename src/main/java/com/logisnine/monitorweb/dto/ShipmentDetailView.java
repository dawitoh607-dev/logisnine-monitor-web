package com.logisnine.monitorweb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDetailView {

    private Long shipmentId;

    private String cargoName;
    private String status;
    private String statusName;

    private String departureLocation;
    private String destinationLocation;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private String elapsedTime;

    private String gatewayId;

    private String vehicleNumber;
    private String driverName;

    private List<LatestReadingView> latestReadings;

    private String drivingStatus;

    private Integer tempDeviationCount;
    private Integer shockCount;

    private Double tempMin;
    private Double tempMax;
    private Integer tempHoldSeconds;
    private Double shockThresholdG;

    private List<AlertView> alerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertView {
        private Long alertId;

        private String loggerId;

        private String type;

        private LocalDateTime occurredAt;

        private Double extremeValue;
        private Double thresholdValue;
    }
}