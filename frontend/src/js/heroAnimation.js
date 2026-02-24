// heroAnimation.js
import { translations } from './translations.js';

export function animateHero() {
  const userLang = localStorage.getItem('appLang') || (navigator.language.startsWith('es') ? 'es' : 'en');
  const text = translations[userLang]["hero.trying"];
  const textContainer = document.getElementById("text1");
  const wrapper = document.getElementById("text1-container");
  const subheading = document.getElementById("text2");

  let index = 0;

  //   // Paso 1: Mostrar inmediatamente el texto principal
  //   const mainText = document.getElementById("main-text");
  //   mainText.classList.add("animate-fade-in");

  // Crear cursor
  const cursor = document.createElement("span");
  cursor.textContent = "|";
  cursor.classList.add("ml-1", "text-secondary-text", "animate-blink");
  textContainer.appendChild(cursor);

  setTimeout(() => {
    wrapper.classList.remove("opacity-0");

    const typingInterval = setInterval(() => {
      if (index < text.length) {
        textContainer.textContent = text.slice(0, index + 1);
        textContainer.appendChild(cursor);
        index++;
      } else {
        clearInterval(typingInterval);

        // Remover cursor después de un pequeño delay
        setTimeout(() => {
          cursor.remove();

          subheading.classList.remove("opacity-0");
          subheading.classList.add("animate-fade-in");
        }, 200);
      }
    }, 100);
  }, 1500);
}
