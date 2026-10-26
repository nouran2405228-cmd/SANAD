(() => {
  const lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  let theme = localStorage.getItem('sanad_theme') === 'dark' ? 'dark' : 'light';
  if (sessionStorage.getItem('isLoggedIn') !== 'true' || sessionStorage.getItem('userRole') !== 'nurse') {
    location.replace(`login.html?${new URLSearchParams({lang,theme})}`);
    return;
  }

  document.body.classList.add('authorized');
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.toggle('dark', theme === 'dark');
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="search"], table td, [data-patient], .patient-name, .vitals-summary, #vitalsPatientName').forEach(element => element.setAttribute('dir', 'auto'));
  document.getElementById('todayLabel').textContent = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG', {weekday:'short',year:'numeric',month:'short',day:'numeric'});

  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  const navLinks = Array.from(document.querySelectorAll('#nurseNav [data-section]'));
  let activeSection = '';
  function updateActiveNav(sectionId, updateLocation = false) {
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === sectionId));
    panels.forEach(panel => panel.classList.toggle('active-section', panel.dataset.panel === sectionId));
    if (activeSection === sectionId) return;
    activeSection = sectionId;
    if (updateLocation) {
      const routeParams = new URLSearchParams(location.search);
      routeParams.set('lang', lang);
      routeParams.set('theme', theme);
      history.replaceState({ section: sectionId }, '', `${location.pathname}?${routeParams}#${sectionId}`);
    }
  }
  function syncActiveSection() {
    if (!panels.length) return;
    const activationPoint = window.innerHeight * 0.3;
    let currentPanel = panels[0];
    panels.forEach(panel => {
      if (panel.getBoundingClientRect().top <= activationPoint) currentPanel = panel;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      currentPanel = panels[panels.length - 1];
    }
    updateActiveNav(currentPanel.dataset.panel, true);
  }
  let scrollSyncScheduled = false;
  function scheduleSectionSync() {
    if (scrollSyncScheduled) return;
    scrollSyncScheduled = true;
    window.requestAnimationFrame(() => {
      scrollSyncScheduled = false;
      syncActiveSection();
    });
  }
  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const section = link.dataset.section;
      const target = document.getElementById(section);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      updateActiveNav(section, true);
    });
  });
  window.addEventListener('scroll', scheduleSectionSync, { passive: true });
  window.addEventListener('resize', scheduleSectionSync);
  scheduleSectionSync();

  const themeIcons = {
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M2 12h2m16 0h2M4.9 19.1l1.5-1.5m12.7-12.7 1.5-1.5"/></svg>'
  };
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.innerHTML = themeIcons[theme];
  themeToggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sanad_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    themeToggle.innerHTML = themeIcons[theme];
    const current = new URLSearchParams(location.search);
    current.set('theme', theme);
    history.replaceState(null, '', `${location.pathname}?${current}${location.hash}`);
  });
  document.getElementById('logoutButton').addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    localStorage.removeItem('sanad_session_active');
    localStorage.removeItem('sanad_session_role');
    localStorage.removeItem('sanad_session_name');
    localStorage.removeItem('admin_role');
    location.href = `index.html?${new URLSearchParams({lang,theme})}`;
  });

  const doctorFilter = document.getElementById('doctorFilter');
  doctorFilter.addEventListener('change', () => {
    document.querySelectorAll('#appointmentRows tr').forEach(row => {
      row.hidden = doctorFilter.value !== 'all' && row.dataset.doctor !== doctorFilter.value;
    });
  });

  function updateStatus(row, text, className) {
    const badge = row.querySelector('.status-pill');
    badge.textContent = window.sanadTranslate(text, lang);
    badge.className = `status-pill ${className}`;
  }
  const todayAppointmentRows = [...document.querySelectorAll('#todayAppointmentRows tr')];
  function renderTodayAppointmentStatuses() {
    todayAppointmentRows.forEach(row => {
      const select = row.querySelector('.nurse-status-select');
      const status = window.SANAD_APPOINTMENT_STATUS.get(row.dataset.patientId);
      select.value = status;
      select.className = `nurse-status-select status-${status}`;
    });
  }
  document.getElementById('todayAppointmentRows').addEventListener('change', event => {
    const select = event.target.closest('.nurse-status-select');
    if (!select) return;
    const row = select.closest('tr');
    window.SANAD_APPOINTMENT_STATUS.set(row.dataset.patientId, select.value);
  });
  window.SANAD_APPOINTMENT_STATUS.subscribe(renderTodayAppointmentStatuses);
  renderTodayAppointmentStatuses();

  document.getElementById('appointmentRows').addEventListener('click', event => {
    const button = event.target.closest('[data-appointment-action]');
    if (!button) return;
    const row = button.closest('tr');
    if (button.dataset.appointmentAction === 'approve') updateStatus(row, 'Approved', 'completed');
    if (button.dataset.appointmentAction === 'reschedule') updateStatus(row, 'Reschedule Requested', 'rescheduled');
  });

  document.getElementById('scheduleForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const dateValue = String(values.get('date'));
    const date = new Date(`${dateValue}T00:00:00`);
    const formattedDate = date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {day:'2-digit',month:'short',year:'numeric'});
    const row = document.createElement('tr');
    row.dataset.doctor = String(values.get('doctor'));
    const patientCell = document.createElement('td');
    patientCell.className = 'patient-name';
    patientCell.dir = 'auto';
    patientCell.textContent = String(values.get('patient')).trim();
    const doctorCell = document.createElement('td');
    doctorCell.dir = 'auto';
    doctorCell.textContent = String(values.get('doctor'));
    const dateCell = document.createElement('td');
    dateCell.dir = 'auto';
    dateCell.textContent = formattedDate;
    const timeCell = document.createElement('td');
    timeCell.dir = 'auto';
    timeCell.textContent = String(values.get('time'));
    const statusCell = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'status-pill pending';
    badge.textContent = window.sanadTranslate('Pending', lang);
    statusCell.appendChild(badge);
    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'row-actions';
    [['approve','Approve'],['reschedule','Reschedule']].forEach(([action,label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'row-action';
      button.dataset.appointmentAction = action;
      button.textContent = window.sanadTranslate(label, lang);
      actions.appendChild(button);
    });
    actionsCell.appendChild(actions);
    row.append(patientCell, doctorCell, dateCell, timeCell, statusCell, actionsCell);
    document.getElementById('appointmentRows').appendChild(row);
    form.reset();
    doctorFilter.value = 'all';
    doctorFilter.dispatchEvent(new Event('change'));
  });

  const vitalsModal = document.getElementById('vitalsModal');
  const vitalsForm = document.getElementById('vitalsForm');
  let activeTaskCard = null;
  function closeVitals() {
    vitalsModal.classList.remove('open');
    vitalsModal.setAttribute('aria-hidden', 'true');
    activeTaskCard = null;
  }
  document.getElementById('taskList').addEventListener('click', event => {
    const taskCard = event.target.closest('.task-card');
    if (!taskCard) return;
    if (event.target.closest('[data-edit-vitals]')) {
      activeTaskCard = taskCard;
      document.getElementById('vitalsPatientName').textContent = taskCard.dataset.patient;
      vitalsForm.querySelectorAll('[name]').forEach(input => {
        input.value = taskCard.querySelector(`[data-vital="${input.name}"]`).textContent === 'Not recorded'
          ? ''
          : taskCard.querySelector(`[data-vital="${input.name}"]`).textContent;
      });
      vitalsModal.classList.add('open');
      vitalsModal.setAttribute('aria-hidden', 'false');
      vitalsForm.querySelector('input').focus();
    }
    if (event.target.closest('[data-cycle-task]')) {
      const status = taskCard.querySelector('.task-status');
      const currentStatus = status.classList.contains('pending') ? 'Pending'
        : status.classList.contains('in-progress') ? 'In Progress' : 'Completed';
      const nextStatus = {
        Pending: {text:'In Progress',className:'in-progress',button:'Complete Task'},
        'In Progress': {text:'Completed',className:'completed',button:'Reopen Task'},
        Completed: {text:'Pending',className:'pending',button:'Start Task'}
      }[currentStatus];
      status.textContent = window.sanadTranslate(nextStatus.text, lang);
      status.className = `status-pill task-status ${nextStatus.className}`;
      taskCard.querySelector('[data-cycle-task]').textContent = window.sanadTranslate(nextStatus.button, lang);
    }
  });
  vitalsForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!activeTaskCard || !vitalsForm.reportValidity()) return;
    const values = new FormData(vitalsForm);
    ['bloodPressure','temperature','heartRate','weight'].forEach(name => {
      const value = String(values.get(name)).trim();
      activeTaskCard.querySelector(`[data-vital="${name}"]`).textContent = value || 'Not recorded';
    });
    closeVitals();
  });
  document.getElementById('closeVitals').addEventListener('click', closeVitals);
  vitalsModal.addEventListener('click', event => {
    if (event.target === vitalsModal) closeVitals();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && vitalsModal.classList.contains('open')) closeVitals();
  });

  const requestedSection = location.hash.slice(1);
  if (panels.some(panel => panel.dataset.panel === requestedSection)) showPanel(requestedSection);
})();
