export function setupMobileNavbar() {
  const btn = document.querySelector('#menu-btn');
  const btnClose = document.querySelector('#menu-btn-close');
  const menuModal = document.querySelector('#sidebar');
  const menuLinks = menuModal.querySelectorAll("a");
  const navbar = document.querySelector('nav');

  btn.addEventListener('click', () => {
      showModal();
  })

  btnClose.addEventListener('click', () => {
      closeModal();
  })

  function showModal(){
      menuModal.classList.remove('hidden');
      menuModal.classList.add('flex', 'justify-center', 'items-center');
      // Forzamos un reflow para que la transición funcione
      menuModal.offsetHeight;
      menuModal.classList.remove('opacity-0');
      menuModal.classList.add('opacity-100');
  }

  function closeModal(){
      menuModal.classList.add('opacity-0');
      menuModal.classList.remove('opacity-100');
      
      // Esperamos a que termine la transición antes de ocultar
      setTimeout(() => {
          menuModal.classList.remove('flex');
          menuModal.classList.add('hidden');
      }, 300); // 300ms = duración de la transición
  }

    menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault(); // evitar salto brusco

        const targetId = link.getAttribute("href");
        const targetEl = document.querySelector(targetId);

        if (targetEl) {
        targetEl.scrollIntoView({
            behavior: "smooth"
        });
        }

        closeModal(); // cerrar el menú modal
    });
    });

  

  //control del scroll

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll <= 0) {
          // Si estamos al inicio de la página
          navbar.classList.remove('-translate-y-full');
          return;
      }
      
      if (currentScroll > lastScroll && !navbar.classList.contains('-translate-y-full')) {
          // Scroll Down -> ocultar navbar
          navbar.classList.add('-translate-y-full');
      } else if (currentScroll < lastScroll && navbar.classList.contains('-translate-y-full')) {
          // Scroll Up -> mostrar navbar
          navbar.classList.remove('-translate-y-full');
      }
      
      lastScroll = currentScroll;
  });
}