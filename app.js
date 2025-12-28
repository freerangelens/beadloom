const gridCanvas = document.getElementById("gridCanvas");
const gridCtx = gridCanvas.getContext("2d");

const imageCanvas = document.createElement("canvas");
const imageCtx = imageCanvas.getContext("2d");

let uploadedImage = null;
let beadSize = 20;
let gridWidth = 30;
let gridHeight = 30;

// ----------------------
// Utility
// ----------------------

function hexToRGB(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
    }
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function nearestColor(r, g, b, palette) {
    let best = palette[0];
    let bestDist = Infinity;

    for (let p of palette) {
        let pr = p[0], pg = p[1], pb = p[2];
        let d = (r-pr)*(r-pr) + (g-pg)*(g-pg) + (b-pb)*(b-pb);
        if (d < bestDist) {
            bestDist = d;
            best = p;
        }
    }
    return best;
}

// ----------------------
// K-Means Palette Generator
// ----------------------

function generatePaletteKMeans(pixels, k) {
    let centroids = [];
    for (let i = 0; i < k; i++) {
        const idx = Math.floor(Math.random() * pixels.length);
        centroids.push([...pixels[idx]]);
    }

    for (let iter = 0; iter < 8; iter++) {
        const clusters = Array.from({ length: k }, () => []);

        for (let p of pixels) {
            let best = 0;
            let bestDist = Infinity;
            for (let i = 0; i < k; i++) {
                const c = centroids[i];
                const d = (p[0]-c[0])**2 + (p[1]-c[1])**2 + (p[2]-c[2])**2;
                if (d < bestDist) {
                    bestDist = d;
                    best = i;
                }
            }
            clusters[best].push(p);
        }

        for (let i = 0; i < k; i++) {
            if (clusters[i].length === 0) continue;
            let r = 0, g = 0, b = 0;
            for (let p of clusters[i]) {
                r += p[0];
                g += p[1];
                b += p[2];
            }
            r = Math.round(r / clusters[i].length);
            g = Math.round(g / clusters[i].length);
            b = Math.round(b / clusters[i].length);
            centroids[i] = [r, g, b];
        }
    }

    return centroids;
}

// ----------------------
// Drawing
// ----------------------

function resizeCanvas() {
    gridCanvas.width = gridWidth * beadSize;
    gridCanvas.height = gridHeight * beadSize;
}

function drawGrid() {
    gridCtx.strokeStyle = "#cccccc";
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
        gridCtx.lineTo(gridCanvas.width, y * beadSize);
        gridCtx.stroke();
    }
}

function getPalette() {
    const mode = document.getElementById("paletteMode").value;

    if (mode === "custom") {
        const lines = document.getElementById("customPalette").value
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0);

        return lines.map(hexToRGB);
    }

    const k = mode === "auto8" ? 8 : mode === "auto16" ? 16 : 32;

    const imgData = imageCtx.getImageData(0, 0, gridWidth, gridHeight).data;
    const pixels = [];

    for (let i = 0; i < imgData.length; i += 4) {
        pixels.push([imgData[i], imgData[i+1], imgData[i+2]]);
    }

    return generatePaletteKMeans(pixels, k);
}

function drawImageToGrid() {
    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    if (!uploadedImage) {
        drawGrid();
        return;
    }

    imageCanvas.width = gridWidth;
    imageCanvas.height = gridHeight;

    imageCtx.drawImage(uploadedImage, 0, 0, gridWidth, gridHeight);

    const palette = getPalette();
    const imgData = imageCtx.getImageData(0, 0, gridWidth, gridHeight).data;

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const i = (y * gridWidth + x) * 4;
            const r = imgData[i];
            const g = imgData[i+1];
            const b = imgData[i+2];

            const [rr, gg, bb] = nearestColor(r, g, b, palette);

            gridCtx.fillStyle = `rgb(${rr},${gg},${bb})`;
            gridCtx.fillRect(x * beadSize, y * beadSize, beadSize, beadSize);
        }
    }

    drawGrid();
}

// ----------------------
// Events
// ----------------------

document.getElementById("paletteMode").addEventListener("change", () => {
    const mode = document.getElementById("paletteMode").value;
    document.getElementById("customPaletteContainer").style.display =
        mode === "custom" ? "block" : "none";
    drawImageToGrid();
});

document.getElementById("imageUpload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        uploadedImage = img;
        resizeCanvas();
        drawImageToGrid();
    };
    img.src = URL.createObjectURL(file);
});

document.getElementById("beadSize").addEventListener("input", (e) => {
    beadSize = parseInt(e.target.value, 10);
    resizeCanvas();
    drawImageToGrid();
});

document.getElementById("gridWidth").addEventListener("input", (e) => {
    gridWidth = parseInt(e.target.value, 10);
    resizeCanvas();
    drawImageToGrid();
});

document.getElementById("gridHeight").addEventListener("input", (e) => {
    gridHeight = parseInt(e.target.value, 10);
    resizeCanvas();
    drawImageToGrid();
});

// Initial
resizeCanvas();
drawGrid();
