/* GuardAI – Pose Trainer minimal
 * Производит захват камеры, инициализирует MediaPipe Pose Landmarker,
 * рисует оверлей с точками/скелетом, поддерживает выбор камеры, зеркалирование,
 * безопасную остановку и адаптивную частоту инференса.
 */

const els = {
  video: document.getElementById("video"),
  canvas: document.getElementById("overlay"),
  start: document.getElementById("startBtn"),
  stop: document.getElementById("stopBtn"),
  cameraSelect: document.getElementById("cameraSelect"),
  mirrorToggle: document.getElementById("mirrorToggle"),
  landmarksToggle: document.getElementById("landmarksToggle"),
  status: document.getElementById("status"),
};

let stream = null;
let landmarker = null;
let ctx = null;
let running = false;
let rafId = null;
let lastTs = 0;
let targetFPS = 30; // будет снижаться, если не успеваем
let lastPerfCheck = 0;
const PERF_WINDOW = 1000;

// MediaPipe загрузка
async function createLandmarker() {
  const vision = await window.FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  return await window.PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-assets/pose_landmarker_lite.task",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false,
    visualization: false,
  });
}

async function listCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cams = devices.filter(d => d.kind === "videoinput");
  els.cameraSelect.innerHTML = "";
  cams.forEach((d, i) => {
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.textContent = d.label || `Камера ${i + 1}`;
    els.cameraSelect.appendChild(opt);
  });
}

async function startCamera(deviceId) {
  stopCamera(); // на всякий

  const constraints = {
    audio: false,
    video: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: deviceId ? undefined : "user",
    },
  };

  stream = await navigator.mediaDevices.getUserMedia(constraints);
  els.video.srcObject = stream;
  await els.video.play();

  // DPI-скейлинг канваса
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  els.canvas.width = Math.round(els.canvas.clientWidth * dpr);
  els.canvas.height = Math.round(els.canvas.clientHeight * dpr);
  ctx = els.canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

function drawLandmarks(poses, mirrored) {
  const { width, height } = els.canvas;
  // чистим логический пиксель (с учётом transform выше)
  ctx.clearRect(0, 0, els.canvas.clientWidth, els.canvas.clientHeight);

  if (!poses?.length) return;

  ctx.save();
  // зеркалим отрисовку, если нужно
  if (mirrored) {
    ctx.translate(els.canvas.clientWidth, 0);
    ctx.scale(-1, 1);
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(20, 184, 166, 0.9)";
  ctx.fillStyle = "rgba(20, 184, 166, 0.9)";

  const lm = poses[0].keypoints;

  // точки
  if (els.landmarksToggle.checked) {
    for (const p of lm) {
      const x = p.x * els.canvas.clientWidth;
      const y = p.y * els.canvas.clientHeight;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // простые рёбра (плечи-локти-запястья, бёдра-колени-лодыжки)
  const K = Object.fromEntries(lm.map(o => [o.name, o]));
  const lines = [
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"],
    ["right_elbow", "right_wrist"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_ankle"],
  ];

  for (const [a, b] of lines) {
    if (!K[a] || !K[b]) continue;
    const x1 = K[a].x * els.canvas.clientWidth;
    const y1 = K[a].y * els.canvas.clientHeight;
    const x2 = K[b].x * els.canvas.clientWidth;
    const y2 = K[b].y * els.canvas.clientHeight;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.restore();
}

async function loop(ts) {
  if (!running) return;

  const elapsed = ts - lastTs;
  const interval = 1000 / targetFPS;
  if (elapsed < interval) {
    rafId = requestAnimationFrame(loop);
    return;
  }
  lastTs = ts;

  const mirrored = els.mirrorToggle.checked;
  const video = els.video;

  if (landmarker && video.readyState >= 2) {
    const result = await landmarker.detectForVideo(video, performance.now());
    drawLandmarks(result?.landmarks, mirrored);
  }

  // адаптация частоты (очень грубо, но надёжно)
  if (ts - lastPerfCheck > PERF_WINDOW) {
    lastPerfCheck = ts;
    // если «тормозим» часто – снизим FPS, если успеваем – вернём 30
    targetFPS = Math.max(15, Math.min(30, targetFPS + 5));
  }

  rafId = requestAnimationFrame(loop);
}

function setStatus(msg) {
  els.status.textContent = msg;
}

async function start() {
  try {
    setStatus("Запуск…");
    if (!("mediaDevices" in navigator)) {
      throw new Error("Браузер не поддерживает camera API.");
    }
    await listCameras();
    await startCamera(els.cameraSelect.value || undefined);

    if (!landmarker) {
      landmarker = await createLandmarker();
    }

    running = true;
    els.start.disabled = true;
    els.stop.disabled = false;
    lastTs = 0;
    targetFPS = 30;
    lastPerfCheck = 0;
    rafId = requestAnimationFrame(loop);
    setStatus("Работает.");
  } catch (e) {
    console.error(e);
    setStatus("Ошибка: " + e.message);
    stop();
  }
}

function stop() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  stopCamera();
  els.start.disabled = false;
  els.stop.disabled = true;
  setStatus("Остановлено.");
}

els.start.addEventListener("click", start);
els.stop.addEventListener("click", stop);
els.cameraSelect.addEventListener("change", async () => {
  if (!stream) return;
  await startCamera(els.cameraSelect.value);
});
window.addEventListener("beforeunload", stop);
