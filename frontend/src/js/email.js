// email.js

// Cargamos la librería EmailJS dinámicamente y devolvemos una promesa
export async function initEmailJS() {
  await loadEmailJSScript();

  emailjs.init({
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  });

  const form = document.getElementById('contact-form');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        this
        )
        .then(() => {
          alert('¡Mensaje enviado con éxito!');
          this.reset();
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Hubo un error al enviar el mensaje.');
        });
    });
  } else {
    console.warn('No se encontró el formulario con id "contact-form"');
  }
}

// Función auxiliar para cargar el script desde CDN
function loadEmailJSScript() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve(); // Ya está cargado

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
