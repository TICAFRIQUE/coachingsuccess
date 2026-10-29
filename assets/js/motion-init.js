// Active les animations seulement si le navigateur les gère.
// Sécurité : si le script principal échoue, le contenu redevient visible.
if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js-motion");
  setTimeout(function () {
    if (!window.__revealReady)
      document.documentElement.classList.remove("js-motion");
  }, 2500);
}
