(() => {
  const lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
  const chatbotCopy = {
    en: {
      dashboard: 'Dashboard',
      patientDashboard: 'Patient Dashboard',
      backToSite: 'Back to Site',
      assistant: 'SANAD AI Assistant',
      status: 'General information',
      intro: 'Explore general information about symptoms, appointments, and prescriptions. For medical advice, contact your care team.',
      open: 'Open AI assistant',
      close: 'Close AI assistant'
    },
    ar: {
      dashboard: 'لوحة التحكم',
      patientDashboard: 'لوحة المريض',
      backToSite: 'العودة إلى الموقع',
      assistant: 'مساعد سند الذكي',
      status: 'معلومات عامة',
      intro: 'استكشف معلومات عامة عن الأعراض والمواعيد والوصفات الطبية. للحصول على المشورة الطبية، تواصل مع فريق الرعاية.',
      open: 'افتح المساعد الذكي',
      close: 'إغلاق المساعد الذكي'
    }
  };
  let labels = chatbotCopy[lang];

  function updateBackLinks() {
    const currentLanguage = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    const currentTheme = localStorage.getItem('sanad_theme') || 'light';
    const home = new URL('index.html', location.href);
    home.search = new URLSearchParams({
      lang: currentLanguage,
      theme: currentTheme,
      ...(localStorage.getItem('admin_role') ? { adminRole: localStorage.getItem('admin_role') } : {})
    }).toString();
    document.querySelectorAll('.back-to-site').forEach(link => {
      link.href = home.href;
      link.textContent = chatbotCopy[currentLanguage].backToSite;
    });
  }
  updateBackLinks();
  document.addEventListener('click', event => {
    if (event.target.closest('#themeToggle')) setTimeout(updateBackLinks, 0);
  });

  const trigger = document.createElement('button');
  trigger.className = 'ai-chat-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-label', labels.open);
  trigger.setAttribute('aria-controls', 'aiChatDrawer');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 13.8 8.2 19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg>';
  const backdrop = document.createElement('div');
  backdrop.className = 'ai-chat-backdrop';
  backdrop.hidden = true;
  backdrop.setAttribute('aria-hidden', 'true');
  const drawer = document.createElement('section');
  drawer.className = 'ai-chat-drawer';
  drawer.id = 'aiChatDrawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'aiChatTitle');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `<header class="ai-chat-header"><div><h2 id="aiChatTitle">${labels.assistant}</h2><span class="ai-chat-status">${labels.status}</span></div><button class="ai-chat-close" type="button" aria-label="${labels.close}">×</button></header><div class="ai-chat-body"><span class="ai-chat-mark" aria-hidden="true">✦</span><p>${labels.intro}</p></div>`;
  document.body.append(trigger, backdrop, drawer);
  function updateChatLanguage(event) {
    labels = chatbotCopy[event.detail.language];
    trigger.setAttribute('aria-label', labels.open);
    drawer.querySelector('#aiChatTitle').textContent = labels.assistant;
    drawer.querySelector('.ai-chat-status').textContent = labels.status;
    drawer.querySelector('.ai-chat-body p').textContent = labels.intro;
    closeButton.setAttribute('aria-label', labels.close);
    updateBackLinks();
  }

  const closeButton = drawer.querySelector('.ai-chat-close');
  window.addEventListener('sanadlanguagechange', updateChatLanguage);
  let previousFocus = null;
  function setDrawerOpen(open) {
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-visible', open);
    backdrop.hidden = !open;
    drawer.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('ai-chat-open', open);
    if (open) {
      previousFocus = document.activeElement;
      closeButton.focus();
      return;
    }
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }
  trigger.addEventListener('click', () => setDrawerOpen(true));
  closeButton.addEventListener('click', () => setDrawerOpen(false));
  backdrop.addEventListener('click', () => setDrawerOpen(false));
  document.addEventListener('keydown', event => {
    if (!drawer.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      setDrawerOpen(false);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      closeButton.focus();
    }
  });
})();
