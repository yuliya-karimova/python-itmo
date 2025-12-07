document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".content a[href^='http']");
  links.forEach(a => a.setAttribute("target", "_blank"));
});
