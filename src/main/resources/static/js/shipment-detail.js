document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.querySelector(".container");

    const loggerSelect =
        document.getElementById("loggerSelect");

    const canvas =
        document.getElementById("temperatureChart");

    const tempMin =
        Number(canvas.dataset.tempMin);

    const tempMax =
        Number(canvas.dataset.tempMax);

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

            pointRadius: 4,
            pointHoverRadius: 6,

            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#1677ff",
            pointBorderWidth: 2,

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

            borderColor: "#00a892",
            backgroundColor: "#00a892",

            borderWidth: 3,

            pointRadius: 4,
            pointHoverRadius: 6,

            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#00a892",
            pointBorderWidth: 2,

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

});