/* =====================================================================
   Donación en la página Tienda.
   La configuración de ePayco vive en js/epayco-config.js (compartida).
   ===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const montoInput = document.getElementById("monto");
    const donarBtn   = document.getElementById("donarBtn");
    const alertBox   = document.getElementById("donAlert");

    if (!donarBtn) return;

    /* Presets de monto */
    document.querySelectorAll(".amount-presets button").forEach(b => {
        b.addEventListener("click", () => { montoInput.value = b.dataset.amount; });
    });

    function showAlert(msg, type) {
        alertBox.textContent = msg;
        alertBox.className = "alert " + type;
    }

    donarBtn.addEventListener("click", () => {
        const monto = parseInt(montoInput.value, 10);
        const error = abrirDonacionEpayco(monto);
        if (error) {
            showAlert(error, error.indexOf("no está configurada") !== -1 ? "info" : "err");
        }
    });
});
