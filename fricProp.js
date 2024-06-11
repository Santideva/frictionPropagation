const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;
const pixelSize = 2; // Smaller pixel size for better visual experience

class Deque {
    constructor() {
        this.items = [];
    }

    push(element) {
        this.items.push(element);
    }

    shift() {
        return this.items.shift();
    }

    get length() {
        return this.items.length;
    }
}

function rgbToString({ r, g, b, a = 1 }) {
    return `rgba(${r},${g},${b},${a})`;
}

function interpolateColor(startColor, endColor, factor) {
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * factor);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * factor);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * factor);
    return { r, g, b };
}

const fadeOutRate = 0.01; // Rate at which pixels fade out
let totalIterations = 0;
const activePixels = new Map(); // Store active pixels
const propagations = []; // Store active propagations

const startColor = { r: 21, g: 95, b: 120 }; // Start color
const endColor = { r: 158, g: 151, b: 117 }; // End color

function drawPixel(x, y, color) {
    ctx.fillStyle = rgbToString(color);
    ctx.fillRect(x, y, pixelSize, pixelSize);
}

function propagateChanges(queue, probability, originX, originY) {
    const newQueue = new Deque();
    while (queue.length > 0) {
        const { x, y, color: parentColor, iteration } = queue.shift();

        const children = [
            { x: x + pixelSize, y },
            { x: x - pixelSize, y },
            { x, y: y + pixelSize },
            { x, y: y - pixelSize }
        ];

        children.forEach(child => {
            const key = `${child.x},${child.y}`;
            if (
                !activePixels.has(key) &&
                Math.random() * 100 < probability &&
                child.x >= 0 &&
                child.x < width &&
                child.y >= 0 &&
                child.y < height
            ) {
                const newColor = interpolateColor(startColor, endColor, iteration / 200);
                const distance = Math.sqrt(Math.pow(child.x - originX, 2) + Math.pow(child.y - originY, 2));
                const alpha = Math.max(1 - (distance / (width / 2)), 0); // Decrease alpha with distance
                activePixels.set(key, {
                    currentColor: parentColor,
                    targetColor: newColor,
                    age: 0,
                    iteration: iteration + 1,
                    alpha
                });
                newQueue.push({ ...child, color: newColor, iteration: iteration + 1 });
            }
        });
    }
    return newQueue;
}

function outwardPropagation(parents, initialProbability, originX, originY) {
    let queue = new Deque();
    parents.forEach(parent => queue.push(parent));
    let probability = initialProbability;

    function propagate() {
        if (queue.length === 0) return;

        queue = propagateChanges(queue, probability, originX, originY);
        probability *= 0.98; // Decrease probability for the next iteration more rapidly
        totalIterations++;

        updateAndDrawPixels(); // Update and draw all active pixels
        requestAnimationFrame(propagate);
    }

    propagate();
}

function updateAndDrawPixels() {
    activePixels.forEach((pixel, key) => {
        const { currentColor, targetColor, age, alpha } = pixel;
        const newColor = interpolateColor(currentColor, targetColor, 0.1);
        const adjustedAlpha = Math.max(alpha - age * fadeOutRate, 0);
        drawPixel(parseInt(key.split(',')[0]), parseInt(key.split(',')[1]), { ...newColor, a: adjustedAlpha });

        if (adjustedAlpha <= 0) {
            activePixels.delete(key); // Remove faded-out pixels
        } else {
            pixel.currentColor = newColor;
            pixel.age += 1;
        }
    });
}

function startPropagation(x, y, numPropagations) {
    const initialProbability = 100;
    const seedCount = 9; // Number of initial seeds
    const radius = 25   ; // Radius for random seed points
    const initialSeeds = [];

    for (let i = 0; i < seedCount; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * radius;
        const seedX = Math.floor(x + distance * Math.cos(angle));
        const seedY = Math.floor(y + distance * Math.sin(angle));
        const initialPixel = { x: seedX, y: seedY, color: startColor, iteration: 0 };
        ctx.fillStyle = rgbToString(initialPixel.color);
        ctx.fillRect(seedX, seedY, pixelSize, pixelSize);
        initialSeeds.push(initialPixel);
        const key = `${seedX},${seedY}`;
        activePixels.set(key, {
            currentColor: initialPixel.color,
            targetColor: interpolateColor(startColor, endColor, 0.1),
            age: 0,
            iteration: 0,
            alpha: 1
        });
    }

    for (let i = 0; i < numPropagations; i++) {
        const propagation = () => outwardPropagation(initialSeeds, initialProbability, x, y);
        propagations.push(propagation);
        propagation();
    }
}

let numPropagations = 1; // Initial number of propagations

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    startPropagation(x, y, numPropagations);
    numPropagations = Math.pow(numPropagations, 100); // Scale the number of propagations
});

function generateRandomColor() {
    return {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
    };
}

function adjustColor(baseColor, adjustFactor) {
    return {
        r: Math.min(255, Math.max(0, baseColor.r + adjustFactor)),
        g: Math.min(255, Math.max(0, baseColor.g + adjustFactor)),
        b: Math.min(255, Math.max(0, baseColor.b + adjustFactor))
    };
}

function randomizeColors() {
    const baseColor = generateRandomColor();
    const adjustFactor1 = -76; // Difference between canvas bg and start color
    const adjustFactor2 = 61; // Difference between start color and end color
    
    canvas.style.backgroundColor = rgbToString(baseColor);

    startColor = adjustColor(baseColor, adjustFactor1);
    endColor = adjustColor(startColor, adjustFactor2);
}

function applyNewColors() {
    ctx.fillStyle = canvas.style.backgroundColor;
    ctx.fillRect(0, 0, width, height); // Clear the canvas with the new background color
}

document.getElementById('randomizeColors').addEventListener('click', () => {
    randomizeColors();
    applyNewColors();
});