(() => {
  const initialStatuses = {
    'P-10482': 'completed',
    'P-10483': 'completed',
    'P-10484': 'postponed',
    'P-10485': 'completed',
    'P-10486': 'completed'
  };
  const validStatuses = new Set(['completed', 'postponed', 'cancelled']);
  const statuses = new Map(Object.entries(initialStatuses));
  const listeners = new Set();
  const channel = typeof BroadcastChannel === 'function'
    ? new BroadcastChannel('sanad-appointment-status')
    : null;

  function applyStatus(patientId, status) {
    if (!Object.hasOwn(initialStatuses, patientId) || !validStatuses.has(status)) return;
    statuses.set(patientId, status);
    listeners.forEach(listener => listener(patientId, status));
  }

  if (channel) {
    channel.addEventListener('message', event => {
      const message = event.data;
      if (message?.type === 'status' && message.patientId && message.status) {
        applyStatus(message.patientId, message.status);
      } else if (message?.type === 'snapshot-request') {
        channel.postMessage({ type: 'snapshot', statuses: Object.fromEntries(statuses) });
      } else if (message?.type === 'snapshot' && message.statuses) {
        Object.entries(message.statuses).forEach(([patientId, status]) => applyStatus(patientId, status));
      }
    });
    channel.postMessage({ type: 'snapshot-request' });
  }

  window.SANAD_APPOINTMENT_STATUS = {
    get(patientId) {
      return statuses.get(patientId) || 'completed';
    },
    set(patientId, status) {
      if (!Object.hasOwn(initialStatuses, patientId) || !validStatuses.has(status)) {
        throw new Error('Invalid appointment status update.');
      }
      applyStatus(patientId, status);
      channel?.postMessage({ type: 'status', patientId, status });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
})();
