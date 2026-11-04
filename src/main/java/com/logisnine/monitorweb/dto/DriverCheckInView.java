package com.logisnine.monitorweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DriverCheckInView {

    private Long shipmentId;

    private String gatewayId;

    private String cargoName;

    private String departureLocation;

    private String destinationLocation;

    private LocalDateTime plannedDepartureAt;

    private String driverPhone;
}