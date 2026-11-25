function selectShipment(button) {

    const shipmentId =
        button.dataset.shipmentId;

    const vehicleNumber =
        button.dataset.vehicleNumber;

    const cargoName =
        button.dataset.cargoName;

    const departure =
        button.dataset.departure;

    const destination =
        button.dataset.destination;

    const plannedAt =
        button.dataset.plannedAt;


    document.getElementById(
        "confirmShipmentId"
    ).value = shipmentId;


    document.getElementById(
        "confirmVehicleNumber"
    ).textContent = vehicleNumber || "-";

    document.getElementById(
        "confirmCargoName"
    ).textContent = cargoName || "-";

    document.getElementById(
        "confirmDeparture"
    ).textContent = departure || "-";

    document.getElementById(
        "confirmDestination"
    ).textContent = destination || "-";

    document.getElementById(
        "confirmPlannedAt"
    ).textContent = formatPlannedAt(plannedAt);


    document.getElementById(
        "shipmentSelectStep"
    ).style.display = "none";

    document.getElementById(
        "shipmentConfirmStep"
    ).style.display = "block";
}

function backToShipmentList() {

    document.getElementById(
        "shipmentConfirmStep"
    ).style.display = "none";

    document.getElementById(
        "shipmentSelectStep"
    ).style.display = "block";
}

function closeShipmentModal() {

    document.getElementById(
        "shipmentSelectModal"
    ).classList.remove("open");

    document.body.classList.remove("modal-open");
}

function closeShipmentConfirm() {

    document.getElementById(
        "shipmentConfirmModal"
    ).classList.remove("open");


    document.body.classList.remove(
        "modal-open"
    );
}


function formatPlannedAt(value) {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    ).format(date);
}