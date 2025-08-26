import { sendMetric } from './base44.js';

// Pull MediaPipe classes from window (populated by vision_bundle.js).
const { FilesetResolver, PoseLandmarker } = window;

let landmarker = null;

export async function initPose() {
  if (!window.FilesetResolver || !window.PoseLandmarker) {
    console.error('[GuardAI] MediaPipe vision_bundle.js not loaded or blocked.');
  }
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    );
    landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    return landmarker;
  } catch (e) {
    console.error('[GuardAI] initPose failed:', e);
    throw e;
  }
}

export function evaluateRules(lm) {
  const IDX = { NOSE:0, LS:11, RS:12, LE:13, RE:14, LH:23, RH:24 };
  const L = (i) => lm[i];
  const tips = [];
  const good = [];

  const nose = L(IDX.NOSE);
  const ls = L(IDX.LS), rs = L(IDX.RS);
  const le = L(IDX.LE), re = L(IDX.RE);
  const lh = L(IDX.LH), rh = L(IDX.RH);

  // Chin relative to shoulders
  if (nose && ls && rs) {
    const shoulderY = (ls.y + rs.y) / 2;
    if (nose.y - 0.10 > shoulderY) tips.push("להוריד סנטר");
    else if (nose.y + 0.03 < shoulderY) tips.push("להרים מעט את הסנטר");
    else good.push("ראש: תקין");
  }

  // Elbows closer to torso
  if (le && re && lh && rh) {
    const torsoX = (lh.x + rh.x) / 2;
    const spread = Math.max(Math.abs(le.x - torsoX), Math.abs(re.x - torsoX));
    if (spread > 0.15) tips.push("לקרב מרפקים לגוף");
    else good.push("מרפקים: תקין");
  }

  return { tips, good };
}

export function drawSkeleton(ctx, canvas, lm) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#14b8a6';
  ctx.fillStyle = '#14b8a6';
  const pairs = [[11,13],[13,15],[12,14],[14,16],[11,12],[23,24],[11,23],[12,24]];
  for (const p of lm) {
    if(!p) continue;
    ctx.beginPath();
    ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, Math.PI*2);
    ctx.fill();
  }
  for (const [a,b] of pairs) {
    const A = lm[a], B = lm[b];
    if(!A || !B) continue;
    ctx.beginPath();
    ctx.moveTo(A.x * canvas.width, A.y * canvas.height);
    ctx.lineTo(B.x * canvas.width, B.y * canvas.height);
    ctx.stroke();
  }
}

export async function startTraining($wrap, onFeedback) {
  const video = $wrap.querySelector('video');
  const canvas = $wrap.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  // Camera permission
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    video.srcObject = stream;
    await video.play();
  } catch (e) {
    console.error('[GuardAI] Camera error:', e);
    alert('נראה שיש בעיה בהרשאת מצלמה. אפשר לאפשר מצלמה לדפדפן ולרענן?');
    return () => {};
  }

  function resize(){
    const r = $wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  window.addEventListener('resize', resize);

  if(!landmarker) await initPose();
  let runningFlag = true;
  let last = performance.now();
  let correctStanceMs = 0;

  function loop(now) {
    if (!runningFlag) return;
    requestAnimationFrame(loop);
    if (!video.videoWidth) return;

    const dt = now - last;
    if (dt < 33) return; // ~30 fps
    last = now;

    try {
      const res = landmarker.detectForVideo(video, now);
      if (res && res.landmarks && res.landmarks[0]){
        const lm = res.landmarks[0];
        drawSkeleton(ctx, canvas, lm);
        const fb = evaluateRules(lm);
        onFeedback(fb);

        if (fb.tips.length === 0) correctStanceMs += dt;
      }
    } catch (e) {
      console.error('[GuardAI] detectForVideo error:', e);
    }
  }
  requestAnimationFrame(loop);

  return () => {
    try { (video.srcObject?.getTracks() || []).forEach(t=>t.stop()); } catch(e){}
    runningFlag = false;
    sendMetric('session_end', { correctStanceMs });
  };
}
