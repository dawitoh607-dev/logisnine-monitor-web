package com.logisnine.monitorweb.service;

import com.logisnine.monitorweb.dto.LatestReadingView;
import com.logisnine.monitorweb.dto.ReadingChartView;
import com.logisnine.monitorweb.dto.ShipmentDetailView;
import com.logisnine.monitorweb.mapper.ShipmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentMapper shipmentMapper;

    public ShipmentDetailView findDetailById(Long shipmentId) {

        ShipmentDetailView shipment = shipmentMapper.findDetailById(shipmentId);

        if (shipment == null) {
            throw new IllegalArgumentException("존재하지 않는 운송입니다. shipmentId=" + shipmentId);
        }

        if (shipment.getStartedAt() != null) {

            List<LatestReadingView> latestReadings =
                    shipmentMapper.findLatestReadings(
                            shipment.getGatewayId(),
                            shipment.getStartedAt(),
                            shipment.getEndedAt()
                    );

            shipment.setLatestReadings(latestReadings);
        } else {
            shipment.setLatestReadings(List.of());
        }

        // -------------------------------------------------
        // alerts
        // -------------------------------------------------

        List<ShipmentDetailView.AlertView> alerts = shipmentMapper.findAlertsByShipmentId(shipmentId);

        shipment.setAlerts(alerts);


        // 온도 이탈 건수
        int tempDeviationCount = (int) alerts.stream()
                .filter(alert ->
                        "TEMP_HIGH".equals(alert.getType())
                                || "TEMP_LOW".equals(alert.getType())
                )
                .count();


        // 충격 건수
        int shockCount = (int) alerts.stream()
                .filter(alert ->
                        "SHOCK".equals(alert.getType())
                )
                .count();


        shipment.setTempDeviationCount(tempDeviationCount);
        shipment.setShockCount(shockCount);

        return shipment;
    }

    public List<ReadingChartView> findReadingsForChart(Long shipmentId, String loggerId) {

        ShipmentDetailView shipment = shipmentMapper.findDetailById(shipmentId);

        if (shipment == null) {
            throw new IllegalArgumentException("존재하지 않는 운송입니다. shipmentId=" + shipmentId);
        }

        if (shipment.getStartedAt() == null) {
            return List.of();
        }

        return shipmentMapper.findReadingsForChart(
                shipment.getGatewayId(),
                loggerId,
                shipment.getStartedAt(),
                shipment.getEndedAt()
        );
    }
}