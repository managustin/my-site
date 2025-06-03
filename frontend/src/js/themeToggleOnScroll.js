export function setupThemeObserver() {
  const body = document.getElementById("body");
  const mainText = document.querySelectorAll(".toggling-text");
  const heroSecondText = document.getElementById("text1");
  const heroThirdText = document.getElementById("text2");
  const argColor = document.querySelector(".toggle-arg");
  const triggerSection = document.getElementById("showcase");

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        //cambio el fondo
        body.classList.remove("bg-main-color-lm");
        body.classList.add("bg-main-color-dm");
        //cambio el main text
        mainText.forEach(el => {
          el.classList.remove("text-main-text-lm");
          el.classList.add("text-main-text-dm");
        });
        //cambio el secondary text
        heroSecondText.classList.remove("text-secondary-text-lm");
        heroSecondText.classList.add("text-secondary-text-dm");
        //cambio el tertiary text
        heroThirdText.classList.remove("text-tertiary-text-lm");
        heroThirdText.classList.add("text-tertiary-text-dm");
        //cambio el argColor text
        argColor.classList.remove("text-argentino");
        argColor.classList.add("text-main-text-lm");
      } else {
        body.classList.remove("bg-main-color-dm");
        body.classList.add("bg-main-color-lm");
        //revierto el main-text
        mainText.forEach(el => {
          el.classList.add("text-main-text-lm");
          el.classList.remove("text-main-text-dm");
        });
        //revierto el secondary text
        heroSecondText.classList.add("text-secondary-text-lm");
        heroSecondText.classList.remove("text-secondary-text-dm");
        //revierto el tertiary text
        heroThirdText.classList.add("text-tertiary-text-lm");
        heroThirdText.classList.remove("text-tertiary-text-dm");
        //revierto el argColor text
        argColor.classList.add("text-argentino");
        argColor.classList.remove("text-main-text-lm");
      }
    },
    {
      threshold: 0.5, // cuando al menos el 50% de la sección está en vista
    }
  );

  observer.observe(triggerSection);
}
