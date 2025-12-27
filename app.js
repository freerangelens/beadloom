let gridCanvas = document.getElementById("gridCanvas");
let gridCtx = gridCanvas.getContext("2d");

let imageCanvas = document.createElement("canvas");
let imageCtx = imageCanvas.getContext("2d");

let uploadedImage = null;
let beadSize = 20;
let gridWidth = 30;
let gridHeight = 30;

function resizeCanvas() {
    gridCanvas.width = gridWidth * beadSize;
    gridCanvas.height = gridHeight * beadSize;
}

function drawGrid() {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    gridCtx.strokeStyle = "#ccc";
    gridCtx.lineWidth = 1;

    for (let x = 0; x <= gridWidth; x++) {
        gridCtx.beginPath();
        gridCtx.moveTo(x * beadSize, 0);
        gridCtx.lineTo(x * beadSize, gridCanvas.height);
        gridCtx.stroke();
    }

    for (let y = 0; y <= gridHeight; y++) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y * beadSize);
        gridCtx.lineTo(gridCtx.canvas.width, y * beadSize);
        gridCtx.stroke();
    }
}

function drawImageToGrid() {
    if (!uploadedImage) {
        drawGrid();
        return;
    }

    imageCanvas.width = gridWidth;
    imageCanvas.height = gridHeight;

    imageCtx.clearRect(0, 0, gridWidth, gridHeight);
    imageCtx.drawImage(uploadedImage, 0, 0, gridWidth, gridHeight);

    let imgData = imageCtx.getImageData(0, 0, gridWidth, gridHeight).data;

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            let i = (y * gridWidth + x) * 4;
            let r = imgData[i];
            let g = imgData[i + 1];
            let b = imgData[i + 2];

            gridCtx.fillStyle = `rgb(${r},${g},${b})`;
            gridCtx.fillRect(x * beadSize, y * beadSize, beadSize, beadSize);
        }
    }

    drawGrid();
}

document.getElementById("imageUpload").addEventListener("change", function (e) {
    let file = e.target.files[0];
    if (!file) return;

    let img = new Image();
    img.onload = function () {
        uploadedImage = img;
        resizeCanvas();
        drawImageToGrid();
    };
    img.src = URL.createObjectURL(file);
});

document.getElementById("beadSize").addEventListener("input", function (e) {
    let v = parseInt(e.target.value, 10);
    if (!Number.isFinite(v) || v <= 0) return;
    beadSize = v;
    resizeCanvas();
    drawImageToGrid();
});

document.getElementById("gridWidth").addEventListener("input", function (e) {
    let v = parseInt(e.target.value, 10);
    if (!Number.isFinite(v) || v <= 0) return;
    gridWidth = v;
    resizeCanvas();
    drawImageToGrid();
});

document.getElementById("gridHeight").addEventListener("input", function (e) {
    let v = parseInt(e.target.value, 10);
    if (!Number.isFinite(v) || v <= 0) return;
    gridHeight = v;
    resizeCanvas();
    drawImageToGrid();
});

resizeCanvas();
drawGrid();
