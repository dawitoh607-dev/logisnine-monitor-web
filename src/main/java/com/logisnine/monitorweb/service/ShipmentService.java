package com.logisnine.monitorweb.service;

import com.logisnine.monitorweb.dto.JudgementRuleView;
import com.logisnine.monitorweb.dto.LatestReadingView;
import com.logisnine.monitorweb.dto.MapAlertView;
import com.logisnine.monitorweb.dto.ReadingChartView;
import com.logisnine.monitorweb.dto.RoutePointView;
import com.logisnine.monitorweb.dto.ShipmentDetailView;
import com.logisnine.monitorweb.dto.ShipmentListView;
import com.logisnine.monitorweb.dto.ShipmentRegisterForm;
import com.logisnine.monitorweb.dto.ShipmentReportSensorSummaryView;
import com.logisnine.monitorweb.dto.ShipmentReportView;
import com.logisnine.monitorweb.mapper.ShipmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentMapper shipmentMapper;

    private final GatewayService gatewayService;

    private static final long RECEIVE_DELAY_MINUTES = 10;
    private static final long RECEIVE_DISCONNECTED_MINUTES = 30;

    public ShipmentDetailView findDetailById(Long shipmentId) {

        ShipmentDetailView shipment = shipmentMapper.findDetailById(shipmentId);

        if (shipment == null) {
            throw new IllegalArgumentException("존재하지 않는 운송입니다. shipmentId=" + shipmentId);
        }

        if (shipment.getStartedAt() != null) {

            List<LatestReadingView> latestReadings = shipmentMapper.findLatestReadings(shipment.getShipmentId(), shipment.getStartedAt(), shipment.getEndedAt());

            applyReceiveStatus(latestReadings);

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
        int tempDeviationCount = (int) alerts.stream().filter(alert -> "TEMP_HIGH".equals(alert.getType()) || "TEMP_LOW".equals(alert.getType())).count();


        // 충격 건수
        int shockCount = (int) alerts.stream().filter(alert -> "SHOCK".equals(alert.getType())).count();


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

        return shipmentMapper.findReadingsForChart(shipment.getShipmentId(), loggerId, shipment.getStartedAt(), shipment.getEndedAt());
    }

    public List<RoutePointView> findRoutePoints(Long shipmentId) {

        ShipmentDetailView shipment = shipmentMapper.findDetailById(shipmentId);

        if (shipment == null) {
            throw new IllegalArgumentException("존재하지 않는 운송입니다. shipmentId=" + shipmentId);
        }

        if (shipment.getStartedAt() == null) {
            return List.of();
        }

        return shipmentMapper.findRoutePoints(shipment.getShipmentId(), shipment.getStartedAt(), shipment.getEndedAt());
    }

    public List<MapAlertView> findMapAlerts(Long shipmentId) {

        return shipmentMapper.findMapAlerts(shipmentId);
    }

    public List<ShipmentListView> findShipmentList() {

        List<ShipmentListView> shipments = shipmentMapper.findShipmentList();


        shipments.forEach(shipment -> {

            shipment.setStatusName(switch (shipment.getStatus()) {
                case "READY" -> "운송대기";
                case "IN_PROGRESS" -> "운송중";
                case "COMPLETED" -> "운송완료";
                default -> shipment.getStatus();
            });

        });

        return shipments;
    }

    @Transactional
    public Long registerShipment(ShipmentRegisterForm form) {

        shipmentMapper.insertShipment(form);

        shipmentMapper.insertDeviceAssignment(form.getShipmentId(), form.getGatewayId());

        return form.getShipmentId();
    }

    public List<JudgementRuleView> findEnabledRules() {
        return shipmentMapper.findEnabledRules();
    }

    @Transactional
    public void updateShipment(ShipmentRegisterForm form) {

        Long shipmentId = form.getShipmentId();

        String status = shipmentMapper.findShipmentStatus(shipmentId);

        if (!"READY".equals(status)) {
            throw new IllegalStateException("운송 대기 상태에서만 수정할 수 있습니다.");
        }

        boolean available = gatewayService.isGatewayAvailableForShipment(form.getGatewayId(), shipmentId);

        if (!available) {
            throw new IllegalStateException("이미 다른 운송에 배정된 Gateway입니다.");
        }

        String currentGatewayId = shipmentMapper.findCurrentGatewayId(shipmentId);

        int updated = shipmentMapper.updateShipment(form);

        if (updated == 0) {

            throw new IllegalStateException("운송정보를 수정할 수 없습니다.");
        }


        /*
         * Gateway가 변경된 경우에만
         * 배정 이력을 변경한다.
         */
        if (!java.util.Objects.equals(currentGatewayId, form.getGatewayId())) {

            shipmentMapper.closeCurrentAssignment(shipmentId);

            shipmentMapper.insertDeviceAssignment(shipmentId, form.getGatewayId());
        }
    }

    public ShipmentRegisterForm getEditForm(Long shipmentId) {

        return shipmentMapper.findEditForm(shipmentId);
    }

    @Transactional
    public void deleteShipment(Long shipmentId) {

        String status = shipmentMapper.findShipmentStatus(shipmentId);

        if (!"READY".equals(status)) {
            throw new IllegalStateException("운송 대기 상태에서만 삭제할 수 있습니다.");
        }

        shipmentMapper.deleteAlerts(shipmentId);

        shipmentMapper.deleteAssignments(shipmentId);

        int deleted = shipmentMapper.deleteShipment(shipmentId);

        if (deleted == 0) {
            throw new IllegalStateException("운송정보를 삭제할 수 없습니다.");
        }
    }

    public boolean isEditable(Long shipmentId) {

        return "READY".equals(shipmentMapper.findShipmentStatus(shipmentId));
    }

    private void applyReceiveStatus(List<LatestReadingView> readings) {

        if (readings == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));

        for (LatestReadingView reading : readings) {

            LocalDateTime receivedAt = reading.getReceivedAt();


            if (receivedAt == null) {

                reading.setReceiveStatus("UNKNOWN");

                reading.setReceiveDelayMinutes(null);

                continue;
            }


            long delayMinutes = Math.max(0, Duration.between(receivedAt, now).toMinutes());


            reading.setReceiveDelayMinutes(delayMinutes);


            if (delayMinutes > RECEIVE_DISCONNECTED_MINUTES) {

                reading.setReceiveStatus("DISCONNECTED");

            } else if (delayMinutes > RECEIVE_DELAY_MINUTES) {

                reading.setReceiveStatus("DELAY");

            } else {

                reading.setReceiveStatus("NORMAL");
            }
        }
    }

    public boolean isReportAvailable(Long shipmentId) {

        return "COMPLETED".equals(shipmentMapper.findShipmentStatus(shipmentId));
    }

    public ShipmentReportView findReportById(Long shipmentId) {

        ShipmentDetailView shipment = findDetailById(shipmentId);


        if (!"COMPLETED".equals(shipment.getStatus())) {

            throw new IllegalStateException("완료된 운송만 리포트를 확인할 수 있습니다.");
        }


        if (shipment.getStartedAt() == null || shipment.getEndedAt() == null) {

            throw new IllegalStateException("운송 시작/종료 시간이 없습니다.");
        }


        ShipmentReportSensorSummaryView sensorSummary = shipmentMapper.findReportSensorSummary(shipmentId, shipment.getStartedAt(), shipment.getEndedAt());


        /*
         * 리포트는 오래된 이벤트 → 최신 이벤트
         * 순서로 보이게 정렬
         */
        if (shipment.getAlerts() != null) {

            shipment.getAlerts().sort(
                    java.util.Comparator.comparing(ShipmentDetailView.AlertView::getOccurredAt, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()))
            );
        }


        java.time.Duration duration = java.time.Duration.between(shipment.getStartedAt(), shipment.getEndedAt());


        long hours = duration.toHours();

        long minutes = duration.toMinutesPart();


        String elapsedTime = hours + "시간 " + minutes + "분";


        return ShipmentReportView.builder()
                .shipment(shipment)
                .sensorSummary(sensorSummary)
                .elapsedTime(elapsedTime)
                .build();
    }
}