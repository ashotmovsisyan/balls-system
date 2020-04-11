const container = document.querySelector(".animation");
const environmentSelect = document.querySelector("#Environment");

const form = document.querySelector("form");
const continueButton = document.querySelector(".continue-button");
const pauseButton = document.querySelector(".pause-button");
const ballSizeInput = document.querySelector(".ball-size-input");
const ballNumberInput = document.querySelector(".ball-number-input");
const lineThicknessInput = document.querySelector(".line-thickness-input");


let system = null;
let environment = null;

const environments = [
    {
        name: "empty",
        value: 0,
        walls: [],
    },
    {
        name: "Environment 1",
        value: 1,
        walls: [
            [250, 0, 250, 230],
            [250, 270, 250, 500],
        ],
    },
    {
        name: "Environment 2",
        value: 2,
        walls: [
            [250, 0, 250, 230],
            [250, 270, 250, 500],
            [180, 230, 320, 230],
            [180, 270, 320, 270],
        ],
    },
    {
        name: "Environment 3",
        value: 3,
        walls: [
            [250, 0, 250, 105],
            [250, 145, 250, 355],
            [250, 395, 250, 500],
            [0, 250, 105, 250],
            [145, 250, 355, 250],
            [395, 250, 500, 250],
        ],
    },
    {
        name: "Environment 4",
        value: 4,
        walls: [
            [250, 0, 250, 105],
            [250, 145, 250, 355],
            [250, 395, 250, 500],
            [0, 250, 105, 250],
            [145, 250, 355, 250],
            [395, 250, 500, 250],
            [180, 105, 320, 105],
            [180, 145, 320, 145],
            [180, 355, 320, 355],
            [180, 395, 320, 395],
            [105, 180, 105, 320],
            [145, 180, 145, 320],
            [355, 180, 355, 320],
            [395, 180, 395, 320],
        ],
    },
];

let fragment = document.createDocumentFragment();
environments.forEach(_ => {
    const option = document.createElement('option');
    option.value = _.value;
    option.innerText = _.name;
    fragment.appendChild(option);
});

environmentSelect.innerHTML = '<option disabled selected>select environment</option>';
environmentSelect.appendChild(fragment);
fragment = null;


// Events
environmentSelect.addEventListener("change", () => {
    environment = environments.find(_ => _.value === +environmentSelect.value)
    if (!environment) {
        return;
    }
    if (system) {
        system.delete();
    }

    const lineThickness = Math.min(10, Math.max(1, +lineThicknessInput.value || 0));

    system = new System({
        width: 500,
        height: 500,
        walls: environment.walls,
        randomBallCount: 0,
        lineThickness,
        ballSize: 10,
        container,
        infectionTime: 3
    });
});

environmentSelect.value = 0;
environmentSelect.dispatchEvent(new Event("change"));

form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    if (!environment) {
        return;
    }

    if (system) {
        system.delete();
    }

    const ballSize = Math.min(25, Math.max(1, +ballSizeInput.value || 0));
    const lineThickness = Math.min(10, Math.max(1, +lineThicknessInput.value || 0));
    const randomBallCount = Math.min(150, Math.max(0, +ballNumberInput.value || 0));

    system = new System({
        width: 500,
        height: 500,
        walls: environment.walls,
        randomBallCount,
        lineThickness,
        ballSize,
        container,
        infectionTime: 3
    });

    system.start();
});

pauseButton.addEventListener("click", () => {
    if (!system) {
        return;
    }

    system.pause();
});

continueButton.addEventListener("click", () => {
    if (!system) {
        return;
    }

    system.start();
});

lineThicknessInput.addEventListener("change", () => {
    const lineThickness = Math.min(10, Math.max(1, +lineThicknessInput.value || 0));
    lineThicknessInput.value = lineThickness;

    if (!system) {
        return;
    }

    system.setLineThickness(lineThickness);
});
