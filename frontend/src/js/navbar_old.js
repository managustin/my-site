export function setupMobileNavbar() {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("mobile-menu");
  const icon = document.getElementById("menu-icon").querySelector("use");
  const closeBtn = document.getElementById("mobile-menu-close");
  const menuLinks = menu.querySelectorAll("a");

  if (!btn || !menu || !icon) return;

  const closeMenu = () => {
    menu.classList.add("opacity-0", "scale-95");
    setTimeout(() => menu.classList.add("hidden"), 300);
    icon.setAttribute("xlink:href", "/assets/sprite.svg#btn-navbar");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Abrir menú");
  };

  const openMenu = () => {
    menu.classList.remove("hidden");
    setTimeout(() => {
      menu.classList.remove("opacity-0", "scale-95");
    }, 10);
    icon.setAttribute("xlink:href", "/assets/sprite.svg#btn-close");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Cerrar menú");
  };

  btn.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("hidden");
    isOpen ? closeMenu() : openMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMenu);
  }

  menuLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    const isClickInside = btn.contains(e.target) || menu.contains(e.target);
    if (!isClickInside && !menu.classList.contains("hidden")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.classList.contains("hidden")) {
      closeMenu();
    }
  });
}
