/* =====================================================================
   CONFIGURACIÓN EPAYCO — compartida por la Tienda y el pop-up de agendar
   =====================================================================
   PEGA AQUÍ TU LLAVE PÚBLICA (cuenta ser-cafe).
   La encuentras en:  Dashboard ePayco > Integraciones / Configuración > Llaves.
   Usa la PUBLIC_KEY (la llave pública se puede exponer en el sitio web).
   Mientras EPAYCO_TEST sea true, los pagos son de PRUEBA (no se cobra).
   Cuando quieras cobrar de verdad, pon EPAYCO_TEST = false.
*/
const EPAYCO_PUBLIC_KEY = "PEGA_AQUI_TU_PUBLIC_KEY_EPAYCO";
const EPAYCO_TEST = true; // true = modo prueba | false = pagos reales

/* URL a la que ePayco responde (opcional). */
const EPAYCO_RESPONSE_URL = "https://dochiga-soluciones.github.io/dochiga-soluciones/";

/* ¿Está configurada la pasarela? */
function epaycoConfigurado() {
    return EPAYCO_PUBLIC_KEY && !EPAYCO_PUBLIC_KEY.startsWith("PEGA_AQUI");
}

/**
 * Abre el checkout de ePayco para una donación.
 * @param {number} monto  Monto en COP.
 * @param {string} [desc] Descripción opcional.
 * @returns {string|null} Mensaje de error, o null si abrió correctamente.
 */
function abrirDonacionEpayco(monto, desc) {
    if (!monto || monto < 1000) {
        return "Ingresa un monto válido (mínimo $1.000 COP).";
    }
    if (!epaycoConfigurado()) {
        return "La pasarela aún no está configurada. Pega tu PUBLIC_KEY de ePayco en js/epayco-config.js.";
    }
    if (typeof ePayco === "undefined") {
        return "No se pudo cargar la pasarela de pago. Revisa tu conexión e intenta de nuevo.";
    }

    const handler = ePayco.checkout.configure({
        key:  EPAYCO_PUBLIC_KEY,
        test: EPAYCO_TEST
    });

    handler.open({
        name:         "Donación capacitaciones Dochiga",
        description:  desc || "Aporte voluntario a las capacitaciones de Dochiga Soluciones",
        currency:     "cop",
        amount:       String(monto),
        tax_base:     "0",
        tax:          "0",
        country:      "co",
        lang:         "es",
        external:     "false",
        response:     EPAYCO_RESPONSE_URL,
        invoice:      "DON-" + Date.now(),
        method_confirmation: "GET"
    });

    return null; // sin error
}
