export function setupMobileNavbar() {
  const btn = document.querySelector('#menu-btn');
  const btnClose = document.querySelector('#menu-btn-close');
  const menuModal = document.querySelector('#sidebar');
  const menuLinks = menuModal.querySelectorAll("a");
  const navbar = document.querySelector('nav');
  const body = document.body;
  let scrollPosition = 0;

  btn.addEventListener('click', () => {
      showModal();
  })

  btnClose.addEventListener('click', () => {
      closeModal();
  })


  function showModal(){
    
    body.classList.add(`top-[${scrollPosition}px`)
    body.classList.add('inset-x-0')
    menuModal.classList.remove('hidden');
    menuModal.classList.add('flex', 'justify-center', 'items-center');
    // forzamos un reflow para que la transición funcione
    menuModal.offsetHeight;
    menuModal.classList.remove('opacity-0');
    menuModal.classList.add('opacity-100');

    // Guardar posición actual
    scrollPosition = window.scrollY;
    
  // Bloquear scroll y mantener posición
    body.style.position = "fixed";
    body.style.top = `-${scrollPosition}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.classList.add("overflow-hidden");
  }

  function closeModal(){
    menuModal.classList.add('opacity-0');
    menuModal.classList.remove('opacity-100');
    
    // Esperamos a que termine la transición antes de ocultar
    setTimeout(() => {
        menuModal.classList.remove('flex');
        menuModal.classList.add('hidden');
    }, 300); // 300ms = duración de la transición

    
    // Restaurar scroll
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.classList.remove("overflow-hidden");    
    // Volver a la posición donde estaba
    window.scrollTo({ top: scrollPosition });
  }

    menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault(); // evitar salto brusco

        closeModal(); // cerrar el menú modal
        
        const targetId = link.getAttribute("href");
        const targetEl = document.querySelector(targetId);

        if (targetEl) {
        targetEl.scrollIntoView({
            behavior: "smooth"
        });
        }

        
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