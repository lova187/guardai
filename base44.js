// Minimal metric sender stub used by the demo. Replace with your backend.
export function sendMetric(event, payload = {}) {
  try {
    console.log('[Metric]', event, payload);
    // Example: POST to your analytics service
    // fetch('/analytics', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ event, ...payload }) });
  } catch (e) {
    console.warn('[Metric] Failed to send', e);
  }
}
