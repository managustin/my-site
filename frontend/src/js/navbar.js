export function setupMobileNavbar() {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("mobile-menu");
  const icon = document.getElementById("menu-icon").querySelector("use");

  if (!btn || !menu || !icon) return;

  btn.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("hidden");

    // Toggle visibilidad del modal
    if (isOpen) {
      menu.classList.add("opacity-0", "scale-95");
      setTimeout(() => menu.classList.add("hidden"), 300);
      icon.setAttribute("xlink:href", "/assets/sprite.svg#btn-navbar");
      btn.setAttribute("aria-label", "Abrir menú");
    } else {
      menu.classList.remove("hidden");
      setTimeout(() => {
        menu.classList.remove("opacity-0", "scale-95");
      }, 10);
      icon.setAttribute("xlink:href", "/assets/sprite.svg#btn-close");
      btn.setAttribute("aria-label", "Cerrar menú");
    }

    btn.setAttribute("aria-expanded", String(!isOpen));
  });

  // Cerrar al hacer clic afuera
  document.addEventListener("click", (e) => {
    const isClickInside = btn.contains(e.target) || menu.contains(e.target);
    if (!isClickInside && !menu.classList.contains("hidden")) {
      menu.classList.add("opacity-0", "scale-95");
      setTimeout(() => menu.classList.add("hidden"), 300);
      icon.setAttribute("xlink:href", "/assets/sprite.svg#btn-navbar");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Abrir menú");
    }
  });

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.classList.contains("hidden")) {
      menu.classList.add("opacity-0", "scale-95");
      setTimeout(() => menu.classList.add("hidden"), 300);
      icon.setAttribute("xlink:href", "/assets/sprite.svg#btn-navbar");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Abrir menú");
    }
  });
}
