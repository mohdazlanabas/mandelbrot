const canvas = document.getElementById('mandelbrot');
const ctx = canvas.getContext('2d');
const width = canvas.width, height = canvas.height;

const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

let centerX = 0.0;
let centerY = 0.0;
let scale = 1.5;
const maxIter = 100; // The maximum detail level

const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const resetBtn = document.getElementById('reset');

const durationSlider = document.getElementById('durationSlider');
const durationValue = document.getElementById('durationValue');
let animationDuration = parseInt(durationSlider.value) * 1000;

durationSlider.addEventListener('input', () => {
  durationValue.textContent = durationSlider.value;
  animationDuration = parseInt(durationSlider.value) * 1000;
});

durationSlider.addEventListener('change', () => {
  animateMandelbrot();
});

let isDragging = false;
let lastX = 0, lastY = 0;
let animationFrameId = null;

function getColor(iter, maxIter) {
  if (iter === maxIter) return [0, 0, 0]; // black for points inside the set
  // Cycle through red, green, blue based on iteration
  const t = iter / maxIter;
  const r = Math.floor(255 * Math.abs(Math.sin(Math.PI * t)));
  const g = Math.floor(255 * Math.abs(Math.sin(Math.PI * t + 2)));
  const b = Math.floor(255 * Math.abs(Math.sin(Math.PI * t + 4)));
  return [r, g, b];
}

function drawMandelbrot(currentIter) {
  const img = ctx.createImageData(width, height);
  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      let x0 = centerX + (px - width/2) * 4 / (scale * width);
      let y0 = centerY + (py - height/2) * 4 / (scale * width);
      let x = 0, y = 0, iter = 0;
      while (x*x + y*y <= 4 && iter < currentIter) {
        let xtemp = x*x - y*y + x0;
        y = 2*x*y + y0;
        x = xtemp;
        iter++;
      }
      const idx = 4 * (py * width + px);
      const [r, g, b] = getColor(iter, currentIter);
      img.data[idx] = r;
      img.data[idx+1] = g;
      img.data[idx+2] = b;
      img.data[idx+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function animateMandelbrot() {
  const startTime = performance.now();

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    const currentIter = Math.max(1, Math.floor(progress * maxIter));

    // Update progress bar and text
    const percent = Math.floor(progress * 100);
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '%';

    drawMandelbrot(currentIter);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(frame);
    } else {
      progressBar.style.width = '100%';
      progressText.textContent = '100%';
      animationFrameId = null;
    }
  }

  // Cancel any previous animation
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  progressBar.style.width = '0%';
  progressText.textContent = '0%';
  animationFrameId = requestAnimationFrame(frame);
}

// --- Interactivity ---
zoomInBtn.addEventListener('click', () => {
  scale *= 1.5;
  animateMandelbrot();
});
zoomOutBtn.addEventListener('click', () => {
  scale /= 1.5;
  animateMandelbrot();
});
resetBtn.addEventListener('click', () => {
  centerX = 0.0;
  centerY = 0.0;
  scale = 1.5;
  animateMandelbrot();
});

// Mouse drag to pan
canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});
canvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.offsetX - lastX;
  const dy = e.offsetY - lastY;
  centerX -= dx * 4 / (scale * width);
  centerY -= dy * 4 / (scale * width);
  lastX = e.offsetX;
  lastY = e.offsetY;
  animateMandelbrot();
});
canvas.addEventListener('mouseup', () => {
  isDragging = false;
});
canvas.addEventListener('mouseleave', () => {
  isDragging = false;
});

// Initial draw
animateMandelbrot();
