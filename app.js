const gridCanvas = document.getElementById("gridCanvas");
const gridCtx = gridCanvas.getContext("2d");

const imageCanvas = document.createElement("canvas");
const imageCtx = imageCanvas.getContext("2d");

let uploadedImage = null;

// DEFAULTS YOU REQUESTED
let beadSize = 20;
let gridWidth = 100;
let gridHeight = 9;

// Drag state
let imgX = 0;
let imgY = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;

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
                const d = (p[0]-c[0])**2 + (p[1]-c[1])
