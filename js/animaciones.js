document.addEventListener("DOMContentLoaded", function () {

    /* ---- Animación al hacer scroll ---- */
    const revealEls = document.querySelectorAll(".reveal, .card, .step, .section-head");
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => {
        el.classList.add("reveal");
        observer.observe(el);
    });

    /* ---- Menú móvil ---- */
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelector("nav .links");
    if (toggle && links) {
        toggle.addEventListener("click", () => links.classList.toggle("open"));
        links.querySelectorAll("a").forEach(a =>
            a.addEventListener("click", () => links.classList.remove("open"))
        );
    }

    /* ---- Marcar enlace activo ---- */
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("nav .links a").forEach(a => {
        if (a.getAttribute("href") === path) a.classList.add("active");
    });
});
