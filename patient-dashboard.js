
(() => {
  const params = new URLSearchParams(location.search);
  let lang = localStorage.getItem('sanad_lang') || (document.documentElement.lang === 'ar' ? 'ar' : 'en');
  let theme = localStorage.getItem('sanad_theme') === 'dark' ? 'dark' : 'light';
  const authorized = sessionStorage.getItem('isLoggedIn') === 'true' &&
    sessionStorage.getItem('userRole') === 'patient';
  const loginUrl = `login.html?${new URLSearchParams({lang,theme})}`;

  if (!authorized) {
    location.replace(loginUrl);
    return;
  }

  document.body.classList.add('patient-body', 'authorized');
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('sanad_theme', theme);
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="search"], table td').forEach(element => element.setAttribute('dir', 'auto'));
  document.getElementById('todayLabel').textContent = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG', {weekday:'short',year:'numeric',month:'short',day:'numeric'});

  const categoryLabels = () => TRANSLATIONS.patientCategories[lang];
  const money = amount => `${Number(amount).toLocaleString('en-US')} EGP`;
  function addChoiceCard(container, {group, id, name, title, subtitle, description, image, rating, price, badge}) {
    const label = document.createElement('label');
    label.className = 'patient-choice-card';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = group;
    input.value = id;
    input.required = true;
    input.dir = 'auto';
    label.appendChild(input);
    const details = document.createElement('span');
    details.className = 'patient-choice-details';
    if (image) {
      const photo = document.createElement('img');
      photo.className = 'patient-choice-photo';
      photo.src = image;
      photo.alt = '';
      photo.loading = 'lazy';
      details.appendChild(photo);
    } else {
      const icon = document.createElement('span');
      icon.className = `patient-choice-icon icon-${badge}`;
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = badge === 'tests' ? 'LAB' : badge === 'scans' ? 'IMG' : 'OR';
      details.appendChild(icon);
    }
    const copy = document.createElement('span');
    copy.className = 'patient-choice-copy';
    const heading = document.createElement('strong');
    heading.textContent = name;
    heading.dir = 'auto';
    copy.appendChild(heading);
    const specialty = document.createElement('span');
    specialty.className = 'patient-choice-specialty';
    specialty.textContent = subtitle;
    copy.appendChild(specialty);
    const descriptionNode = document.createElement('span');
    descriptionNode.className = 'patient-choice-description';
    descriptionNode.textContent = description;
    copy.appendChild(descriptionNode);
    if (title) {
      const titleNode = document.createElement('span');
      titleNode.className = 'patient-choice-title';
      titleNode.textContent = title;
      copy.appendChild(titleNode);
    }
    const footer = document.createElement('span');
    footer.className = 'patient-choice-footer';
    if (rating) {
      const ratingNode = document.createElement('span');
      ratingNode.className = 'patient-choice-rating';
      ratingNode.textContent = `★ ${rating}`;
      footer.appendChild(ratingNode);
    }
    const priceNode = document.createElement('strong');
    priceNode.className = 'patient-choice-price';
    priceNode.textContent = price;
    footer.appendChild(priceNode);
    copy.appendChild(footer);
    details.appendChild(copy);
    label.appendChild(details);
    container.appendChild(label);
  }

  const doctorOptions = document.getElementById('doctorOptions');
  const serviceOptions = document.getElementById('serviceOptions');
  function renderBookingChoices() {
    const selectedDoctor = doctorOptions.querySelector('input[name="doctor"]:checked')?.value || params.get('doctor');
    const selectedService = serviceOptions.querySelector('input[name="service"]:checked')?.value || params.get('service');
    doctorOptions.replaceChildren();
    serviceOptions.replaceChildren();
    DOCTORS.forEach(doctor => addChoiceCard(doctorOptions, {
      group:'doctor',
      id:doctor.id,
      name:doctor[`name_${lang}`] || doctor.name_en || doctor.name,
      subtitle:doctor[`specialty_${lang}`] || doctor.specialty_en || doctor.specialty,
      title:doctor[`title_${lang}`] || doctor.title_en || doctor.title,
      description:doctor[`bio_${lang}`] || doctor.bio_en || doctor.bio,
      image:doctor.image,
      rating:doctor.rating,
      price:doctor.price || money(doctor.fee),
      badge:''
    }));
    SERVICES.forEach(service => addChoiceCard(serviceOptions, {
      group:'service',
      id:service.id,
      name:service[`name_${lang}`] || service.name_en || service.name,
      subtitle:categoryLabels()[service.category],
      description:service[`description_${lang}`] || service.description_en || service.description,
      price:service.price || money(service.price),
      badge:service.category
    }));
    [selectedDoctor && [doctorOptions, 'doctor', selectedDoctor], selectedService && [serviceOptions, 'service', selectedService]]
      .filter(Boolean)
      .forEach(([container, group, value]) => {
        const input = [...container.querySelectorAll(`input[name="${group}"]`)].find(option => option.value === value);
        if (input) input.checked = true;
      });
  }
  renderBookingChoices();
  const requestedDoctor = params.get('doctor');
  if (requestedDoctor) {
    const selectedDoctor = [...doctorOptions.querySelectorAll('input[name="doctor"]')].find(input => input.value === requestedDoctor);
    if (selectedDoctor) selectedDoctor.checked = true;
  }
  const requestedService = params.get('service');
  if (requestedService) {
    const selectedService = [...serviceOptions.querySelectorAll('input[name="service"]')].find(input => input.value === requestedService);
    if (selectedService) selectedService.checked = true;
  }

  const daysInMonth = month => month === 2 ? 29 : [4,6,9,11].includes(month) ? 30 : 31;
  function setupDatePicker(monthSelect, daySelect) {
    function renderPickerOptions() {
      const selectedMonth = monthSelect.value;
      const selectedDay = daySelect.value;
      monthSelect.replaceChildren();
      const monthPlaceholder = document.createElement('option');
      monthPlaceholder.value = '';
      monthPlaceholder.textContent = lang === 'ar' ? 'اختر الشهر' : 'Choose month';
      monthPlaceholder.disabled = true;
      monthPlaceholder.selected = !selectedMonth;
      monthSelect.appendChild(monthPlaceholder);
      Array.from({length:12}, (_, index) =>
        new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {month:'long'}).format(new Date(2024,index,1))
      ).forEach((name, index) => {
        const option = document.createElement('option');
        option.value = String(index + 1);
        option.textContent = name;
        monthSelect.appendChild(option);
      });
      monthSelect.value = selectedMonth;

      daySelect.replaceChildren();
      const dayPlaceholder = document.createElement('option');
      dayPlaceholder.value = '';
      dayPlaceholder.textContent = lang === 'ar' ? 'اختر اليوم' : 'Choose day';
      dayPlaceholder.disabled = true;
      dayPlaceholder.selected = !selectedDay;
      daySelect.appendChild(dayPlaceholder);
      const month = Number(monthSelect.value);
      for (let day = 1; month && day <= daysInMonth(month); day++) {
        const option = document.createElement('option');
        option.value = String(day);
        option.textContent = day.toLocaleString('en-US');
        daySelect.appendChild(option);
      }
      daySelect.value = selectedDay;
    }
    function populateDays() {
      renderPickerOptions();
    }
    monthSelect.addEventListener('change', populateDays);
    renderPickerOptions();
    return renderPickerOptions;
  }
  const refreshAppointmentDatePicker = setupDatePicker(document.getElementById('appointmentMonth'), document.getElementById('appointmentDay'));
  const refreshServiceDatePicker = setupDatePicker(document.getElementById('serviceMonth'), document.getElementById('serviceDay'));
  window.addEventListener('sanadlanguagechange', event => {
    event.preventDefault();
    lang = event.detail.language;
    renderBookingChoices();
    refreshAppointmentDatePicker();
    refreshServiceDatePicker();
    document.getElementById('todayLabel').textContent = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG', {weekday:'short',year:'numeric',month:'short',day:'numeric'});
  });

  const panels = Array.from(document.querySelectorAll('[data-panel]'));
  const navigation = Array.from(document.querySelectorAll('#patientNav [data-section]'));
  let activeSection = '';
  function updateActiveSection(name, updateLocation = false) {
    panels.forEach(panel => panel.classList.toggle('active-section', panel.dataset.panel === name));
    navigation.forEach(link => link.classList.toggle('active', link.dataset.section === name));
    if (activeSection === name) return;
    activeSection = name;
    if (updateLocation) {
      const routeParams = new URLSearchParams(location.search);
      routeParams.set('lang', lang);
      routeParams.set('theme', theme);
      history.replaceState({ section: name }, '', `${location.pathname}?${routeParams}#${name}`);
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
    updateActiveSection(currentPanel.dataset.panel, true);
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
  navigation.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const section = link.dataset.section;
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateActiveSection(section, true);
  }));
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

  window.__SANAD_REVIEWS__ = Array.isArray(window.__SANAD_REVIEWS__) ? window.__SANAD_REVIEWS__ : [];
  document.querySelectorAll('[data-rating-widget]').forEach((widget, index) => {
    const stars = Array.from(widget.querySelectorAll('[data-star]'));
    const status = widget.querySelector('.rating-value');
    const context = widget.closest('tr');
    const reviewType = context.cells[0].textContent.toLowerCase().includes('service') ? 'service' : 'doctor';
    const reviewTarget = context.cells[2].textContent.trim();
    const feedback = document.getElementById('reviewFeedbackTemplate').content.cloneNode(true);
    const feedbackLabel = feedback.querySelector('.review-feedback-label');
    const feedbackField = feedback.querySelector('.review-feedback-text');
    const reviewId = `patient-review-${index + 1}`;
    feedbackField.id = reviewId;
    feedbackField.setAttribute('aria-label', lang === 'ar' ? 'اكتب تقييمك' : 'Write a review');
    feedbackField.placeholder = lang === 'ar' ? 'شاركنا تفاصيل تجربتك' : 'Share details about your experience';
    feedbackLabel.htmlFor = reviewId;
    feedbackLabel.firstChild.textContent = lang === 'ar' ? 'اكتب تقييمك' : 'Write a review';
    const submitReview = feedback.querySelector('.review-submit');
    submitReview.textContent = lang === 'ar' ? 'إرسال التقييم' : 'Submit review';
    widget.appendChild(feedback);
    function rate(value) {
      stars.forEach(star => {
        const selected = Number(star.dataset.star) <= value;
        star.classList.toggle('active', selected);
        star.setAttribute('aria-pressed', String(selected));
      });
      status.textContent = `${window.sanadTranslate('Rated', lang)} ${value}/5`;
      widget.dataset.rating = String(value);
    }
    stars.forEach(star => {
      star.addEventListener('click', () => rate(Number(star.dataset.star)));
      star.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          rate(Number(star.dataset.star));
        }
      });
    });
    submitReview.addEventListener('click', () => {
      const rating = Number(widget.dataset.rating);
      if (!rating || !feedbackField.reportValidity()) {
        if (!rating) status.textContent = lang === 'ar' ? 'اختر عدد النجوم أولاً' : 'Select a star rating first';
        return;
      }
      window.__SANAD_REVIEWS__.push({
        id: `review-${Date.now()}-${window.__SANAD_REVIEWS__.length + 1}`,
        type: reviewType,
        target: reviewTarget,
        rating,
        feedback: feedbackField.value.trim(),
        submittedAt: new Date().toISOString()
      });
      status.textContent = lang === 'ar' ? 'تم إرسال التقييم' : 'Review submitted';
      feedbackField.value = '';
    });
  });

  const confirmation = document.getElementById('bookingConfirmation');
  const confirmationTitle = document.getElementById('confirmationTitle');
  const confirmationDetails = document.getElementById('confirmationDetails');
  function closeConfirmation() {
    confirmation.classList.remove('open');
    confirmation.setAttribute('aria-hidden', 'true');
  }
  function submitBooking(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const month = Number(formData.get('month'));
    const day = Number(formData.get('day'));
    if (!month || !day || day > daysInMonth(month)) return;
    const itemId = String(formData.get(form.id === 'appointmentForm' ? 'doctor' : 'service'));
    const catalogItem = form.id === 'appointmentForm'
      ? DOCTORS.find(doctor => doctor.id === itemId)
      : SERVICES.find(service => service.id === itemId);
    if (!catalogItem) return;
    const item = lang === 'ar' ? catalogItem.arName : catalogItem.name;
    const bookingDate = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {day:'numeric',month:'long'})
      .format(new Date(2024, month - 1, day));
    confirmationTitle.textContent = window.sanadTranslate(form.id === 'appointmentForm'
      ? 'Appointment Request Prepared Successfully'
      : 'Service Request Prepared Successfully', lang);
    confirmationDetails.textContent = `${item} · ${bookingDate} — ${window.sanadTranslate('Your request is ready for the hospital team.', lang)}`;
    confirmationDetails.dir = 'auto';
    confirmation.classList.add('open');
    confirmation.setAttribute('aria-hidden', 'false');
    document.getElementById('closeConfirmation').focus();
    form.reset();
  }
  document.getElementById('appointmentForm').addEventListener('submit', submitBooking);
  document.getElementById('serviceForm').addEventListener('submit', submitBooking);
  document.getElementById('closeConfirmation').addEventListener('click', closeConfirmation);
  confirmation.addEventListener('click', event => {
    if (event.target === confirmation) closeConfirmation();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && confirmation.classList.contains('open')) closeConfirmation();
  });

  const requestedSection = location.hash.slice(1) || (params.get('booking') === 'service' ? 'services' : '');
  if (panels.some(panel => panel.dataset.panel === requestedSection)) showPanel(requestedSection);
})();
