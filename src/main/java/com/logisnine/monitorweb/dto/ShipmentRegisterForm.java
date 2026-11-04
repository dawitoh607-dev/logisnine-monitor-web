package com.logisnine.monitorweb.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class ShipmentRegisterForm {

    private Long shipmentId;

    private String cargoName;

    private String departureLocation;
    private Double departureLatitude;
    private Double departureLongitude;

    private String destinationLocation;
    private Double destinationLatitude;
    private Double destinationLongitude;

    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime plannedDepartureAt;

    private String driverPhone;

    private String gatewayId;

    private Long ruleId;
}