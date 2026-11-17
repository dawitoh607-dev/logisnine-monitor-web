(() => {
    "use strict";

    const mapElement = document.getElementById("dashboardMap");
    const markerDataElements = [...document.querySelectorAll(".dashboard-marker-data")];

    if (!mapElement || typeof kakao === "undefined" || !kakao.maps) {
        return;
    }

    const panel = document.getElementById("selectedShipmentPanel");
    const hint = document.getElementById("mapHint");
    const closeButton = document.getElementById("closeSelectedPanel");

    const vehicleNumberEl = document.getElementById("selectedVehicleNumber");
    const cargoNameEl = document.getElementById("selectedCargoName");
    const gatewayIdEl = document.getElementById("selectedGatewayId");
    const temperatureEl = document.getElementById("selectedTemperature");
    const humidityEl = document.getElementById("selectedHumidity");
    const tempCountEl = document.getElementById("selectedTempCount");
    const shockCountEl = document.getElementById("selectedShockCount");
    const alertBadgeEl = document.getElementById("selectedAlertBadge");
    const statusBadgeEl = document.getElementById("selectedStatusBadge");
    const vehicleIconEl = document.getElementById("selectedVehicleIcon");
    const detailLinkEl = document.getElementById("selectedDetailLink");
    const reportButtonEl = document.getElementById("selectedReportButton");
    const chartCanvas = document.getElementById("dashboardTemperatureChart");
    const chartEmpty = document.getElementById("dashboardChartEmpty");

    let temperatureChart = null;
    let selectedMarkerElement = null;
    let selectedShipment = null;

    const map = new kakao.maps.Map(mapElement, {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 8
    });

    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

    const bounds = new kakao.maps.LatLngBounds();
    let markerCount = 0;

    markerDataElements.forEach((dataElement) => {
        const data = normalizeShipmentData(dataElement.dataset);

        if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) {
            return;
        }

        const position = new kakao.maps.LatLng(data.latitude, data.longitude);
        bounds.extend(position);
        markerCount += 1;

        const markerElement = createMarkerElement(data);

        markerElement.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            selectShipment(data, markerElement, position);
        });

        new kakao.maps.CustomOverlay({
            map,
            position,
            content: markerElement,
            yAnchor: 1.08,
            xAnchor: 0.5,
            zIndex: data.activeTempAlert ? 5 : 3
        });
    });

    if (markerCount > 0) {
        map.setBounds(bounds, 45, 45, 45, 45);
    }

    window.setTimeout(() => map.relayout(), 100);

    if (closeButton) {
        closeButton.addEventListener("click", closeSelectedShipment);
    }

    if (reportButtonEl) {
        reportButtonEl.addEventListener("click", () => {
            if (!selectedShipment) {
                return;
            }

            if (selectedShipment.status !== "COMPLETED") {
                window.alert("운송 완료 후 리포트를 확인할 수 있습니다.");
                return;
            }

            window.location.href = `/shipments/${selectedShipment.shipmentId}/report`;
        });
    }

    function normalizeShipmentData(dataset) {
        return {
            shipmentId: dataset.shipmentId,
            gatewayId: dataset.gatewayId || "-",
            vehicleNumber: dataset.vehicleNumber || dataset.gatewayId || "-",
            cargoName: dataset.cargoName || "-",
            status: dataset.status || "READY",
            statusName: dataset.statusName || dataset.status || "-",
            latitude: toNumber(dataset.latitude),
            longitude: toNumber(dataset.longitude),
            temperature: toNumber(dataset.temperature),
            humidity: toNumber(dataset.humidity),
            battery: toNumber(dataset.battery),
            loggerId: dataset.loggerId || "",
            tempCount: toInteger(dataset.tempCount),
            shockCount: toInteger(dataset.shockCount),
            activeTempAlert: dataset.activeTempAlert === "true"
        };
    }

    function createMarkerElement(data) {
        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = `vehicle-marker ${markerStatusClass(data)}`;
        marker.setAttribute("aria-label", `${data.vehicleNumber} 차량 선택`);

        const label = document.createElement("span");
        label.className = "vehicle-marker-label";
        label.textContent = data.vehicleNumber;

        const pin = document.createElement("span");
        pin.className = "vehicle-marker-pin";

        const icon = document.createElement("i");
        icon.className = "bi bi-truck";
        pin.appendChild(icon);

        marker.append(label, pin);
        return marker;
    }

    function markerStatusClass(data) {
        if (data.status === "READY") {
            return "ready";
        }

        if (data.activeTempAlert) {
            return "alert";
        }

        return "normal";
    }

    async function selectShipment(data, markerElement, position) {
        selectedShipment = data;

        if (selectedMarkerElement) {
            selectedMarkerElement.classList.remove("selected");
        }

        selectedMarkerElement = markerElement;
        selectedMarkerElement.classList.add("selected");

        if (hint) {
            hint.hidden = true;
        }

        if (panel) {
            panel.hidden = false;
        }

        renderSelectedPanel(data);
        map.panTo(position);

        if (data.status !== "READY" && data.loggerId) {
            await loadTemperatureChart(data);
        } else {
            renderEmptyChart();
        }
    }

    function renderSelectedPanel(data) {
        vehicleNumberEl.textContent = data.vehicleNumber;
        cargoNameEl.textContent = data.cargoName;
        gatewayIdEl.textContent = data.gatewayId;

        temperatureEl.textContent = Number.isFinite(data.temperature)
            ? `${data.temperature.toFixed(1)}℃`
            : "-";

        humidityEl.textContent = Number.isFinite(data.humidity)
            ? `습도 ${data.humidity.toFixed(1)}%`
            : "습도 -";

        tempCountEl.textContent = `${data.tempCount}건`;
        shockCountEl.textContent = `${data.shockCount}건`;

        alertBadgeEl.hidden = !data.activeTempAlert;

        statusBadgeEl.textContent = data.activeTempAlert ? "온도 이탈" : data.statusName;
        statusBadgeEl.className = "selected-status-badge";

        vehicleIconEl.className = "selected-vehicle-icon";

        if (data.status === "READY") {
            statusBadgeEl.classList.add("ready");
            vehicleIconEl.classList.add("ready");
        } else if (data.activeTempAlert) {
            statusBadgeEl.classList.add("alert");
            vehicleIconEl.classList.add("alert");
        }

        detailLinkEl.href = `/shipments/${data.shipmentId}`;
    }

    async function loadTemperatureChart(data) {
        chartEmpty.hidden = true;
        chartCanvas.hidden = false;

        try {
            const response = await fetch(
                `/shipments/${encodeURIComponent(data.shipmentId)}/readings?loggerId=${encodeURIComponent(data.loggerId)}`,
                {headers: {"Accept": "application/json"}}
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const readings = await response.json();
            const usableReadings = readings
                .filter((item) => item && item.measuredAt && item.temperature != null)
                .slice(-18);

            if (usableReadings.length === 0) {
                renderEmptyChart();
                return;
            }

            renderTemperatureChart(usableReadings, data.activeTempAlert);
        } catch (error) {
            console.error("대시보드 온도 차트 조회 실패", error);
            renderEmptyChart();
        }
    }

    function renderTemperatureChart(readings, isAlert) {
        if (temperatureChart) {
            temperatureChart.destroy();
        }

        const labels = readings.map((reading) => {
            const value = String(reading.measuredAt);
            return value.length >= 16 ? value.substring(11, 16) : value;
        });

        const values = readings.map((reading) => reading.temperature);
        const lineColor = isAlert ? "#ef3340" : "#1677ff";
        const fillColor = isAlert ? "rgba(239, 51, 64, 0.08)" : "rgba(22, 119, 255, 0.08)";

        chartEmpty.hidden = true;
        chartCanvas.hidden = false;

        temperatureChart = new Chart(chartCanvas, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    data: values,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    fill: true,
                    tension: 0.35
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: {mode: "index", intersect: false},
                plugins: {
                    legend: {display: false},
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.parsed.y}℃`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {display: false},
                        ticks: {
                            color: "#9aa5b3",
                            font: {size: 8},
                            maxTicksLimit: 4
                        }
                    },
                    y: {
                        grid: {color: "#edf0f4"},
                        border: {display: false},
                        ticks: {
                            color: "#9aa5b3",
                            font: {size: 8},
                            maxTicksLimit: 4,
                            callback: (value) => `${value}℃`
                        }
                    }
                }
            }
        });
    }

    function renderEmptyChart() {
        if (temperatureChart) {
            temperatureChart.destroy();
            temperatureChart = null;
        }

        chartCanvas.hidden = true;
        chartEmpty.hidden = false;
    }

    function closeSelectedShipment() {
        selectedShipment = null;

        if (selectedMarkerElement) {
            selectedMarkerElement.classList.remove("selected");
            selectedMarkerElement = null;
        }

        if (temperatureChart) {
            temperatureChart.destroy();
            temperatureChart = null;
        }

        if (panel) {
            panel.hidden = true;
        }

        if (hint) {
            hint.hidden = false;
        }
    }

    function toNumber(value) {
        if (value == null || value === "") {
            return NaN;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : NaN;
    }

    function toInteger(value) {
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : 0;
    }
})();
