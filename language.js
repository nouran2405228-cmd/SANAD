(() => {
  const supportedLanguages = ['en', 'ar'];
  const query = new URLSearchParams(window.location.search);
  const requestedLanguage = query.get('lang');
  const storedLanguage = localStorage.getItem('sanad_lang') || localStorage.getItem('sanadLanguage');
  let language = supportedLanguages.includes(requestedLanguage)
    ? requestedLanguage
    : supportedLanguages.includes(storedLanguage)
      ? storedLanguage
      : 'en';

  function updateDocumentLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }

  function updateInternalLinks(root = document) {
    const links = [...root.querySelectorAll('a[href]')];
    if (root.matches && root.matches('a[href]')) links.unshift(root);
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      destination.searchParams.set('lang', language);
      link.setAttribute('href', `${destination.pathname}${destination.search}${destination.hash}`);
    });
  }

  function translationFor(key) {
    const translations = window.TRANSLATIONS;
    if (!translations) return undefined;

    let section = '';
    if (document.body.dataset.authPage) {
      section = 'auth';
    } else if (document.body.classList.contains('doctor-body')) {
      section = 'doctor';
    } else if (document.body.classList.contains('admin-body')) {
      section = 'admin';
    }
    const translated = section && translations[section] && translations[section][language][key];
    if (typeof translated === 'string') return translated;
    const dashboardText = translations.dashboard && translations.dashboard[language][key];
    if (typeof dashboardText === 'string') return dashboardText;
    const sharedText = translations[language] && translations[language][key];
    return typeof sharedText === 'string' ? sharedText : undefined;
  }

  function phraseTranslation(value) {
    const translations = window.TRANSLATIONS;
    if (!translations) return undefined;
    return translations[language].phrases[value]
      || (translations.dashboard && translations.dashboard[language][value]);
  }

  function translateTextNode(node) {
    if (node.parentElement && ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) return;
    const value = node.nodeValue;
    const trimmed = value.trim();
    const translated = phraseTranslation(trimmed);
    if (typeof translated !== 'string' || translated === trimmed) return;
    const leading = value.match(/^\s*/)[0];
    const trailing = value.match(/\s*$/)[0];
    node.nodeValue = `${leading}${translated}${trailing}`;
  }

  function applyPhraseTranslations(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
  }

  function applyTranslations(root = document) {
    const translations = window.TRANSLATIONS;
    if (!translations) return;

    const textElements = [...root.querySelectorAll('[data-i18n]')];
    if (root.matches && root.matches('[data-i18n]')) textElements.unshift(root);
    textElements.forEach(element => {
      const translated = translationFor(element.dataset.i18n);
      if (typeof translated === 'string') element.textContent = translated;
    });

    const attributeSelector = '[placeholder], [aria-label], [title], [data-i18n-placeholder], [data-i18n-aria-label], [data-i18n-title]';
    const attributeElements = [...root.querySelectorAll(attributeSelector)];
    if (root.matches && root.matches(attributeSelector)) attributeElements.unshift(root);
    attributeElements.forEach(element => {
      [['placeholder', 'placeholder'], ['aria-label', 'ariaLabel'], ['title', 'title']].forEach(([attribute, key]) => {
        const translationKey = element.dataset[`i18n${key[0].toUpperCase()}${key.slice(1)}`];
        const translated = translationKey
          ? translationFor(translationKey) || phraseTranslation(element.getAttribute(attribute))
          : phraseTranslation(element.getAttribute(attribute));
        if (typeof translated === 'string') element.setAttribute(attribute, translated);
      });
    });

    applyPhraseTranslations(root);
    const translatedTitle = phraseTranslation(document.title);
    if (typeof translatedTitle === 'string') document.title = translatedTitle;
  }

  window.sanadTranslate = (text, requested) => {
    if (!supportedLanguages.includes(requested)) {
      throw new RangeError(`Unsupported language: ${requested}`);
    }
    const dictionary = window.TRANSLATIONS.dashboard[requested];
    if (requested === 'ar') return dictionary[text] || text;
    return text;
  };

  window.setSanadLanguage = nextLanguage => {
    if (!supportedLanguages.includes(nextLanguage)) {
      throw new RangeError(`Unsupported language: ${nextLanguage}`);
    }
    language = nextLanguage;
    localStorage.setItem('sanad_lang', language);
    updateDocumentLanguage();

    const current = new URLSearchParams(window.location.search);
    current.set('lang', language);
    window.history.replaceState(null, '', `${window.location.pathname}?${current}${window.location.hash}`);
    updateInternalLinks();
    applyTranslations();
    const event = new CustomEvent('sanadlanguagechange', { detail: { language }, cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  };

  document.addEventListener('click', event => {
    const control = event.target.closest('[data-lang], #languageToggle');
    if (!control) return;
    const nextLanguage = control.dataset.lang || (language === 'ar' ? 'en' : 'ar');
    if (!supportedLanguages.includes(nextLanguage) || nextLanguage === language) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!window.setSanadLanguage(nextLanguage)) window.location.reload();
  }, true);

  localStorage.setItem('sanad_lang', language);
  if (storedLanguage && storedLanguage !== language) localStorage.removeItem('sanadLanguage');
  query.set('lang', language);
  window.history.replaceState(null, '', `${window.location.pathname}?${query}${window.location.hash}`);
  updateDocumentLanguage();

  const initializePage = () => {
    updateInternalLinks();
    applyTranslations();

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node);
            return;
          }
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          updateInternalLinks(node);
          applyTranslations(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage, { once: true });
  } else {
    initializePage();
  }
})();
