(() => {
  const query = new URLSearchParams(location.search);
  const language = document.documentElement.lang;
  const theme = localStorage.getItem('sanad_theme') || 'light';
  const allowedAdminRoles = ['super', 'patient', 'staff'];
  const storedAdminRole = localStorage.getItem('admin_role');
  const requestedAdminRole = sessionStorage.getItem('userRole') === 'admin'
    ? storedAdminRole || query.get('adminRole') || 'super'
    : query.get('adminRole') || storedAdminRole || 'super';
  const adminRole = allowedAdminRoles.includes(requestedAdminRole) ? requestedAdminRole : 'super';
  localStorage.setItem('admin_role', adminRole);

  const hospitalUrl = new URL('index.html', location.href);
  hospitalUrl.search = new URLSearchParams({ lang: language, theme, adminRole }).toString();
  document.querySelectorAll('a[href="index.html"]').forEach(link => { link.href = hospitalUrl.href; });

  window.__SANAD_SESSION__ = window.__SANAD_SESSION__ || { name: 'Sanad Admin', role: 'admin', adminRole };
  const currentUser = { name: window.__SANAD_SESSION__.name || 'Sanad Admin', role: 'admin', adminRole };

  const copy = TRANSLATIONS.admin;
  let lang = language === 'ar' ? 'ar' : 'en';
  let dark = theme === 'dark';
  const t = key => copy[lang][key] ?? copy.en[key] ?? key;
  const requestText = key => TRANSLATIONS.adminRequests[lang][key] || TRANSLATIONS.adminRequests.en[key];
  const rbacText = key => TRANSLATIONS.adminRbac[lang][key] || TRANSLATIONS.adminRbac.en[key];
  const fmtDate = date => new Date(`${date}T12:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG',{day:'numeric',month:'short'});
  document.querySelectorAll('[data-request-i18n]').forEach(element => { element.textContent = requestText(element.dataset.requestI18n); });
  document.querySelectorAll('[data-rbac-i18n]').forEach(element => { element.textContent = rbacText(element.dataset.rbacI18n); });
  document.querySelectorAll('[data-rbac]').forEach(element => {
    element.hidden = !element.dataset.rbac.split(/\s+/).includes(adminRole);
  });
  const roleTitleKey = adminRole === 'patient' ? 'rolePatient' : adminRole === 'staff' ? 'roleStaff' : 'roleSuper';
  const formatMoney = value => `${Number(value || 0).toLocaleString('en-US')} EGP`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const id = () => `sanad-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const read = (key, seed) => {
    const currentState = window.__SANAD_ADMIN_STATE__ || {};
    return Object.prototype.hasOwnProperty.call(currentState, key) ? currentState[key] : seed;
  };
  const write = (key, value) => {
    window.__SANAD_ADMIN_STATE__ = { ...(window.__SANAD_ADMIN_STATE__ || {}), [key]: value };
  };
  const storage = {
    staff: 'sanad_admin_staff', departments: 'sanad_departments', doctors: 'sanad_admin_doctors', resources: 'sanad_admin_resources', inventory: 'sanad_admin_inventory', alerts: 'sanad_admin_alerts'
  };
  const tableRecords = (selector, convert) => [...document.querySelectorAll(selector)].map(row => convert(row.dataset));
  const seed = {
    staff:tableRecords('#staffRows tr[data-id]', row => ({id:row.id,name:row.name,position:row.position,clinic:row.clinic,shift:row.shift,active:row.active === 'true'})),
    departments:tableRecords('#departmentRows tr[data-id]', row => ({id:row.id,name:row.name,arName:row.arName,lead:row.lead,clinic:row.clinic,status:row.status})),
    doctors:tableRecords('#doctorRows tr[data-id]', row => ({id:row.id,name:row.name,arName:row.arName,departmentId:row.departmentId,departmentName:row.departmentName,specialty:row.specialty,title:row.title,clinic:row.clinic,fee:Number(row.fee),active:row.active === 'true'})),
    resources:tableRecords('#resourceRows tr[data-id]', row => ({id:row.id,name:row.name,arName:row.arName,category:row.category,price:Number(row.price),duration:row.duration,clinic:row.clinic,preparation:row.preparation})),
    inventory:tableRecords('#inventoryRows tr[data-id]', row => ({id:row.id,name:row.name,category:row.category,quantity:Number(row.quantity),threshold:Number(row.threshold)})),
    alerts:[]
  };
  const stateSeed = Object.fromEntries(Object.entries(storage).map(([key, name]) => [key, seed[key]]));
  if (!window.__SANAD_ADMIN_STATE__) {
    window.__SANAD_ADMIN_STATE__ = { ...stateSeed, [storage.departments]: seed.departments };
  }
  
  
  
  function renderNurseDirectory() {
    bodyRows('#nurseRows', records.staff.filter(member => /nurse/i.test(member.position)), member => dataRow(member, [
      tableCell(member.name, 'cell-title'), tableCell(member.position), tableCell(member.clinic),
      tableCell(t(member.shift.toLowerCase())), status(member.active)
    ]));
  }
  const records = Object.fromEntries(Object.entries(storage).map(([key, name]) => [key, read(name, seed[key])]));
  let doctorsMigrated = false;
  records.doctors.forEach(doctor => {
    const department = records.departments.find(item => item.id === doctor.departmentId || item.name.toLocaleLowerCase() === String(doctor.departmentName || doctor.department || doctor.specialty || '').toLocaleLowerCase());
    if (!department) return;
    if (doctor.departmentId !== department.id || doctor.departmentName !== department.name) doctorsMigrated = true;
    doctor.departmentId = department.id;
    doctor.departmentName = department.name;
  });
  if (doctorsMigrated) write(storage.doctors, records.doctors);
  const setText = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };
  const initialStaffRequests = tableRecords('#staffRequestRows tr[data-id]', row => ({
    id:row.id, name:row.name, role:row.role || 'doctor', email:row.email || '', mobile:row.mobile || '',
    specialty:row.specialty, licenseId:row.license, submitted:row.submitted, status:row.status || 'pending'
  }));
  const adminRequestMocks = [
    { id:'request-patient-admin-demo', name:'Patient Admin Applicant', email:'patient-admin-applicant@sanad.com', mobile:'+201234567893', role:'patient_admin', specialty:'Patient Services', licenseId:'PA-EG-2026-01', submitted:'2026-10-24', status:'pending' },
    { id:'request-staff-admin-demo', name:'Staff Admin Applicant', email:'staff-admin-applicant@sanad.com', mobile:'+201234567894', role:'staff_admin', specialty:'Administration', licenseId:'SA-EG-2026-01', submitted:'2026-10-24', status:'pending' }
  ];
  const staffRequests = Array.isArray(window.__SANAD_STAFF_REQUESTS__)
    ? window.__SANAD_STAFF_REQUESTS__
    : [...initialStaffRequests, ...adminRequestMocks];
  window.__SANAD_STAFF_REQUESTS__ = staffRequests;
  window.__SANAD_USERS__ = Array.isArray(window.__SANAD_USERS__) ? window.__SANAD_USERS__ : [
    { id:'patient-admin-request', name:'Patient Admin Applicant', email:'patient-admin-applicant@sanad.com', mobile:'+201234567893', password:'patientadmin123', role:'admin', adminRole:'patient', status:'pending' },
    { id:'staff-admin-request', name:'Staff Admin Applicant', email:'staff-admin-applicant@sanad.com', mobile:'+201234567894', password:'staffadmin123', role:'admin', adminRole:'staff', status:'pending' }
  ];
  function updateAdminAccountStatus(request, status) {
    if (!['admin', 'patient_admin', 'staff_admin'].includes(request.role)) return;
    const account = window.__SANAD_USERS__.find(user =>
      String(user.email || '').toLowerCase() === String(request.email || '').toLowerCase()
    );
    if (!account) throw new Error(`Could not find the Admin account for request ${request.id}.`);
    account.status = status;
  }
  function addApprovedStaffToDirectory(request) {
    if (['admin', 'patient_admin', 'staff_admin'].includes(request.role)) return;
    const staffMember = {
      id: request.id,
      name: request.name,
      position: request.role === 'doctor' ? 'Doctor' : 'Nurse',
      clinic: request.specialty,
      shift: 'Unassigned',
      active: true
    };
    if (!records.staff.some(member => member.id === staffMember.id)) records.staff.unshift(staffMember);
    write(storage.staff, records.staff);
    if (request.role === 'doctor' && !records.doctors.some(doctor => doctor.id === request.id)) {
      const department = records.departments.find(item =>
        item.name.toLocaleLowerCase() === request.specialty.toLocaleLowerCase()
      ) || records.departments[0];
      records.doctors.unshift({
        id: request.id,
        name: request.name,
        arName: '',
        departmentId: department?.id || '',
        departmentName: department?.name || request.specialty,
        specialty: request.specialty,
        title: 'Doctor',
        clinic: department?.clinic || request.specialty,
        fee: 0,
        active: true
      });
      write(storage.doctors, records.doctors);
    }
  }
  staffRequests.filter(request => request.status === 'approved').forEach(addApprovedStaffToDirectory);

  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.body.classList.toggle('dark',dark);
  document.body.classList.add('authorized');
  document.getElementById('adminUser').textContent = currentUser.name || currentUser.email;
  document.getElementById('adminRoleTitle').textContent = rbacText(roleTitleKey);
  document.getElementById('languageToggle').textContent = lang === 'ar' ? 'EN' : 'العربية';
  const themeToggle = document.getElementById('themeToggle');
  const themeIcons = {
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M2 12h2m16 0h2M4.9 19.1l1.5-1.5m12.7-12.7 1.5-1.5"/></svg>'
  };
  themeToggle.innerHTML = themeIcons[dark ? 'dark' : 'light'];
  document.getElementById('todayLabel').textContent = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG',{weekday:'short',year:'numeric',month:'short',day:'numeric'});
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  document.getElementById('brandText').innerHTML = `${escapeHtml(t('brand'))}<small>${escapeHtml(t('brandSub'))}</small>`;
  themeToggle.addEventListener('click',() => { dark = !dark; window.__SANAD_PREFS__ = { ...(window.__SANAD_PREFS__ || {}), theme: dark ? 'dark' : 'light' }; localStorage.setItem('sanad_theme', dark ? 'dark' : 'light'); document.documentElement.classList.toggle('dark', dark); document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light'); document.body.classList.toggle('dark',dark); themeToggle.innerHTML = themeIcons[dark ? 'dark' : 'light']; });
  document.getElementById('logoutButton').addEventListener('click',() => { window.__SANAD_SESSION__ = null; sessionStorage.removeItem('isLoggedIn'); sessionStorage.removeItem('userRole'); localStorage.removeItem('admin_role'); localStorage.removeItem('sanad_session_active'); localStorage.removeItem('sanad_session_role'); localStorage.removeItem('sanad_session_name'); location.href = `index.html?lang=${lang}&theme=${dark ? 'dark' : 'light'}`; });

  function status(value) {
    const text = value === 'archived' ? t('archived') : value === false ? t('inactive') : t('active');
    const cls = value === 'archived' ? 'archived' : value === false ? 'inactive' : '';
    const pill = document.createElement('span');
    pill.className = `status-pill ${cls}`;
    pill.textContent = text;
    return pill;
  }
  function actions(type,record) {
    const container = document.createElement('div');
    container.className = 'row-actions';
    const addAction = (action, label, className = 'row-action') => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.dataset.action = action;
      button.dataset.type = type;
      button.dataset.id = record.id;
      button.textContent = label;
      container.appendChild(button);
    };
    addAction('edit', t('edit'));
    if (type === 'department') addAction('archive', record.status === 'archived' ? t('restore') : t('archive'));
    addAction('delete', t('delete'), 'row-action danger');
    return container;
  }
  const tableCell = (value, className = '') => {
    const cell = document.createElement('td');
    cell.textContent = value;
    if (className) cell.className = className;
    return cell;
  };
  const dataRow = (item, values) => {
    const row = document.createElement('tr');
    Object.entries(item).forEach(([key, value]) => {
      if (value !== undefined && value !== null && typeof value !== 'object') row.dataset[key] = String(value);
    });
    values.forEach(value => {
      if (value instanceof HTMLTableCellElement) {
        row.appendChild(value);
        return;
      }
      const cell = document.createElement('td');
      cell.appendChild(value);
      row.appendChild(cell);
    });
    return row;
  };
  const bodyRows = (selector,items,renderRow) => {
    const body = document.querySelector(selector);
    body.replaceChildren();
    if (items.length) {
      items.forEach(item => body.appendChild(renderRow(item)));
      return;
    }
    const row = document.createElement('tr');
    const cell = tableCell(t('noRecords'), 'empty-state');
    cell.colSpan = 8;
    row.appendChild(cell);
    body.appendChild(row);
  };
  function renderStaffManagement() {
    bodyRows('#staffRows',records.staff,item => dataRow(item, [
      tableCell(item.name, 'cell-title'), tableCell(item.position), tableCell(item.clinic),
      tableCell(t(item.shift.toLowerCase())), status(item.active), actions('staff',item)
    ]));
  }
  function renderDepartmentManager() {
    bodyRows('#departmentRows',records.departments,item => dataRow(item, [
      tableCell(item.name, 'cell-title'), tableCell(item.lead || '—'), tableCell(item.clinic || '—'),
      tableCell(String(records.doctors.filter(doctor => doctor.departmentId === item.id).length), 'department-count'),
      status(item.status), actions('department',item)
    ]));
  }
  const departmentForDoctor = doctor => records.departments.find(item => item.id === doctor.departmentId) || records.departments.find(item => item.name === doctor.departmentName) || null;
  function renderDoctorDepartmentOptions(selectedId = document.getElementById('doctorDepartment').value) {
    const select = document.getElementById('doctorDepartment');
    const departments = records.departments.filter(item => item.status !== 'archived' || item.id === selectedId);
    select.innerHTML = `<option value="">${escapeHtml(t('chooseDepartment'))}</option>${departments.map(item => `<option value="${escapeHtml(item.id)}" dir="auto">${escapeHtml(lang === 'ar' && item.arName ? item.arName : item.name)}</option>`).join('')}`;
    if (departments.some(item => item.id === selectedId)) select.value = selectedId;
  }
  function renderDoctors() {
    bodyRows('#doctorRows',records.doctors,item => dataRow(item, [
      tableCell(item.name, 'cell-title'), tableCell(departmentForDoctor(item)?.name || item.departmentName || '—'),
      tableCell(item.specialty), tableCell(item.clinic), tableCell(formatMoney(item.fee)),
      status(item.active), actions('doctor',item)
    ]));
  }
  function renderResources() {
    bodyRows('#resourceRows',records.resources,item => dataRow(item, [
      tableCell(item.name, 'cell-title'), tableCell(t(item.category)), tableCell(formatMoney(item.price)),
      tableCell(item.duration), actions('resource',item)
    ]));
  }
  function renderStaffRequests() {
    const body = document.getElementById('staffRequestRows');
    body.replaceChildren();
    staffRequests.forEach(request => {
      const row = document.createElement('tr');
      row.dataset.id = request.id;
      row.append(
        tableCell(request.name, 'cell-title'),
        tableCell(requestText(request.role)),
        tableCell(request.specialty),
        tableCell(request.licenseId),
        tableCell(new Date(`${request.submitted}T12:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {day:'numeric',month:'short',year:'numeric'}))
      );
      const actionCell = document.createElement('td');
      if (request.status === 'pending') {
        const actions = document.createElement('div');
        actions.className = 'row-actions';
        [['approve', requestText('approve'), 'row-action'], ['reject', requestText('reject'), 'row-action danger']].forEach(([action, label, className]) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = className;
          button.dataset.staffRequestAction = action;
          button.dataset.id = request.id;
          button.textContent = label;
          actions.appendChild(button);
        });
        actionCell.appendChild(actions);
      } else {
        const badge = document.createElement('span');
        badge.className = `status-pill ${request.status}`;
        badge.textContent = requestText(request.status);
        actionCell.appendChild(badge);
      }
      row.appendChild(actionCell);
      body.appendChild(row);
    });
  }
  function renderInventory() {
    const low = records.inventory.filter(item => Number(item.quantity) <= Number(item.threshold));
    bodyRows('#inventoryRows',records.inventory,item => {
      const isLow = Number(item.quantity) <= Number(item.threshold);
      const stockStatus = document.createElement('span');
      stockStatus.className = `status-pill ${isLow ? 'low' : ''}`;
      stockStatus.textContent = isLow ? t('lowStock') : t('stocked');
      const actionCell = document.createElement('div');
      actionCell.className = 'row-actions';
      const itemActions = actions('inventory',item);
      while (itemActions.firstChild) actionCell.appendChild(itemActions.firstChild);
      const decrease = document.createElement('button');
      decrease.type = 'button';
      decrease.className = 'row-action';
      decrease.dataset.action = 'decrease';
      decrease.dataset.type = 'inventory';
      decrease.dataset.id = item.id;
      decrease.textContent = '−1';
      actionCell.appendChild(decrease);
      return dataRow(item, [
        tableCell(item.name, 'cell-title'),
        tableCell(t(item.category === 'Surgical supply' ? 'surgicalSupply' : item.category === 'Medication' ? 'medication' : item.category === 'PPE' ? 'ppe' : 'laboratory')),
        tableCell(Number(item.quantity).toLocaleString('en-US')), tableCell(Number(item.threshold).toLocaleString('en-US')),
        stockStatus, actionCell
      ]);
    });
    const pill = document.getElementById('inventoryAlertPill');
    pill.textContent = t('alertCount')(low.length);
    pill.classList.toggle('has-alerts',low.length > 0);
    const banner = document.getElementById('inventoryAlertBanner');
    banner.hidden = low.length === 0;
    banner.textContent = low.length
      ? `${t('alertCount')(low.length)}: ${low.map(item => `${item.name} (${item.quantity})`).join(', ')}`
      : '';
    document.getElementById('alertsList').innerHTML = low.length
      ? low.map(item => `<article class="alert-entry"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(t('alertLow')(item.name,item.quantity))}</span></article>`).join('')
      : `<div class="empty-state">${t('noAlerts')}</div>`;
  }
  function renderPatientAdminData() {
    document.getElementById('patientRecordCount').textContent = String(PATIENT_MEDICAL_RECORDS.length);
    bodyRows('#patientRecordsRows', PATIENT_MEDICAL_RECORDS, patient => dataRow(patient, [
      tableCell(patient.name, 'cell-title'), tableCell(String(patient.age)), tableCell(patient.bloodType),
      tableCell(patient.allergies), tableCell(patient.conditions), tableCell(patient.medications), tableCell(fmtDate(patient.lastVisit))
    ]));
    bodyRows('#patientVisitsRows', PATIENT_UPCOMING_VISITS, visit => dataRow(visit, [
      tableCell(visit.patient, 'cell-title'), tableCell(fmtDate(visit.date)), tableCell(visit.time),
      tableCell(visit.doctor), tableCell(visit.reason)
    ]));
    bodyRows('#assignedDoctorsRows', PATIENT_ASSIGNED_DOCTORS, doctor => dataRow(doctor, [
      tableCell(doctor.doctor, 'cell-title'), tableCell(doctor.specialty), tableCell(String(doctor.patientCount)),
      tableCell(fmtDate(doctor.nextVisit))
    ]));
    bodyRows('#admissionLogsRows', PATIENT_ADMISSION_LOGS, admission => dataRow(admission, [
      tableCell(admission.patient, 'cell-title'), tableCell(fmtDate(admission.admitted)),
      tableCell(fmtDate(admission.discharged)), tableCell(admission.department), tableCell(admission.outcome)
    ]));
  }
  function renderAll() { renderStaffManagement(); renderDepartmentManager(); renderDoctorDepartmentOptions(); renderDoctors(); renderNurseDirectory(); renderResources(); renderStaffRequests(); renderInventory(); renderPatientAdminData(); }

  const forms = {
    staff:{form:'staffForm',key:'staff',fields:['name','position','clinic','shift','active']},
    department:{form:'departmentForm',key:'departments',fields:['name','arName','lead','clinic','status']},
    doctor:{form:'doctorForm',key:'doctors',fields:['name','arName','departmentId','specialty','title','clinic','fee','active']},
    resource:{form:'resourceForm',key:'resources',fields:['name','arName','category','price','duration','clinic','preparation']},
    inventory:{form:'inventoryForm',key:'inventory',fields:['name','category','quantity','threshold']}
  };
  function resetForm(type) {
    const spec = forms[type]; if (!spec) return;
    const form = document.getElementById(spec.form); form.reset(); form.elements.id.value = '';
    if (form.elements.active) form.elements.active.checked = true;
    const button = form.querySelector('[type=submit]'); button.textContent = t(({staff:'saveStaff',department:'saveDepartment',doctor:'saveDoctor',resource:'saveResource',inventory:'saveInventory'})[type]);
  }
  function fillForm(type,item) {
    const form = document.getElementById(forms[type].form);
    if (type === 'doctor') renderDoctorDepartmentOptions(item.departmentId || departmentForDoctor(item)?.id || '');
    form.elements.id.value = item.id;
    forms[type].fields.forEach(field => { if (form.elements[field]?.type === 'checkbox') form.elements[field].checked = Boolean(item[field]); else if (form.elements[field]) form.elements[field].value = item[field] ?? ''; });
    form.querySelector('[type=submit]').textContent = t('edit');
    form.scrollIntoView({behavior:'smooth',block:'center'});
  }
  function notify(message) {
    const toast = document.getElementById('adminToast'); toast.textContent = message; toast.classList.add('show');
    clearTimeout(notify.timer); notify.timer = setTimeout(() => toast.classList.remove('show'),2600);
  }
  function saveDepartments() {
    write(storage.departments, records.departments);
    window.__SANAD_ADMIN_STATE__ = { ...(window.__SANAD_ADMIN_STATE__ || {}), [storage.departments]: records.departments };
  }
  Object.entries(forms).forEach(([type,spec]) => document.getElementById(spec.form).addEventListener('submit',event => {
    event.preventDefault(); const form = event.currentTarget; if (!form.reportValidity()) return;
    const data = new FormData(form); const oldId = String(data.get('id') || '');
    const item = Object.fromEntries(spec.fields.map(field => [field,form.elements[field].type === 'checkbox' ? form.elements[field].checked : form.elements[field].type === 'number' ? Number(data.get(field)) : String(data.get(field) ?? '').trim()]));
    item.id = oldId || id();
    if (type === 'department') {
      const normalized = item.name.trim().toLocaleLowerCase();
      if (records.departments.some(department => department.id !== oldId && department.name.trim().toLocaleLowerCase() === normalized)) { notify(t('duplicateDepartment')); return; }
      if (!item.arName) item.arName = '';
    }
    if (type === 'doctor') {
      const department = records.departments.find(entry => entry.id === item.departmentId);
      if (!department) { form.elements.departmentId.focus(); return; }
      item.departmentName = department.name;
    }
    if (type === 'inventory' && (!Number.isFinite(item.quantity) || !Number.isFinite(item.threshold) || item.quantity < 0 || item.threshold < 0)) {
      form.elements.quantity.focus();
      return;
    }
    const index = records[spec.key].findIndex(row => row.id === oldId);
    if (index >= 0) records[spec.key][index] = {...records[spec.key][index],...item}; else records[spec.key].unshift(item);
    if (type === 'department') saveDepartments(); else write(storage[spec.key], records[spec.key]);
    window.__SANAD_ADMIN_STATE__ = { ...(window.__SANAD_ADMIN_STATE__ || {}), ...Object.fromEntries(Object.entries(storage).map(([key, name]) => [name, records[key]])) };
    resetForm(type); renderAll(); notify(t('saved'));
  }));
  const departmentDialog = document.getElementById('departmentCreateDialog');
  document.getElementById('quickAddDepartment').addEventListener('click',() => departmentDialog.showModal());
  document.getElementById('closeDepartmentDialog').addEventListener('click',() => departmentDialog.close());
  document.getElementById('cancelDepartmentDialog').addEventListener('click',() => departmentDialog.close());
  document.getElementById('quickDepartmentForm').addEventListener('submit',event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const normalized = name.toLocaleLowerCase();
    if (records.departments.some(item => item.name.trim().toLocaleLowerCase() === normalized)) {
      form.elements.name.setCustomValidity(t('duplicateDepartment'));
      form.reportValidity();
      form.elements.name.setCustomValidity('');
      return;
    }
    const department = {
      id:id(),
      name,
      arName:String(data.get('arName') || '').trim(),
      lead:t('unassigned'),
      clinic:t('unassigned'),
      status:'active'
    };
    records.departments.unshift(department);
    saveDepartments();
    renderDepartmentManager();
    renderDoctorDepartmentOptions(department.id);
    document.getElementById('doctorDepartment').value = department.id;
    form.reset();
    departmentDialog.close();
    notify(t('saved'));
  });
  document.getElementById('staffRequestRows').addEventListener('click', event => {
    const button = event.target.closest('[data-staff-request-action]');
    if (!button) return;
    const request = staffRequests.find(item => item.id === button.dataset.id);
    if (!request || request.status !== 'pending') return;
    const nextStatus = button.dataset.staffRequestAction === 'approve' ? 'approved' : 'rejected';
    updateAdminAccountStatus(request, nextStatus);
    request.status = nextStatus;
    if (request.status === 'approved') addApprovedStaffToDirectory(request);
    window.__SANAD_ADMIN_STATE__ = {
      ...(window.__SANAD_ADMIN_STATE__ || {}),
      [storage.staff]: records.staff,
      [storage.doctors]: records.doctors
    };
    renderStaffRequests();
    renderNurseDirectory();
    renderStaffManagement();
    renderDoctors();
  });

  document.getElementById('inventoryRows').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || !event.currentTarget.contains(button)) return;
    event.stopPropagation();
    const {action, id:recordId} = button.dataset;
    const item = records.inventory.find(row => row.id === recordId);
    if (!item) return;
    if (action === 'decrease') {
      item.quantity = Math.max(0, Number(item.quantity) - 1);
      write(storage.inventory, records.inventory);
      renderInventory();
      notify(item.quantity <= item.threshold ? t('alertLow')(item.name,item.quantity) : t('saved'));
      return;
    }
    if (action === 'edit') {
      fillForm('inventory', item);
      return;
    }
    if (action === 'delete') {
      if (!window.confirm(t('confirmDelete'))) return;
      records.inventory = records.inventory.filter(row => row.id !== recordId);
      write(storage.inventory, records.inventory);
      renderInventory();
      notify(t('saved'));
    }
  });

  document.addEventListener('click',event => {
    const button = event.target.closest('[data-action],[data-form-reset]'); if (!button) return;
    if (button.dataset.formReset) { resetForm(button.dataset.formReset); return; }
    const {action,type,id:recordId} = button.dataset;
    if (type === 'inventory') return;
    if (action === 'decrease') {
      const item = records.inventory.find(row => row.id === recordId); if (!item) return;
      item.quantity = Math.max(0,Number(item.quantity) - 1); recordLowStock(item); write(storage.inventory,records.inventory); renderInventory(); notify(item.quantity <= item.threshold ? t('alertLow')(item.name,item.quantity) : t('saved')); return;
    }
    if (action === 'edit') {
      const row = records[forms[type].key].find(item => item.id === recordId); if (row) fillForm(type,row); return;
    }
    if (action === 'archive') {
      const item = records.departments.find(row => row.id === recordId); if (!item) return;
      item.status = item.status === 'archived' ? 'active' : 'archived'; saveDepartments(); renderDepartmentManager(); renderDoctorDepartmentOptions(); notify(t('saved')); return;
    }
    if (action === 'delete') {
      if (!window.confirm(t('confirmDelete'))) return;
      if (type === 'department' && records.doctors.some(doctor => doctor.departmentId === recordId)) { notify(t('cannotDeleteDepartment')); return; }
      const spec = forms[type]; records[spec.key] = records[spec.key].filter(item => item.id !== recordId);
      if (type === 'department') saveDepartments(); else write(storage[spec.key], records[spec.key]);
      window.__SANAD_ADMIN_STATE__ = { ...(window.__SANAD_ADMIN_STATE__ || {}), ...Object.fromEntries(Object.entries(storage).map(([key, name]) => [name, records[key]])) };
      renderAll(); notify(t('saved'));
    }
  });
  const adminNavLinks = [...document.querySelectorAll('#adminNav a[data-section]')];
  const visibleAdminSections = () => adminNavLinks
    .filter(link => !link.hidden)
    .map(link => document.getElementById(link.dataset.section))
    .filter(section => section && !section.hidden);
  let activeAdminSection = '';
  function updateAdminSection(sectionId, updateLocation = false) {
    adminNavLinks.forEach(link => link.classList.toggle('active', link.dataset.section === sectionId));
    if (activeAdminSection === sectionId) return;
    activeAdminSection = sectionId;
    if (updateLocation) {
      const routeParams = new URLSearchParams(location.search);
      routeParams.set('lang', lang);
      routeParams.set('theme', dark ? 'dark' : 'light');
      history.replaceState({ section: sectionId }, '', `${location.pathname}?${routeParams}#${sectionId}`);
    }
  }
  function syncAdminSection() {
    const sections = visibleAdminSections();
    if (!sections.length) return;
    const activationPoint = window.innerHeight * 0.3;
    let currentSection = sections[0];
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= activationPoint) currentSection = section;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      currentSection = sections[sections.length - 1];
    }
    updateAdminSection(currentSection.id, true);
  }
  let adminScrollSyncScheduled = false;
  function scheduleAdminSectionSync() {
    if (adminScrollSyncScheduled) return;
    adminScrollSyncScheduled = true;
    window.requestAnimationFrame(() => {
      adminScrollSyncScheduled = false;
      syncAdminSection();
    });
  }
  adminNavLinks.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const sectionId = link.dataset.section;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateAdminSection(sectionId, true);
  }));
  window.addEventListener('scroll', scheduleAdminSectionSync, { passive: true });
  window.addEventListener('resize', scheduleAdminSectionSync);
  renderAll();
  scheduleAdminSectionSync();
})();
