package com.logisnine.monitorweb.domain;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Shipment {

    private Long shipmentId;

    private String gatewayId;
    private Long ruleId;

    private String cargoName;

    private String departureLocation;
    private String destinationLocation;

    private Double departureLatitude;
    private Double departureLongitude;

    private Double destinationLatitude;
    private Double destinationLongitude;

    private String vehicleNumber;
    private String driverName;
    private String status;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}