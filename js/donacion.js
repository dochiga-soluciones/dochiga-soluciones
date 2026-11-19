/* =====================================================================
   CONFIGURACIÓN EPAYCO — PEGA AQUÍ TU LLAVE PÚBLICA (cuenta ser-cafe)
   =====================================================================
   La encuentras en:  Dashboard ePayco > Integraciones / Configuración > Llaves.
   Usa la PUBLIC_KEY (la llave pública se puede exponer en el sitio web).
   Mientras EPAYCO_TEST sea true, los pagos son de PRUEBA (no se cobra).
   Cuando quieras cobrar de verdad, pon EPAYCO_TEST = false.
*/
const EPAYCO_PUBLIC_KEY = "PEGA_AQUI_TU_PUBLIC_KEY_EPAYCO";
const EPAYCO_TEST = true; // true = modo prueba | false = pagos reales

/* URL a la que ePayco responde (opcional). Puedes dejar la del propio sitio. */
const EPAYCO_RESPONSE_URL = "https://ser-cafe.github.io/"; // ajusta si quieres una página de "gracias"

document.addEventListener("DOMContentLoaded", () => {
    const montoInput = document.getElementById("monto");
    const donarBtn   = document.getElementById("donarBtn");
    const alertBox   = document.getElementById("donAlert");

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

        if (!monto || monto < 1000) {
            showAlert("Ingresa un monto válido (mínimo $1.000 COP).", "err");
            return;
        }

        if (!EPAYCO_PUBLIC_KEY || EPAYCO_PUBLIC_KEY.startsWith("PEGA_AQUI")) {
            showAlert("La pasarela aún no está configurada. Pega tu PUBLIC_KEY de ePayco en js/donacion.js.", "info");
            return;
        }

        if (typeof ePayco === "undefined") {
            showAlert("No se pudo cargar la pasarela de pago. Revisa tu conexión e intenta de nuevo.", "err");
            return;
        }

        const handler = ePayco.checkout.configure({
            key:  EPAYCO_PUBLIC_KEY,
            test: EPAYCO_TEST
        });

        handler.open({
            // Datos de la transacción
            name:         "Donación capacitaciones Dochiga",
            description:  "Aporte voluntario a las capacitaciones de Dochiga Soluciones",
            currency:     "cop",
            amount:       String(monto),
            tax_base:     "0",
            tax:          "0",
            country:      "co",
            lang:         "es",

            // Configuración del checkout
            external:     "false",
            response:     EPAYCO_RESPONSE_URL,

            // Datos opcionales del comercio
            invoice:      "DON-" + Date.now(),
            method_confirmation: "GET"
        });
    });
});
