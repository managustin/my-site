import { translations } from './translations.js';

export function setupLanguageToggle() {
    const languageToggleBtns = document.querySelectorAll('.language-toggle-btn');
    const userLang = localStorage.getItem('appLang') || (navigator.language.startsWith('es') ? 'es' : 'en');

    setLanguage(userLang);

    languageToggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = btn.getAttribute('data-lang');
            if (newLang !== localStorage.getItem('appLang')) {
                setLanguage(newLang);
            }
        });
    });

    function setLanguage(lang) {
        localStorage.setItem('appLang', lang);

        // Update texts
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                // use innerHTML if the translation contains HTML, like the about.desc
                if (translations[lang][key].includes('<')) {
                    el.innerHTML = translations[lang][key];
                } else {
                    // For placeholders
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.placeholder = translations[lang][key];
                    } else {
                        el.textContent = translations[lang][key];
                    }
                }
            }
        });

        // Update active button styles
        document.querySelectorAll('.language-toggle-btn').forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            const textSpan = btn.querySelector('span') || btn; // Might just be a span or a link

            if (btnLang === lang) {
                btn.classList.add('font-bold', 'opacity-100');
                btn.classList.remove('font-extralight', 'opacity-50');
            } else {
                btn.classList.remove('font-bold', 'opacity-100');
                btn.classList.add('font-extralight', 'opacity-50');
            }
        });
    }
}
