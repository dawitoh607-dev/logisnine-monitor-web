package com.logisnine.monitorweb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentReportView {

    private ShipmentDetailView shipment;

    private ShipmentReportSensorSummaryView sensorSummary;

    private String elapsedTime;
}