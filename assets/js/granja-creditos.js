(() => {
    const abrir = document.querySelector("#granjaCreditosAbrir");
    const cerrar = document.querySelector("#granjaCreditosCerrar");
    const modal = document.querySelector("#granjaCreditosModal");
    if (!abrir || !cerrar || !modal) return;

    const mostrar = () => {
        modal.hidden = false;
        document.body.classList.add("granja-creditos-visibles");
        cerrar.focus();
    };
    const ocultar = () => {
        modal.hidden = true;
        document.body.classList.remove("granja-creditos-visibles");
        abrir.focus();
    };

    abrir.addEventListener("click", mostrar);
    cerrar.addEventListener("click", ocultar);
    modal.addEventListener("click", evento => {
        if (evento.target === modal) ocultar();
    });
    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && !modal.hidden) ocultar();
    });
})();
