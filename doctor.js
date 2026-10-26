(() => {
  const params = new URLSearchParams(location.search);
  let lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  let theme = localStorage.getItem('sanad_theme') === 'dark' ? 'dark' : 'light';
  const isDoctor = sessionStorage.getItem('isLoggedIn') === 'true' &&
    sessionStorage.getItem('userRole') === 'doctor';
  const doctorName = localStorage.getItem('sanad_session_name') || 'Doctor';
  const layout = document.getElementById('doctorLayout');
  const app = document.getElementById('doctorApp');
  const denied = document.getElementById('accessDenied');
  const copy = TRANSLATIONS.doctor;
  const sidebarText = {
    en: {
      doctorWorkspace: 'DOCTOR WORKSPACE',
      navCategory: 'CLINICAL CARE',
      navAppointments: "Today's Appointments",
      navPatientRecords: 'Patient Records',
      navPrescription: 'Write Prescription'
    },
    ar: {
      doctorWorkspace: 'مساحة عمل الطبيب',
      navCategory: 'الرعاية الطبية',
      navAppointments: 'مواعيد اليوم',
      navPatientRecords: 'سجلات المرضى',
      navPrescription: 'كتابة وصفة طبية'
    }
  };
  const t = key => sidebarText[lang][key] || copy[lang][key] || copy.en[key] || key;
  const themeIcons = {
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M2 12h2m16 0h2M4.9 19.1l1.5-1.5m12.7-12.7 1.5-1.5"/></svg>'
  };
  const placeholders = TRANSLATIONS.doctor.placeholders;

  if (!isDoctor) {
    denied.hidden = false;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
    document.title = `${t('unauthorizedTitle')} | Sanad Hospital`;
    return;
  }

  window.__SANAD_SESSION__ = { name: doctorName, role: 'doctor' };
  layout.hidden = false;
  app.hidden = false;
  const patientRecords = [...document.querySelectorAll('#patientRecords .patient-record')];
  const appointmentRows = [...document.querySelectorAll('#appointmentRows .appointment-row')];
  const doctorNavLinks = [...document.querySelectorAll('#doctorNav [data-section]')];
  const doctorSections = doctorNavLinks
    .map(link => document.getElementById(link.dataset.section))
    .filter(Boolean);
  let activeDoctorSection = '';
  function updateDoctorSection(sectionId, updateLocation = false) {
    doctorNavLinks.forEach(link => link.classList.toggle('active', link.dataset.section === sectionId));
    if (activeDoctorSection === sectionId) return;
    activeDoctorSection = sectionId;
    if (updateLocation) {
      const routeParams = new URLSearchParams(location.search);
      routeParams.set('lang', lang);
      routeParams.set('theme', theme);
      history.replaceState({ section: sectionId }, '', `${location.pathname}?${routeParams}#${sectionId}`);
    }
  }
  function syncDoctorSection() {
    if (!doctorSections.length) return;
    const activationPoint = window.innerHeight * 0.3;
    let currentSection = doctorSections[0];
    doctorSections.forEach(section => {
      if (section.getBoundingClientRect().top <= activationPoint) currentSection = section;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      currentSection = doctorSections[doctorSections.length - 1];
    }
    updateDoctorSection(currentSection.id, true);
  }
  let doctorScrollSyncScheduled = false;
  function scheduleDoctorSectionSync() {
    if (doctorScrollSyncScheduled) return;
    doctorScrollSyncScheduled = true;
    window.requestAnimationFrame(() => {
      doctorScrollSyncScheduled = false;
      syncDoctorSection();
    });
  }
  doctorNavLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const sectionId = link.dataset.section;
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateDoctorSection(sectionId, true);
    });
  });
  window.addEventListener('scroll', scheduleDoctorSectionSync, { passive: true });
  window.addEventListener('resize', scheduleDoctorSectionSync);
  scheduleDoctorSectionSync();
  let selectedPatient = patientRecords[0];
  let toastTimer;

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.toggle('dark', theme === 'dark');
  document.getElementById('doctorGreeting').textContent = doctorName;
  document.getElementById('doctorGreeting').setAttribute('aria-label', doctorName);
  window.addEventListener('sanadlanguagechange', event => {
    event.preventDefault();
    lang = event.detail.language;
    updateLanguage();
  });
  document.getElementById('themeToggle').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sanad_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    document.getElementById('themeToggle').innerHTML = themeIcons[theme];
    updateNavigation();
  });
  document.getElementById('logoutButton').addEventListener('click', () => {
    window.__SANAD_SESSION__ = null;
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    localStorage.removeItem('sanad_session_active');
    localStorage.removeItem('sanad_session_role');
    localStorage.removeItem('sanad_session_name');
    localStorage.removeItem('admin_role');
    location.href = `index.html?${new URLSearchParams({lang,theme})}`;
  });

  function showToast(message) {
    const toast = document.getElementById('doctorToast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function updateNavigation() {
    const routeParams = new URLSearchParams(location.search);
    routeParams.set('lang', lang);
    routeParams.set('theme', theme);
    const homeUrl = `index.html?${routeParams}`;
    document.getElementById('homeLink').href = homeUrl;
    document.getElementById('homeBrandLink').href = homeUrl;
    history.replaceState(null, '', `${location.pathname}?${routeParams}${location.hash}`);
  }

  function updateLanguage() {
    document.title = `${t('dashboardTitle')} | Sanad Hospital`;
    document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => { element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel)); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => { element.placeholder = t(element.dataset.i18nPlaceholder); });
    Object.entries(placeholders[lang]).forEach(([name,value]) => { document.querySelector(`[name="${name}"]`).placeholder = value; });
    document.getElementById('patientSearch').placeholder = t('searchPlaceholder');
    document.getElementById('todayLabel').textContent = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG', {weekday:'short',year:'numeric',month:'short',day:'numeric'});
    document.getElementById('languageToggle').textContent = lang === 'ar' ? 'EN' : 'العربية';
    document.getElementById('themeToggle').innerHTML = themeIcons[theme];
    document.getElementById('themeToggle').setAttribute('aria-label', t('theme'));
    document.getElementById('logoutButton').textContent = t('logout');
    updateNavigation();
    renderAppointments();
    renderPatientProfile();
    if (document.getElementById('patientSearch').value.trim()) searchPatients();
  }

  function renderPatientProfile() {
    const profile = document.getElementById('patientProfile');
    const patient = selectedPatient.dataset;
    document.getElementById('activePatientLabel').textContent = `${t('patientSelected')}: ${patient.id}`;
    const initials = patient.name.split(/\s+/).slice(0,2).map(part => part[0]).join('');
    profile.replaceChildren();
    const identity = document.createElement('div');
    identity.className = 'profile-identity';
    identity.innerHTML = `<span class="patient-avatar" aria-hidden="true"></span><div><h3></h3><p></p></div>`;
    identity.querySelector('.patient-avatar').textContent = initials;
    identity.querySelector('h3').textContent = patient.name;
    identity.querySelector('p').textContent = patient.id;
    profile.append(identity);
    const facts = document.createElement('div');
    facts.className = 'profile-facts';
    [[t('age'),`${patient.age} ${t('years')}`],[t('gender'),lang === 'ar' ? (patient.gender === 'Female' ? 'أنثى' : 'ذكر') : patient.gender],[t('bloodType'),patient.bloodType]].forEach(([label,value]) => {
      const fact = document.createElement('div'); fact.className = 'fact'; fact.innerHTML = '<small></small><strong></strong>'; fact.querySelector('small').textContent = label; fact.querySelector('strong').textContent = value; facts.append(fact);
    });
    profile.append(facts);
    [[t('diagnosis'),patient.diagnosis,''],[t('allergies'),patient.allergies,patient.allergies === 'None reported' ? '' : 'allergy-value'],[t('visitNotes'),patient.notes,'']].forEach(([label,value,className]) => {
      const block = document.createElement('div'); block.className = 'profile-block'; block.innerHTML = '<h3></h3><p></p>'; block.querySelector('h3').textContent = label; block.querySelector('p').textContent = value === 'None reported' ? t('noAllergies') : value; if (className) block.querySelector('p').className = className; profile.append(block);
    });
    renderPrescriptions();
  }

  function renderAppointments() {
    appointmentRows.forEach(row => {
      const status = window.SANAD_APPOINTMENT_STATUS.get(row.dataset.patientId);
      const badge = row.querySelector('.appointment-status-badge');
      row.dataset.status = status;
      row.classList.toggle('selected', row.dataset.patientId === selectedPatient.dataset.id);
      row.classList.toggle('is-cancelled', status === 'cancelled');
      badge.textContent = t(status);
      badge.className = `appointment-status-badge status-${status}`;
    });
    document.getElementById('appointmentCount').textContent = appointmentRows.length;
  }

  function renderPrescriptions() {
    const list = document.getElementById('prescriptionList');
    list.replaceChildren();
    const prescriptions = selectedPatient.querySelector('.patient-prescriptions');
    if (!prescriptions.children.length) {
      const empty = document.createElement('div'); empty.className = 'empty-state'; empty.textContent = t('noPrescriptions'); list.append(empty); return;
    }
    [...prescriptions.children].reverse().forEach(entry => list.append(entry.cloneNode(true)));
  }

  const results = document.getElementById('patientSearchResults');
  function choosePatient(patient) {
    selectedPatient = patient;
    results.hidden = true;
    document.getElementById('patientSearch').value = '';
    renderAppointments();
    renderPatientProfile();
  }
  function searchPatients() {
    const query = document.getElementById('patientSearch').value.trim().toLowerCase();
    results.replaceChildren();
    if (!query) { results.hidden = true; return; }
    const matches = patientRecords.filter(patient => patient.dataset.id.toLowerCase().includes(query) || patient.dataset.name.toLowerCase().includes(query)).slice(0,6);
    if (!matches.length) {
      const empty = document.createElement('div'); empty.className = 'no-results'; empty.textContent = t('noMatches'); results.append(empty);
    } else {
      matches.forEach(patient => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'patient-result'; button.setAttribute('role','option');
        const name = document.createElement('span'); name.textContent = patient.dataset.name;
        const id = document.createElement('small'); id.textContent = patient.dataset.id;
        button.append(name,id); button.addEventListener('click', () => choosePatient(patient)); results.append(button);
      });
    }
    results.hidden = false;
  }
  document.getElementById('patientSearch').addEventListener('input', searchPatients);
  document.getElementById('patientSearch').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); searchPatients(); results.querySelector('.patient-result')?.click(); } });
  document.getElementById('searchPatientButton').addEventListener('click', searchPatients);
  document.addEventListener('click', event => { if (!event.target.closest('.patient-search-panel')) results.hidden = true; });
  document.getElementById('prescriptionForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!selectedPatient || !form.reportValidity()) { showToast(t('medicationRequired')); return; }
    const data = new FormData(form);
    const entry = document.createElement('article');
    entry.className = 'prescription-entry';
    const title = document.createElement('strong');
    title.textContent = `${String(data.get('medication')).trim()} · ${String(data.get('dosage')).trim()}`;
    const details = document.createElement('p');
    const instructions = String(data.get('instructions') || '').trim();
    details.textContent = `${String(data.get('frequency')).trim()} · ${String(data.get('duration')).trim()}${instructions ? ` · ${instructions}` : ''}`;
    entry.append(title,details);
    selectedPatient.querySelector('.patient-prescriptions').append(entry);
    form.reset();
    renderPrescriptions();
    showToast(`${t('prescriptionSaved')} ${selectedPatient.dataset.name}.`);
  });

  appointmentRows.forEach(row => {
    row.addEventListener('click', event => {
      selectedPatient = patientRecords.find(patient => patient.dataset.id === row.dataset.patientId);
      renderAppointments();
      renderPatientProfile();
    });
  });

  window.SANAD_APPOINTMENT_STATUS.subscribe(() => renderAppointments());
  updateLanguage();
})();
