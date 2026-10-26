const authText = TRANSLATIONS.auth;
const params=new URLSearchParams(location.search);
function readTheme(){return localStorage.getItem('sanad_theme') || 'light';}
function writeTheme(value){window.__SANAD_PREFS__ = Object.assign({}, window.__SANAD_PREFS__ || {}, {theme:value});localStorage.setItem('sanad_theme',value);document.documentElement.classList.toggle('dark',value==='dark');document.documentElement.setAttribute('data-theme',value);document.body.classList.toggle('dark',value==='dark');params.set('theme',value);history.replaceState(null,'',`${location.pathname}?${params}${location.hash}`);}
let language=document.documentElement.lang==='ar'?'ar':'en';
let darkMode=readTheme()==='dark';
writeTheme(darkMode?'dark':'light');
let resetStep='request';
let resetAddress='';
const page=document.body.dataset.authPage;
const text=()=>authText[language];
const route=file=>{const routeParams=new URLSearchParams(params);routeParams.set('lang',language);routeParams.set('theme',darkMode?'dark':'light');return `${file}?${routeParams}`};
const homeRoute=()=>route('index.html');
const eyeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
function preserveForm(){const form=document.getElementById('authForm');if(!form)return{};const values={};form.querySelectorAll('input,select').forEach(field=>{if(!field.name)return;if(field.type==='radio'){if(field.checked)values[field.name]=field.value}else if(field.type==='checkbox')values[field.name]=field.checked;else values[field.name]=field.value});return values}
function restoreForm(values){const form=document.getElementById('authForm');if(!form)return;form.querySelectorAll('input,select').forEach(field=>{if(!(field.name in values))return;if(field.type==='radio')field.checked=field.value===values[field.name];else if(field.type==='checkbox')field.checked=values[field.name];else field.value=values[field.name]})}
function passwordField(id,label){const t=text();return `<div class="auth-field full"><label for="${id}">${label}</label><div class="password-control"><input class="auth-input" id="${id}" name="${id}" type="password" autocomplete="${id==='loginPassword'?'current-password':'new-password'}" minlength="8" required><button class="password-toggle" type="button" data-password="${id}" aria-label="${t.show}" title="${t.show}">${eyeIcon}</button></div></div>`}
function signupForm(){const t=text();const messages=TRANSLATIONS.authValidation[language];return `<form class="auth-form" id="authForm" novalidate><div class="auth-field full"><label for="patientName">${t.name}</label><input class="auth-input" id="patientName" name="patientName" type="text" placeholder="${t.namePlaceholder}" autocomplete="name" minlength="2" required></div><div class="auth-field"><label for="patientMobile">${t.mobile}</label><div class="phone-control"><select class="auth-select" id="countryCode" name="countryCode" aria-label="Country calling code"><option value="+20">🇪🇬 +20 Egypt</option><option value="+966">🇸🇦 +966</option><option value="+971">🇦🇪 +971</option><option value="+44">🇬🇧 +44</option><option value="+1">🇺🇸 +1</option></select><input class="auth-input" id="patientMobile" name="mobile" type="tel" placeholder="${t.mobilePlaceholder}" autocomplete="tel-national" required></div></div><div class="auth-field"><label for="patientEmail">${t.email}</label><input class="auth-input" id="patientEmail" name="email" type="email" placeholder="${t.emailPlaceholder}" autocomplete="email" required></div><div class="auth-field"><label for="signupRole">${messages.role}</label><select class="auth-select" id="signupRole" name="role"><option value="patient" selected>${messages.patientRole}</option><option value="doctor">${messages.doctorRole}</option><option value="nurse">${messages.nurseRole}</option><option value="patient_admin">${messages.rolePatientAdmin}</option><option value="staff_admin">${messages.roleStaffAdmin}</option></select></div><div class="auth-field" id="staffDepartmentField" hidden><label for="staffDepartment">${messages.staffDepartment}</label><input class="auth-input" id="staffDepartment" name="staffDepartment" type="text" placeholder="${messages.staffDepartmentPlaceholder}" dir="auto"></div><div class="auth-field full" id="staffLicenseField" hidden><label for="staffLicense">${messages.licenseId}</label><input class="auth-input" id="staffLicense" name="licenseId" type="text" placeholder="${messages.licensePlaceholder}" dir="auto"></div><fieldset class="auth-field"><legend>${t.gender}</legend><div class="gender-options"><label><input type="radio" name="gender" value="female" required>${t.female}</label><label><input type="radio" name="gender" value="male" required>${t.male}</label></div></fieldset><div class="auth-field"><label for="birthDate">${t.birthDate}</label><input class="auth-input" id="birthDate" name="birthDate" type="date" autocomplete="bday"></div>${passwordField('signupPassword',t.password)}<div class="auth-field full"><button class="auth-submit" type="submit">${t.create}</button></div><div class="auth-feedback" id="authFeedback" aria-live="polite"></div></form><div class="auth-switch">${t.already} <a href="${route('login.html')}">${t.login}</a></div>`}
function loginForm(){const t=text();return `<form class="auth-form" id="authForm" novalidate><div class="auth-field full"><label for="loginIdentity">${t.email}</label><input class="auth-input" id="loginIdentity" name="identity" type="email" placeholder="${t.emailPlaceholder}" autocomplete="email" required></div>${passwordField('loginPassword',t.password)}<div class="auth-field full auth-options"><label class="remember-control"><input type="checkbox" name="remember">${t.remember}</label><a class="auth-link" href="${route('forgot-password.html')}">${t.forgot}</a></div><div class="auth-field full"><button class="auth-submit" type="submit">${t.login}</button></div><div class="auth-feedback" id="authFeedback" aria-live="polite"></div></form><div class="auth-switch">${t.noAccount} <a href="${route('signup.html')}">${t.signup}</a></div>`}
function forgotForm(){const t=text();return `<form class="auth-form" id="authForm" novalidate><div class="auth-field full"><label for="resetEmail">${t.resetEmailLabel}</label><input class="auth-input" id="resetEmail" name="email" type="email" placeholder="${t.resetEmailPlaceholder}" autocomplete="email" required></div><div class="auth-field full"><button class="auth-submit" type="submit">${t.sendResetLink}</button></div><div class="auth-feedback" id="authFeedback" aria-live="polite"></div></form><div class="auth-switch"><a href="${route('login.html')}">${t.backLogin}</a></div>`}
function pageForm(){if(page==='signup')return signupForm();if(page==='login')return loginForm();return forgotForm()}
function pageTitle(){const t=text();if(page==='signup')return t.signupTitle;if(page==='login')return t.loginTitle;return resetStep==='request'?t.forgotTitle:t.resetTitle}
function pageIntro(){const t=text();if(page==='signup')return t.signupSubtitle;if(page==='login')return t.loginSubtitle;return resetStep==='request'?t.forgotSubtitle:t.resetSubtitle}
function pageLabel(){const t=text();if(page==='signup')return t.signupLabel;if(page==='login')return t.loginLabel;return t.resetLabel}
function render(values={}){const t=text();document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';document.body.dir=language==='ar'?'rtl':'ltr';writeTheme(darkMode?'dark':'light');document.title=`${pageTitle()} | Sanad Hospital`;document.getElementById('authRoot').innerHTML=`<header class="auth-topbar"><a class="auth-brand" href="${homeRoute()}"><span class="brand-mark"><svg viewBox="0 0 32 32" fill="none"><path d="M23.8 7.7c-2-2-5.8-2.5-9.2-.6-2.6 1.5-3.6 4.2-2.1 6.2 1.2 1.7 4.1 2.1 6.6 2.7 3.1.7 4.6 2.3 4 4.4-.8 2.9-5.2 4.4-9 3.1-2-.7-3.4-2-4.2-3.6" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/><path d="M16 8.5v7m-3.5-3.5h7" stroke="#b8ead6" stroke-width="2.2" stroke-linecap="round"/></svg></span><span>${t.brand}<small>${t.brandSub}</small></span></a><div class="auth-controls"><div class="lang-control"><button type="button" data-lang="en" class="${language==='en'?'active':''}" aria-label="English">EN</button><button type="button" data-lang="ar" class="${language==='ar'?'active':''}" aria-label="العربية">عربي</button></div><button type="button" id="themeToggle" class="theme-control" aria-label="${t.theme}" title="${t.theme}">${darkMode?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M2 12h2m16 0h2M4.9 19.1l-1.5-1.5m12.7-12.7 1.5-1.5"/></svg>'}</button></div></header><main class="auth-layout"><aside class="auth-visual"><a class="auth-back" href="${homeRoute()}"><span class="icon-directional" aria-hidden="true">←</span>${t.back}</a><div class="auth-visual-copy"><h2>${t.visualTitle.replace('\n','<br>')}</h2><p>${t.visualBody}</p></div><div class="auth-visual-foot"><span class="live-dot"></span>${t.support}</div></aside><section class="auth-panel"><div class="auth-kicker">${pageLabel()}</div><h1>${pageTitle()}</h1><p class="auth-intro">${pageIntro()}</p>${pageForm()}</section></main>`;restoreForm(values);document.querySelectorAll("#authRoot input[type=text],#authRoot input[type=email],#authRoot input[type=tel]").forEach(field=>field.setAttribute("dir","auto"));const addressNote=document.getElementById('resetAddressNote');if(addressNote)addressNote.textContent=`${t.resetAddress}: ${resetAddress}`;bindEvents()}
function showFeedback(message,withLogin=false){const target=document.getElementById('authFeedback');target.replaceChildren();const notice=document.createElement('div');notice.className='status-message';notice.textContent=message;target.append(notice);if(withLogin){const link=document.createElement('a');link.className='auth-submit';link.href=route('login.html');link.textContent=text().login;link.style.display='flex';link.style.alignItems='center';link.style.justifyContent='center';link.style.marginTop='10px';target.append(link)}}
function bindEvents(){document.getElementById('themeToggle').addEventListener('click',()=>{darkMode=!darkMode;writeTheme(darkMode?'dark':'light');render(preserveForm())});document.querySelectorAll('[data-password]').forEach(button=>button.addEventListener('click',()=>{const field=document.getElementById(button.dataset.password);const reveal=field.type==='password';field.type=reveal?'text':'password';button.title=reveal?text().hide:text().show;button.setAttribute('aria-label',button.title)}));const otp=document.getElementById('otpCode');if(otp)otp.addEventListener('input',()=>{otp.value=otp.value.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))});const form=document.getElementById('authForm');if(!form)return;form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const values=new FormData(form);if(page==='signup'){showFeedback(text().signupError);return}if(page==='login'){showFeedback(text().loginError);return}if(resetStep==='request'){resetAddress=String(values.get('identity'));resetStep='verify';render();return}const code=String(values.get('otp')).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));if(code!=='1234'){showFeedback(text().invalidCode);return}if(values.get('newPassword')!==values.get('confirmPassword')){showFeedback(text().passwordMismatch);return}showFeedback(text().resetError,true)})}
window.addEventListener('sanadlanguagechange', event => {
  event.preventDefault();
  language = event.detail.language;
  render(preserveForm());
});
render();
(() => {
  const page = document.body.dataset.authPage;
  if (page !== 'signup' && page !== 'login' && page !== 'forgot-password') return;

  window.__SANAD_USERS__ = Array.isArray(window.__SANAD_USERS__) ? window.__SANAD_USERS__ : [
    { id: 'superadmin', name: 'Super Admin', email: 'superadmin@sanad.com', mobile: '+201000000001', password: 'superadmin123', role: 'admin', adminRole: 'super', gender: 'female', birthDate: '' },
    { id: 'patientadmin', name: 'Patient Admin', email: 'patientadmin@sanad.com', mobile: '+201000000002', password: 'patientadmin123', role: 'admin', adminRole: 'patient', gender: 'female', birthDate: '' },
    { id: 'staffadmin', name: 'Staff Admin', email: 'staffadmin@sanad.com', mobile: '+201000000003', password: 'staffadmin123', role: 'admin', adminRole: 'staff', gender: 'female', birthDate: '' },
    { id: 'patient-account', name: 'Patient Account', email: 'patient@sanad.com', mobile: '+201234567890', password: 'patient123', role: 'patient', gender: 'female', birthDate: '' },
    { id: 'doctor-account', name: 'Dr. Lina Hassan', email: 'doctor@sanad.com', mobile: '+201234567891', password: 'doctor123', role: 'doctor', gender: 'female', birthDate: '' },
    { id: 'nurse-account', name: 'Nurse Account', email: 'nurse@sanad.com', mobile: '+201234567892', password: 'nurse123', role: 'nurse', gender: 'female', birthDate: '' },
    { id: 'patient-admin-request', name: 'Patient Admin Applicant', email: 'patient-admin-applicant@sanad.com', mobile: '+201234567893', password: 'patientadmin123', role: 'admin', adminRole: 'patient', status: 'pending', gender: 'female', birthDate: '' },
    { id: 'staff-admin-request', name: 'Staff Admin Applicant', email: 'staff-admin-applicant@sanad.com', mobile: '+201234567894', password: 'staffadmin123', role: 'admin', adminRole: 'staff', status: 'pending', gender: 'female', birthDate: '' }
  ];
  window.__SANAD_SESSION__ = window.__SANAD_SESSION__ || null;

  const language = () => document.documentElement.lang === 'ar' ? 'ar' : 'en';

  const messages = TRANSLATIONS.authValidation;
  window.__SANAD_STAFF_REQUESTS__ = Array.isArray(window.__SANAD_STAFF_REQUESTS__)
    ? window.__SANAD_STAFF_REQUESTS__
    : [
      { id:'request-1', name:'Dr. Farah Ibrahim', email:'', mobile:'', role:'doctor', specialty:'Cardiology', licenseId:'MED-EG-48291', submitted:'2026-10-21', status:'pending' },
      { id:'request-2', name:'Dr. Tarek Mansour', email:'', mobile:'', role:'doctor', specialty:'Pediatrics', licenseId:'MED-EG-73614', submitted:'2026-10-22', status:'pending' },
      { id:'request-3', name:'Dr. Leila Nassar', email:'', mobile:'', role:'doctor', specialty:'Neurology', licenseId:'MED-EG-90527', submitted:'2026-10-23', status:'pending' },
      { id:'request-4', name:'Nurse Applicant', email:'', mobile:'', role:'nurse', specialty:'Emergency Unit', licenseId:'NUR-EG-38120', submitted:'2026-10-23', status:'pending' },
      { id:'request-patient-admin-demo', name:'Patient Admin Applicant', email:'patient-admin-applicant@sanad.com', mobile:'+201234567893', role:'patient_admin', specialty:'Patient Services', licenseId:'PA-EG-2026-01', submitted:'2026-10-24', status:'pending' },
      { id:'request-staff-admin-demo', name:'Staff Admin Applicant', email:'staff-admin-applicant@sanad.com', mobile:'+201234567894', role:'staff_admin', specialty:'Administration', licenseId:'SA-EG-2026-01', submitted:'2026-10-24', status:'pending' }
    ];
  const digits = value => String(value || '').replace(/\D/g, '');
  const canonicalMobile = (countryCode, mobile) => `${digits(countryCode)}${digits(mobile).replace(/^0/, '')}`;
  const sameMobile = (first, second) => {
    const a = digits(first);
    const b = digits(second);
    return a === b || (Math.min(a.length, b.length) >= 8 && (a.endsWith(b) || b.endsWith(a)));
  };
  const routeAfterLogin = user => {
    const params = new URLSearchParams({ lang: language(), theme: document.body.classList.contains('dark') ? 'dark' : 'light' });
    let destination = 'index.html';
    if (user.role === 'admin') {
      destination = 'admin-dashboard.html';
      params.set('adminRole', user.adminRole || 'super');
    } else if (user.role === 'doctor') {
      destination = 'doctor-dashboard.html';
    } else if (user.role === 'nurse') {
      destination = 'nurse-dashboard.html';
    } else {
      destination = 'patient-dashboard.html';
    }
    location.href = `${destination}?${params}`;
  };

  const feedback = message => {
    const target = document.getElementById('authFeedback');
    if (!target) return;
    target.replaceChildren();
    const notice = document.createElement('div');
    notice.className = 'status-message';
    notice.setAttribute('role', 'alert');
    notice.textContent = message;
    target.append(notice);
  };
  const clearFeedback = () => {
    const target = document.getElementById('authFeedback');
    if (target) target.replaceChildren();
  };

  document.addEventListener('input', event => {
    if (event.target.closest('#authForm')) clearFeedback();
  });
  document.addEventListener('change', event => {
    if (event.target.closest('#authForm')) clearFeedback();
  });

  function updateSignupRoleFields() {
    if (page !== 'signup') return;
    const role = document.getElementById('signupRole').value;
    const isStaff = role !== 'patient';
    document.getElementById('staffDepartmentField').hidden = !isStaff;
    document.getElementById('staffLicenseField').hidden = !isStaff;
    document.getElementById('staffDepartment').required = isStaff;
    document.getElementById('staffLicense').required = isStaff;
    const department = document.getElementById('staffDepartment');
    const adminDepartments = ['Patient Services', 'Administration'];
    const defaultDepartment = role === 'patient_admin' ? 'Patient Services'
      : role === 'staff_admin' ? 'Administration' : '';
    if (defaultDepartment && (!department.value || adminDepartments.includes(department.value))) {
      department.value = defaultDepartment;
    }
  }

  if (page === 'signup') {
    document.addEventListener('change', event => {
      if (event.target.id === 'signupRole') updateSignupRoleFields();
    });
    new MutationObserver(updateSignupRoleFields).observe(document.getElementById('authRoot'), { childList: true });
    updateSignupRoleFields();
  }

  document.addEventListener('submit', event => {
    if (event.target.id !== 'authForm') return;
    const form = event.target;
    if (page === 'forgot-password' && document.getElementById('resetEmail')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      clearFeedback();
      if (!form.reportValidity()) return;
      feedback(text().resetLinkMessage);
      return;
    }
    if (page === 'forgot-password') return;

    event.preventDefault();
    event.stopImmediatePropagation();
    clearFeedback();
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const copy = messages[language()];
    if (page === 'signup') {
      const email = String(values.get('email') || '').trim().toLowerCase();
      const mobile = canonicalMobile(values.get('countryCode'), values.get('mobile'));
      const requests = window.__SANAD_STAFF_REQUESTS__;
      if (window.__SANAD_USERS__.some(user => String(user.email || '').trim().toLowerCase() === email || sameMobile(user.mobile, mobile)) ||
          requests.some(request => request.email === email || sameMobile(request.mobile, mobile))) {
        feedback(copy.duplicate); return;
      }
      const requestedRole = String(values.get('role') || 'patient');
      if (!['patient', 'doctor', 'nurse', 'patient_admin', 'staff_admin'].includes(requestedRole)) {
        feedback(copy.invalid);
        return;
      }
      const isAdminRequest = requestedRole === 'patient_admin' || requestedRole === 'staff_admin';
      const newUser = {
        id: `${isAdminRequest ? 'admin' : requestedRole}-${Date.now()}`,
        name: String(values.get('patientName')).trim(),
        email,
        mobile,
        gender: String(values.get('gender')),
        birthDate: String(values.get('birthDate') || ''),
        password: String(values.get('signupPassword')),
        role: isAdminRequest ? 'admin' : requestedRole,
        ...(isAdminRequest ? { adminRole: requestedRole === 'patient_admin' ? 'patient' : 'staff' } : {}),
        active: requestedRole === 'patient',
        ...(isAdminRequest ? {
          status: 'pending',
          submitted: new Date().toISOString().slice(0, 10)
        } : {})
      };
      if (requestedRole === 'doctor' || requestedRole === 'nurse' || isAdminRequest) {
        if (isAdminRequest) {
          window.__SANAD_USERS__.push(newUser);
        }
        requests.push({
          id: `request-${Date.now()}`,
          name: newUser.name,
          email,
          mobile,
          role: requestedRole,
          specialty: String(values.get('staffDepartment') || '').trim(),
          licenseId: String(values.get('licenseId') || '').trim(),
          submitted: newUser.submitted || new Date().toISOString().slice(0, 10),
          status: 'pending'
        });
        window.__SANAD_STAFF_REQUESTS__ = requests;
        feedback(isAdminRequest ? copy.adminPendingRequest : copy.pendingRequest);
        form.reset();
        updateSignupRoleFields();
        return;
      }
      window.__SANAD_USERS__.push(newUser);
      window.__SANAD_SESSION__ = newUser;
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userRole', newUser.role);
      localStorage.setItem('sanad_session_active', 'true');
      localStorage.setItem('sanad_session_role', newUser.role);
      localStorage.setItem('sanad_session_name', newUser.name);
      routeAfterLogin(newUser);
      return;
    }

    const identity = String(values.get('identity') || '').trim().toLowerCase();
    const password = String(values.get('loginPassword') || '');
    const matchedUser = window.__SANAD_USERS__.find(user => {
      const emailMatch = String(user.email || '').trim().toLowerCase() === identity;
      return emailMatch && user.password === password;
    });

    if (!matchedUser) {
      feedback(copy.invalid);
      return;
    }

    if (matchedUser.role === 'admin' && matchedUser.status === 'pending') {
      feedback(copy.adminPendingLogin);
      return;
    }
    if (matchedUser.role === 'admin' && matchedUser.status === 'rejected') {
      feedback(copy.adminRejectedLogin);
      return;
    }

    window.__SANAD_SESSION__ = matchedUser;
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userRole', matchedUser.role);
    localStorage.setItem('sanad_session_active', 'true');
    localStorage.setItem('sanad_session_role', matchedUser.role);
    localStorage.setItem('sanad_session_name', matchedUser.name);
    if (matchedUser.role === 'admin') {
      const adminRole = ['super', 'patient', 'staff'].includes(matchedUser.adminRole) ? matchedUser.adminRole : 'super';
      localStorage.setItem('admin_role', adminRole);
      matchedUser.adminRole = adminRole;
    } else {
      localStorage.removeItem('admin_role');
    }
    routeAfterLogin(matchedUser);
  }, true);
})();
