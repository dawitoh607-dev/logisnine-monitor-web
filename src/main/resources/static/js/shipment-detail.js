document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.querySelector(".container");

    const loggerSelect =
        document.getElementById("loggerSelect");

    const canvas =
        document.getElementById("temperatureChart");

    if (!container || !loggerSelect || !canvas) {
        return;
    }


    const shipmentId =
        container.dataset.shipmentId;

    let chart = null;


    // =====================================================
    // readings 조회
    // =====================================================

    async function loadReadings(loggerId) {

        try {

            const response = await fetch(
                `/shipments/${shipmentId}/readings`
                + `?loggerId=${encodeURIComponent(loggerId)}`
            );


            if (!response.ok) {
                throw new Error(
                    `HTTP Error: ${response.status}`
                );
            }


            const readings =
                await response.json();


            drawChart(readings);

        } catch (error) {

            console.error(
                "readings 조회 실패:",
                error
            );

        }
    }


    // =====================================================
    // Chart
    // =====================================================

    function drawChart(readings) {

        const tempMin = Number(canvas.dataset.tempMin);
        const tempMax = Number(canvas.dataset.tempMax);

        const hasTempRule =
            Number.isFinite(tempMin)
            && Number.isFinite(tempMax);


        // =====================================================
        // X축 시간
        // =====================================================

        const labels = readings.map(reading => {

            if (!reading.measuredAt) {
                return "";
            }

            // 2026-10-27T14:10:00
            // -> 14:10
            return reading.measuredAt.substring(11, 16);

        });


        // =====================================================
        // 실제 측정값
        // =====================================================

        const temperatures =
            readings.map(reading => reading.temperature);

        const humidities =
            readings.map(reading => reading.humidity);


        // =====================================================
        // Dataset
        // =====================================================

        const datasets = [];


        /*
         * 정상 온도 범위 하단
         *
         * 화면에는 선을 표시하지 않고
         * 정상범위 배경을 만들기 위한 기준선으로만 사용
         */
        if (hasTempRule) {

            datasets.push({

                label: "__TEMP_RANGE_MIN__",

                data: readings.map(() => tempMin),

                yAxisID: "yTemperature",

                borderColor: "rgba(0, 0, 0, 0)",

                backgroundColor: "rgba(22, 119, 255, 0.08)",

                borderWidth: 0,

                pointRadius: 0,
                pointHoverRadius: 0,

                tension: 0,

                fill: false,

                order: 10

            });


            /*
             * 정상 온도 범위 상단
             *
             * 바로 앞 dataset(tempMin)까지 채워서
             * -20 ~ -15℃ 범위를 색칠
             */
            datasets.push({

                label: "정상 온도 범위",

                data: readings.map(() => tempMax),

                yAxisID: "yTemperature",

                borderColor: "rgba(0, 0, 0, 0)",

                backgroundColor: "rgba(22, 119, 255, 0.08)",

                borderWidth: 0,

                pointRadius: 0,
                pointHoverRadius: 0,

                tension: 0,

                fill: "-1",

                order: 10

            });

        }


        // =====================================================
        // 온도
        // =====================================================

        datasets.push({

            label: "온도 (℃)",

            data: temperatures,

            yAxisID: "yTemperature",

            borderColor: "#1677ff",
            backgroundColor: "#1677ff",

            borderWidth: 3,

            pointRadius: 0,
            pointHoverRadius: 4,

            tension: 0.35,

            fill: false,

            order: 1

        });


        // =====================================================
        // 습도
        // =====================================================

        datasets.push({

            label: "습도 (%)",

            data: humidities,

            yAxisID: "yHumidity",

            borderColor: "#cccccc",
            backgroundColor: "#cccccc",

            borderWidth: 3,

            pointRadius: 0,
            pointHoverRadius: 4,

            tension: 0.35,

            fill: false,

            order: 1

        });


        // =====================================================
        // 온도 상한 / 하한
        // =====================================================

        if (hasTempRule) {

            // 상한
            datasets.push({

                label: `온도 상한 (${tempMax}℃)`,

                data: readings.map(() => tempMax),

                yAxisID: "yTemperature",

                borderColor: "#ff4d5a",
                backgroundColor: "#ff4d5a",

                borderWidth: 2,

                borderDash: [7, 6],

                pointRadius: 0,
                pointHoverRadius: 0,

                tension: 0,

                fill: false,

                order: 2

            });


            // 하한
            datasets.push({

                label: `온도 하한 (${tempMin}℃)`,

                data: readings.map(() => tempMin),

                yAxisID: "yTemperature",

                borderColor: "#ff9500",
                backgroundColor: "#ff9500",

                borderWidth: 2,

                borderDash: [7, 6],

                pointRadius: 0,
                pointHoverRadius: 0,

                tension: 0,

                fill: false,

                order: 2

            });

        }


        // 기존 Chart 제거
        if (chart) {
            chart.destroy();
        }


        // =====================================================
        // Chart 생성
        // =====================================================

        chart = new Chart(
            canvas,
            {

                type: "line",


                data: {

                    labels: labels,

                    datasets: datasets

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    interaction: {
                        mode: "index",
                        intersect: false
                    },


                    plugins: {


                        // =========================================
                        // 범례
                        // =========================================

                        legend: {

                            display: true,

                            position: "top",

                            labels: {

                                usePointStyle: true,

                                boxWidth: 12,

                                padding: 16,

                                font: {
                                    size: 12
                                },


                                // 정상범위 하단용 숨은 dataset은
                                // 범례에서 제외
                                filter: function (item) {

                                    return !item.text.startsWith("__");

                                }

                            }

                        },


                        // =========================================
                        // Tooltip
                        // =========================================

                        tooltip: {

                            // 정상범위/기준선은 tooltip에서 제외
                            filter: function (context) {

                                return (
                                    context.dataset.label === "온도 (℃)"
                                    ||
                                    context.dataset.label === "습도 (%)"
                                );

                            },


                            callbacks: {

                                label: function (context) {

                                    if (context.dataset.label === "온도 (℃)") {

                                        return ` 온도: ${context.parsed.y}℃`;

                                    }


                                    if (context.dataset.label === "습도 (%)") {

                                        return ` 습도: ${context.parsed.y}%`;

                                    }


                                    return "";

                                }

                            }

                        }

                    },


                    // =================================================
                    // 축
                    // =================================================

                    scales: {


                        // X축
                        x: {

                            grid: {
                                color: "#edf0f4"
                            },

                            ticks: {
                                color: "#68768a"
                            }

                        },


                        // 온도축
                        yTemperature: {

                            type: "linear",

                            position: "left",

                            suggestedMin:
                                hasTempRule
                                    ? tempMin - 1
                                    : undefined,

                            suggestedMax:
                                hasTempRule
                                    ? tempMax + 1
                                    : undefined,


                            title: {

                                display: true,

                                text: "온도 (℃)",

                                color: "#566273",

                                font: {
                                    size: 12,
                                    weight: "600"
                                }

                            },


                            ticks: {

                                color: "#68768a",

                                callback: function (value) {
                                    return value + "°";
                                }

                            },


                            grid: {

                                color: "#e9edf2"

                            }

                        },


                        // 습도축
                        yHumidity: {

                            type: "linear",

                            position: "right",


                            title: {

                                display: true,

                                text: "습도 (%)",

                                color: "#566273",

                                font: {
                                    size: 12,
                                    weight: "600"
                                }

                            },


                            ticks: {

                                color: "#68768a",

                                callback: function (value) {
                                    return value + "%";
                                }

                            },


                            // 오른쪽 축 Grid까지 그리면 복잡하므로 숨김
                            grid: {

                                drawOnChartArea: false

                            }

                        }

                    }

                }

            }
        );
    }


    // =====================================================
    // 로거 변경
    // =====================================================

    loggerSelect.addEventListener(
        "change",
        function () {

            loadReadings(this.value);

        }
    );


    // =====================================================
    // 최초 조회
    // =====================================================

    if (loggerSelect.value) {

        loadReadings(
            loggerSelect.value
        );

    }

    loadMap(shipmentId);
});

async function loadMap(shipmentId) {

    try {

        const [
            routeResponse,
            alertResponse
        ] = await Promise.all([

            fetch(`/shipments/${shipmentId}/route`),

            fetch(`/shipments/${shipmentId}/map-alerts`)

        ]);


        if (!routeResponse.ok) {

            throw new Error(
                `Route HTTP Error: ${routeResponse.status}`
            );
        }


        if (!alertResponse.ok) {

            throw new Error(
                `Alert HTTP Error: ${alertResponse.status}`
            );
        }


        const routePoints =
            await routeResponse.json();

        const alerts =
            await alertResponse.json();


        drawRouteMap(
            routePoints,
            alerts
        );


    } catch (error) {

        console.error(
            "지도 데이터 조회 실패:",
            error
        );

    }

}

function drawRouteMap(points, alerts) {

    const mapElement =
        document.getElementById("shipmentMap");

    if (!mapElement) {
        return;
    }


    // =====================================================
    // 출발지 / 도착지
    // =====================================================

    const departureLat =
        parseMapNumber(
            mapElement.dataset.departureLatitude
        );

    const departureLng =
        parseMapNumber(
            mapElement.dataset.departureLongitude
        );

    const destinationLat =
        parseMapNumber(
            mapElement.dataset.destinationLatitude
        );

    const destinationLng =
        parseMapNumber(
            mapElement.dataset.destinationLongitude
        );


    const departureName =
        mapElement.dataset.departureName
        || "출발지";

    const destinationName =
        mapElement.dataset.destinationName
        || "도착지";


    const departurePosition =
        departureLat !== null
        && departureLng !== null
            ? new kakao.maps.LatLng(
                departureLat,
                departureLng
            )
            : null;


    const destinationPosition =
        destinationLat !== null
        && destinationLng !== null
            ? new kakao.maps.LatLng(
                destinationLat,
                destinationLng
            )
            : null;


    // =====================================================
    // readings 경로 데이터
    // =====================================================

    const routePoints =
        (points || [])
            .map(point => {

                return {

                    ...point,

                    latitude:
                        Number(
                            point.latitude
                        ),

                    longitude:
                        Number(
                            point.longitude
                        )

                };

            })
            .filter(point =>

                Number.isFinite(
                    point.latitude
                )

                &&

                Number.isFinite(
                    point.longitude
                )

            );


    const routePath =
        routePoints.map(point =>

            new kakao.maps.LatLng(
                point.latitude,
                point.longitude
            )

        );


    // =====================================================
    // 지도 데이터가 없는 경우
    // =====================================================

    if (
        !departurePosition
        && !destinationPosition
        && routePath.length === 0
    ) {

        mapElement.innerHTML =
            `
            <div class="map-empty">
                지도 데이터가 없습니다.
            </div>
            `;

        return;
    }


    // =====================================================
    // 초기 중심
    // =====================================================

    let initialPosition;


    if (departurePosition) {

        initialPosition =
            departurePosition;

    } else if (routePath.length > 0) {

        initialPosition =
            routePath[0];

    } else {

        initialPosition =
            destinationPosition;

    }


    // 혹시 같은 영역에 다시 그리는 경우 대비
    mapElement.innerHTML = "";


    // =====================================================
    // Kakao Map
    // =====================================================

    const map =
        new kakao.maps.Map(
            mapElement,
            {
                center:
                initialPosition,

                level:
                    7
            }
        );

    const zoomControl =
        new kakao.maps.ZoomControl();


    map.addControl(
        zoomControl,
        kakao.maps.ControlPosition.RIGHT
    );

    // =====================================================
    // 지도 범위
    // =====================================================

    const bounds =
        new kakao.maps.LatLngBounds();

    let boundsCount = 0;


    function addBounds(position) {

        if (!position) {
            return;
        }

        bounds.extend(
            position
        );

        boundsCount++;

    }


    // =====================================================
    // Popup
    // =====================================================

    let activePopup = null;


    function closePopup() {

        if (!activePopup) {
            return;
        }

        activePopup.setMap(
            null
        );

        activePopup = null;

    }


    function showPopup(
        position,
        html
    ) {

        closePopup();


        const popup =
            document.createElement(
                "div"
            );

        popup.className =
            "kakao-map-popup";

        popup.innerHTML =
            html;


        activePopup =
            new kakao.maps.CustomOverlay({

                position:
                position,

                content:
                popup,

                xAnchor:
                    0.5,

                yAnchor:
                    1.35,

                zIndex:
                    30,

                clickable:
                    true

            });


        activePopup.setMap(
            map
        );

    }


    kakao.maps.event.addListener(
        map,
        "click",
        function () {

            closePopup();

        }
    );


    // =====================================================
    // 출발지
    // =====================================================

    if (departurePosition) {

        createLocationMarker(
            map,
            departurePosition,
            "출발",
            departureName,
            "departure",
            showPopup
        );


        addBounds(
            departurePosition
        );

    }


    // =====================================================
    // 도착지
    // =====================================================

    if (destinationPosition) {

        createLocationMarker(
            map,
            destinationPosition,
            "도착",
            destinationName,
            "destination",
            showPopup
        );


        addBounds(
            destinationPosition
        );

    }


    // =====================================================
    // 실제 이동 경로
    // =====================================================

    if (routePath.length >= 2) {

        const polyline =
            new kakao.maps.Polyline({

                path:
                routePath,

                strokeWeight:
                    4,

                strokeColor:
                    "#2878e8",

                strokeOpacity:
                    0.85,

                strokeStyle:
                    "solid"

            });


        polyline.setMap(
            map
        );

    }


    routePath.forEach(
        position => {

            addBounds(
                position
            );

        }
    );


    // =====================================================
    // 현재 위치
    // =====================================================

    if (routePoints.length > 0) {

        const lastReading =
            routePoints[
            routePoints.length - 1
                ];


        const currentPosition =
            new kakao.maps.LatLng(
                lastReading.latitude,
                lastReading.longitude
            );


        createCurrentMarker(
            map,
            currentPosition,
            lastReading,
            showPopup
        );

    }


    // =====================================================
    // Alert 위치
    // =====================================================

    (alerts || [])
        .forEach(alert => {

            const latitude =
                Number(
                    alert.latitude
                );

            const longitude =
                Number(
                    alert.longitude
                );


            if (
                !Number.isFinite(latitude)
                || !Number.isFinite(longitude)
            ) {
                return;
            }


            const position =
                new kakao.maps.LatLng(
                    latitude,
                    longitude
                );


            createAlertMarker(
                map,
                position,
                alert,
                showPopup
            );


            addBounds(
                position
            );

        });


    // =====================================================
    // 전체 위치 화면에 맞추기
    // =====================================================

    if (boundsCount >= 2) {

        map.setBounds(
            bounds,
            50,
            50,
            50,
            50
        );

    } else {

        map.setCenter(
            initialPosition
        );

    }

}

function formatMapTime(value) {

    if (!value) {
        return "";
    }

    // 2026-10-27T14:10:00
    // ↓
    // 10.27 14:10

    return (
        value.substring(5, 10).replace("-", ".")
        + " "
        + value.substring(11, 16)
    );

}

function createAlertPopup(alert) {

    let title;
    let valueText;
    let thresholdText;


    // =====================================================
    // 온도 상한
    // =====================================================

    if (alert.alertType === "TEMP_HIGH") {

        title = "온도 상한 이탈";

        valueText =
            `${alert.extremeValue}℃`;

        thresholdText =
            `상한 ${alert.thresholdValue}℃`;

    }


        // =====================================================
        // 온도 하한
    // =====================================================

    else if (alert.alertType === "TEMP_LOW") {

        title = "온도 하한 이탈";

        valueText =
            `${alert.extremeValue}℃`;

        thresholdText =
            `하한 ${alert.thresholdValue}℃`;

    }


        // =====================================================
        // 충격
    // =====================================================

    else if (alert.alertType === "SHOCK") {

        title = "충격 발생";

        valueText =
            `${alert.extremeValue}G`;

        thresholdText =
            `기준 ${alert.thresholdValue}G`;

    }


    else {

        title =
            alert.alertType;

        valueText =
            alert.extremeValue ?? "-";

        thresholdText =
            alert.thresholdValue ?? "-";

    }


    return `
        <div class="map-alert-popup">

            <strong>
                ${title}
            </strong>

            <div>
                ${alert.loggerId}
            </div>

            <div>
                ${valueText}
                ·
                ${thresholdText}
            </div>

            <div>
                ${formatMapTime(alert.detectedAt)}
            </div>

        </div>
    `;
}

function parseMapNumber(value) {

    if (
        value === undefined
        || value === null
        || value === ""
    ) {
        return null;
    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : null;

}

function createLocationMarker(
    map,
    position,
    label,
    locationName,
    type,
    showPopup
) {

    const markerElement =
        document.createElement(
            "div"
        );


    markerElement.className =
        `kakao-location-marker ${type}`;


    markerElement.innerHTML =
        `
        <div class="location-pin">

            <i class="bi bi-geo-alt-fill"></i>

        </div>

        <div class="location-label">
            ${label}
        </div>
        `;


    markerElement.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            showPopup(
                position,
                `
                <strong>
                    ${label}지
                </strong>

                <div class="popup-text">
                    ${escapeHtml(
                    locationName
                )}
                </div>
                `
            );

        }
    );


    new kakao.maps.CustomOverlay({

        map:
        map,

        position:
        position,

        content:
        markerElement,

        xAnchor:
            0.5,

        yAnchor:
            1,

        zIndex:
            20,

        clickable:
            true

    });

}

function createCurrentMarker(
    map,
    position,
    reading,
    showPopup
) {

    const markerElement =
        document.createElement(
            "div"
        );


    markerElement.className =
        "kakao-current-marker";


    markerElement.innerHTML =
        `
        <div class="current-dot"></div>

        <div class="current-label">
            현재 위치
        </div>
        `;


    markerElement.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            showPopup(
                position,
                `
                <strong>
                    현재 위치
                </strong>

                <div class="popup-text">
                    ${formatMapTime(
                    reading.measuredAt
                )}
                </div>
                `
            );

        }
    );


    new kakao.maps.CustomOverlay({

        map:
        map,

        position:
        position,

        content:
        markerElement,

        xAnchor:
            0.5,

        yAnchor:
            0.5,

        zIndex:
            25,

        clickable:
            true

    });

}

function createAlertMarker(
    map,
    position,
    alert,
    showPopup
) {

    const isTemperature =
        alert.alertType === "TEMP_HIGH"
        || alert.alertType === "TEMP_LOW";


    const markerElement =
        document.createElement(
            "div"
        );


    markerElement.className =
        isTemperature
            ? "kakao-alert-marker temperature"
            : "kakao-alert-marker shock";


    markerElement.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            showPopup(
                position,
                createAlertPopup(
                    alert
                )
            );

        }
    );


    new kakao.maps.CustomOverlay({

        map:
        map,

        position:
        position,

        content:
        markerElement,

        xAnchor:
            0.5,

        yAnchor:
            0.5,

        zIndex:
            15,

        clickable:
            true

    });

}

function escapeHtml(value) {

    if (value == null) {
        return "";
    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            "\"",
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}