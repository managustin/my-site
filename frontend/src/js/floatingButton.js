export function floatingButton() {
    const floating = document.getElementById("floating-button");
    const realTitle = document.getElementById("real-title");

    let passed = false;

    // NUEVO: Ocultar el botón si el usuario ya está debajo del showcase al cargar
    function isBelowSection(section) {
        const rect = section.getBoundingClientRect();
        return rect.bottom < 0;
    }
    if (isBelowSection(realTitle)) {
        floating.classList.add("opacity-0", "pointer-events-none");
        passed = true;
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                floating.classList.add("opacity-0", "pointer-events-none");
                realTitle.classList.remove("opacity-0");
                passed = true;
            } else {
                if (!passed) {
                    floating.classList.remove("opacity-0", "pointer-events-none");
                    realTitle.classList.add("opacity-0");
                }
            }
        },
        {
            root: null,
            threshold: 0,
            rootMargin: "-100px 0px 0px 0px"
        }
    );

    observer.observe(realTitle);

    floating.addEventListener("click", () => {
        realTitle.scrollIntoView({ behavior: "smooth" });
    });
}