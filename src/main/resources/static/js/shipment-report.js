document.addEventListener(
    "DOMContentLoaded",
    function () {

        const mapElement =
            document.getElementById("reportMap");

        if (!mapElement) {
            return;
        }


        const shipmentId =
            mapElement.dataset.shipmentId;


        loadReportMap(
            shipmentId,
            mapElement
        );
    }
);


async function loadReportMap(
    shipmentId,
    mapElement
) {

    try {

        const [
            routeResponse,
            alertResponse
        ] = await Promise.all([

            fetch(
                `/shipments/${shipmentId}/route`
            ),

            fetch(
                `/shipments/${shipmentId}/map-alerts`
            )

        ]);


        if (!routeResponse.ok
            || !alertResponse.ok) {

            throw new Error(
                "지도 데이터를 조회하지 못했습니다."
            );
        }


        const route =
            await routeResponse.json();


        const alerts =
            await alertResponse.json();


        drawReportMap(
            mapElement,
            route,
            alerts
        );


    } catch (error) {

        console.error(
            error
        );


        mapElement.innerHTML =
            `
            <div style="
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                color:#8794a6;
                font-size:13px;
            ">
                운행 경로를 불러오지 못했습니다.
            </div>
            `;
    }
}


function drawReportMap(
    mapElement,
    route,
    alerts
) {

    const departureLat =
        Number(
            mapElement.dataset.departureLatitude
        );

    const departureLng =
        Number(
            mapElement.dataset.departureLongitude
        );

    const destinationLat =
        Number(
            mapElement.dataset.destinationLatitude
        );

    const destinationLng =
        Number(
            mapElement.dataset.destinationLongitude
        );


    const points =
        (route || [])
            .filter(point =>
                Number.isFinite(
                    Number(point.latitude)
                )
                &&
                Number.isFinite(
                    Number(point.longitude)
                )
            )
            .map(point =>
                new kakao.maps.LatLng(
                    Number(point.latitude),
                    Number(point.longitude)
                )
            );


    const departure =
        Number.isFinite(departureLat)
        && Number.isFinite(departureLng)
            ? new kakao.maps.LatLng(
                departureLat,
                departureLng
            )
            : null;


    const destination =
        Number.isFinite(destinationLat)
        && Number.isFinite(destinationLng)
            ? new kakao.maps.LatLng(
                destinationLat,
                destinationLng
            )
            : null;


    const center =
        departure
        || points[0]
        || destination;


    if (!center) {

        mapElement.innerHTML =
            "지도 데이터가 없습니다.";

        return;
    }


    const map =
        new kakao.maps.Map(
            mapElement,
            {
                center: center,
                level: 7
            }
        );


    const bounds =
        new kakao.maps.LatLngBounds();


    if (departure) {

        new kakao.maps.Marker({
            map: map,
            position: departure
        });

        bounds.extend(
            departure
        );
    }


    if (destination) {

        new kakao.maps.Marker({
            map: map,
            position: destination
        });

        bounds.extend(
            destination
        );
    }


    if (points.length >= 2) {

        const polyline =
            new kakao.maps.Polyline({

                path: points,

                strokeWeight: 4,

                strokeColor: "#2878e8",

                strokeOpacity: 0.85,

                strokeStyle: "solid"

            });


        polyline.setMap(
            map
        );
    }


    points.forEach(
        point =>
            bounds.extend(point)
    );


    (alerts || []).forEach(
        alert => {

            const latitude =
                Number(alert.latitude);

            const longitude =
                Number(alert.longitude);


            if (!Number.isFinite(latitude)
                || !Number.isFinite(longitude)) {

                return;
            }


            const position =
                new kakao.maps.LatLng(
                    latitude,
                    longitude
                );


            const element =
                document.createElement(
                    "div"
                );


            const isTemperature =
                alert.alertType === "TEMP_HIGH"
                || alert.alertType === "TEMP_LOW";


            element.className =
                isTemperature
                    ? "report-map-alert temperature"
                    : "report-map-alert shock";


            new kakao.maps.CustomOverlay({

                map: map,

                position: position,

                content: element,

                xAnchor: 0.5,

                yAnchor: 0.5

            });


            bounds.extend(
                position
            );
        }
    );


    map.setBounds(
        bounds,
        40,
        40,
        40,
        40
    );
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // =============================================
        // 지도
        // =============================================

        const mapElement =
            document.getElementById("reportMap");

        if (mapElement) {

            const shipmentId =
                mapElement.dataset.shipmentId;

            loadReportMap(
                shipmentId,
                mapElement
            );
        }


        // =============================================
        // 온도 / 습도 Chart
        // =============================================

        const loggerSelect =
            document.getElementById(
                "reportLoggerSelect"
            );

        const chartCanvas =
            document.getElementById(
                "reportTemperatureChart"
            );


        if (loggerSelect && chartCanvas) {

            const shipmentId =
                mapElement.dataset.shipmentId;


            loadReportReadings(
                shipmentId,
                loggerSelect.value,
                chartCanvas
            );


            loggerSelect.addEventListener(
                "change",
                function () {

                    loadReportReadings(
                        shipmentId,
                        this.value,
                        chartCanvas
                    );
                }
            );
        }

    }
);

let reportChart = null;


/* =====================================================
   온도 / 습도 데이터 조회
===================================================== */

async function loadReportReadings(
    shipmentId,
    loggerId,
    canvas
) {

    try {

        const response =
            await fetch(
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


        drawReportChart(
            readings,
            canvas
        );


    } catch (error) {

        console.error(
            "리포트 그래프 조회 실패:",
            error
        );
    }
}

function drawReportChart(
    readings,
    canvas
) {

    const tempMin =
        Number(canvas.dataset.tempMin);

    const tempMax =
        Number(canvas.dataset.tempMax);

    const labels =
        readings.map(
            reading => {

                if (!reading.measuredAt) {
                    return "";
                }


                /*
                 * 2026-11-05T14:10:00
                 * →
                 * 11.05 14:10
                 */

                const date =
                    reading.measuredAt
                        .substring(5, 10)
                        .replace("-", ".");

                const time =
                    reading.measuredAt
                        .substring(11, 16);


                return `${date} ${time}`;
            }
        );


    const temperatures =
        readings.map(
            reading =>
                reading.temperature
        );


    const humidities =
        readings.map(
            reading =>
                reading.humidity
        );

    const minTemperatureLine =
        readings.map(() => tempMin);

    const maxTemperatureLine =
        readings.map(() => tempMax);

    if (reportChart) {

        reportChart.destroy();
    }


    reportChart =
        new Chart(
            canvas,
            {

                type: "line",


                data: {

                    labels: labels,


                    datasets: [

                        {
                            label: "온도 (℃)",

                            data: temperatures,

                            yAxisID: "yTemperature",

                            borderColor: "#1677ff",

                            backgroundColor: "#1677ff",

                            borderWidth: 2,

                            pointRadius: 0,

                            pointHoverRadius: 4,

                            tension: 0.25
                        },

                        {
                            label: `상한 ${tempMax}℃`,

                            data: maxTemperatureLine,

                            yAxisID: "yTemperature",

                            borderColor: "#ef4444",

                            borderWidth: 1.5,

                            borderDash: [6, 5],

                            pointRadius: 0,

                            pointHoverRadius: 0,

                            tension: 0
                        },


                        {
                            label: `하한 ${tempMin}℃`,

                            data: minTemperatureLine,

                            yAxisID: "yTemperature",

                            borderColor: "#f59e0b",

                            borderWidth: 1.5,

                            borderDash: [6, 5],

                            pointRadius: 0,

                            pointHoverRadius: 0,

                            tension: 0
                        },

                        {
                            label: "습도 (%)",

                            data: humidities,

                            yAxisID: "yHumidity",

                            borderColor: "#9aa5b5",

                            backgroundColor: "#9aa5b5",

                            borderWidth: 2,

                            pointRadius: 0,

                            pointHoverRadius: 4,

                            tension: 0.25
                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    interaction: {

                        mode: "index",

                        intersect: false
                    },


                    plugins: {

                        legend: {

                            position: "top",

                            labels: {

                                usePointStyle: true,

                                boxWidth: 8,

                                padding: 18,

                                font: {
                                    size: 12
                                }
                            }
                        },


                        tooltip: {

                            callbacks: {

                                label: function (context) {

                                    const label =
                                        context.dataset.label;


                                    if (label === "온도 (℃)") {

                                        return ` 온도: ${context.parsed.y}℃`;
                                    }


                                    if (label === "습도 (%)") {

                                        return ` 습도: ${context.parsed.y}%`;
                                    }


                                    if (label.startsWith("상한")) {

                                        return ` 온도 상한: ${context.parsed.y}℃`;
                                    }


                                    if (label.startsWith("하한")) {

                                        return ` 온도 하한: ${context.parsed.y}℃`;
                                    }


                                    return "";
                                }
                            }
                        }

                    },


                    scales: {

                        x: {

                            grid: {
                                display: false
                            },

                            ticks: {

                                maxTicksLimit: 7,

                                font: {
                                    size: 10
                                }
                            }
                        },


                        yTemperature: {

                            type: "linear",

                            position: "left",

                            title: {

                                display: true,

                                text: "온도 (℃)"
                            },

                            grid: {

                                color:
                                    "rgba(0, 0, 0, 0.05)"
                            }

                        },


                        yHumidity: {

                            type: "linear",

                            position: "right",

                            min: 0,

                            max: 100,

                            title: {

                                display: true,

                                text: "습도 (%)"
                            },

                            grid: {

                                drawOnChartArea: false
                            }

                        }

                    }

                }

            }
        );
}