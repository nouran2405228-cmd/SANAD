(() => {
  const copy = () => TRANSLATIONS.homeAuth[document.documentElement.lang === 'ar' ? 'ar' : 'en'];
  if (sessionStorage.getItem('isLoggedIn') === 'true' ||
    localStorage.getItem('sanad_session_active') === 'true') {
    const role = localStorage.getItem('sanad_session_role') || sessionStorage.getItem('userRole') || 'patient';
    const names = copy();
    if (names[role]) window.__SANAD_SESSION__ = {
      name: localStorage.getItem('sanad_session_name') || names[role],
      role
    };
  }
  if (window.__SANAD_SESSION__) {
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userRole', window.__SANAD_SESSION__.role);
    localStorage.setItem('sanad_session_active', 'true');
    localStorage.setItem('sanad_session_role', window.__SANAD_SESSION__.role);
    localStorage.setItem('sanad_session_name', window.__SANAD_SESSION__.name || '');
  }

  const auth = document.querySelector('.auth');
  if (!auth) return;

  function renderSession() {
    const user = window.__SANAD_SESSION__ || null;

    if (!user) {
      auth.classList.remove('signed-in');
      auth.querySelector('.user-badge')?.remove();
      auth.querySelector('.admin-link')?.remove();
      auth.querySelector('.dashboard-link')?.remove();
      auth.querySelector('.logout-button')?.remove();
      auth.querySelectorAll('#loginBtn, #signupBtn').forEach(link => link.hidden = false);
      return;
    }

    auth.querySelectorAll('#loginBtn, #signupBtn').forEach(link => link.hidden = true);
    const arabic = document.documentElement.lang === 'ar';
    const text = copy();
    const badge = auth.querySelector('.user-badge') || document.createElement('span');
    badge.className = 'user-badge';
    badge.textContent = `${text.welcome} ${user.name || ''}`;

    const dashboardLink = auth.querySelector('.dashboard-link') || document.createElement('a');
    dashboardLink.className = 'btn primary dashboard-link';
    const dashboardRoute = user.role === 'admin' ? 'admin-dashboard.html'
      : user.role === 'doctor' ? 'doctor-dashboard.html'
        : user.role === 'nurse' ? 'nurse-dashboard.html' : 'patient-dashboard.html';
    const dashboardParams = new URLSearchParams({
      lang: arabic ? 'ar' : 'en',
      theme: localStorage.getItem('sanad_theme') || 'light'
    });
    if (user.role === 'admin') dashboardParams.set('adminRole', localStorage.getItem('admin_role') || 'super');
    dashboardLink.href = `${dashboardRoute}?${dashboardParams}`;
    dashboardLink.textContent = user.role === 'patient' ? text.patientDashboard
      : user.role === 'doctor' ? text.doctorDashboard
        : user.role === 'nurse' ? text.nurseDashboard : text.adminDashboard;

    const logout = auth.querySelector('.logout-button') || document.createElement('button');
    logout.className = 'button outline small logout-button';
    logout.type = 'button';
    logout.textContent = text.logout;
    if (!logout.dataset.bound) {
      logout.addEventListener('click', () => {
        window.__SANAD_SESSION__ = null;
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userRole');
        localStorage.removeItem('sanad_session_active');
        localStorage.removeItem('sanad_session_role');
        localStorage.removeItem('sanad_session_name');
        localStorage.removeItem('admin_role');
        const params = new URLSearchParams({ lang: document.documentElement.lang, theme: localStorage.getItem('sanad_theme') || 'light' });
        location.href = `index.html?${params}`;
      });
      logout.dataset.bound = 'true';
    }

    auth.append(badge);
    auth.append(dashboardLink);
    auth.append(logout);
    auth.classList.add('signed-in');
  }

  renderSession();
  window.addEventListener('sanadlanguagechange', renderSession);
})();
