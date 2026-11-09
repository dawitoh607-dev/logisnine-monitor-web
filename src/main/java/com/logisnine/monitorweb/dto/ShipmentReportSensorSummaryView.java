package com.logisnine.monitorweb.dto;

import lombok.Data;

@Data
public class ShipmentReportSensorSummaryView {

    private Long readingCount;

    private Integer loggerCount;

    private Double minTemperature;

    private Double maxTemperature;

    private Double avgTemperature;

    private Double avgHumidity;

    private Double maxShockG;
}