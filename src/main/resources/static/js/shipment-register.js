const places = new kakao.maps.services.Places();


function searchDeparture() {

    const keyword = document
        .getElementById("departureKeyword")
        .value
        .trim();

    if (!keyword) {
        alert("출발지를 입력해 주세요.");
        return;
    }

    places.keywordSearch(keyword, function (data, status) {

        if (status === kakao.maps.services.Status.OK) {

            renderPlaceResults(data, "departureResults", selectDeparture);

            return;
        }

        alert("검색 결과가 없습니다.");
    });
}


function searchDestination() {

    const keyword = document
        .getElementById("destinationKeyword")
        .value
        .trim();

    if (!keyword) {
        alert("도착지를 입력해 주세요.");
        return;
    }

    places.keywordSearch(keyword, function (data, status) {

        if (status === kakao.maps.services.Status.OK) {

            renderPlaceResults(data, "destinationResults", selectDestination);

            return;
        }

        alert("검색 결과가 없습니다.");
    });
}


function renderPlaceResults(places, containerId, selectCallback) {

    const container = document.getElementById(containerId);

    container.innerHTML = "";


    places.slice(0, 5).forEach(function (place) {

        const item = document.createElement("div");

        item.className = "place-result-item";


        const address = place.road_address_name || place.address_name || "";


        item.innerHTML = `
            <div class="place-name">
                ${escapeHtml(place.place_name)}
            </div>

            <div class="place-address">
                ${escapeHtml(address)}
            </div>
        `;


        item.addEventListener("click", function () {

            selectCallback(place);

            container.innerHTML = "";
        });


        container.appendChild(item);
    });
}


function selectDeparture(place) {

    document.getElementById("departureLocation").value = place.place_name;


    document.getElementById("departureLatitude").value = place.y;


    document.getElementById("departureLongitude").value = place.x;


    const selected = document.getElementById("selectedDeparture");


    selected.innerHTML = `
        <strong>${escapeHtml(place.place_name)}</strong>
        <span>
            ${escapeHtml(place.road_address_name || place.address_name || "")}
        </span>
    `;


    selected.style.display = "block";
}


function selectDestination(place) {

    document.getElementById("destinationLocation").value = place.place_name;


    document.getElementById("destinationLatitude").value = place.y;


    document.getElementById("destinationLongitude").value = place.x;


    const selected = document.getElementById("selectedDestination");


    selected.innerHTML = `
        <strong>${escapeHtml(place.place_name)}</strong>
        <span>
            ${escapeHtml(place.road_address_name || place.address_name || "")}
        </span>
    `;


    selected.style.display = "block";
}


document
    .getElementById("shipmentRegisterForm")
    .addEventListener("submit", function (event) {

        const departureLatitude = document.getElementById("departureLatitude").value;

        const destinationLatitude = document.getElementById("destinationLatitude").value;


        if (!departureLatitude) {

            event.preventDefault();

            alert("출발지를 검색하여 선택해 주세요.");

            return;
        }


        if (!destinationLatitude) {

            event.preventDefault();

            alert("도착지를 검색하여 선택해 주세요.");
        }
    });


function escapeHtml(value) {

    if (!value) {
        return "";
    }

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}