import { startTraining } from './pose.js';

const wrap = document.getElementById('wrap');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const tipsEl = document.getElementById('tips');
const goodEl = document.getElementById('good');

let stopFn = null;

function renderFeedback({tips, good}){
  tipsEl.innerHTML = tips.map(t => `<span class="tip">${t}</span>`).join('') || '<span class="tip">—</span>';
  goodEl.innerHTML = good.map(g => `<span class="badge">${g}</span>`).join('') || '<span class="badge">Ready</span>';
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;
  renderFeedback({tips:[], good:['Initializing...']});
  stopFn = await startTraining(wrap, renderFeedback);
});

stopBtn.addEventListener('click', () => {
  if (stopFn) stopFn();
  stopFn = null;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  renderFeedback({tips:[], good:['Stopped']});
});

renderFeedback({tips:[], good:['Idle']});
