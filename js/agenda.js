/* =====================================================================
   CONFIGURACIÓN — PEGA AQUÍ LA URL DE TU GOOGLE APPS SCRIPT WEB APP
   =====================================================================
   1. Despliega el archivo apps-script/Codigo.gs como "Aplicación web".
   2. Copia la URL que termina en /exec y pégala abajo entre comillas.
   Ejemplo:
   const API_URL = "https://script.google.com/macros/s/AKfy..../exec";
*/
const API_URL = "https://script.google.com/macros/s/AKfycbwo_OR2rjBm3293Nz-DW9s3fw_TSJSMiQ9y-Sl4PfIkYf3mlW-AGzMzWiyoEiAL_xGBjQ/exec";

/* =====================================================================
   Lógica de la página de agendamiento
   ===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const form      = document.getElementById("agendaForm");
    const tipoSel    = document.getElementById("tipo");
    const temaInput  = document.getElementById("tema");
    const fechaInput = document.getElementById("fecha");
    const slotsBox   = document.getElementById("slots");
    const horaInput  = document.getElementById("hora");
    const alertBox   = document.getElementById("alert");
    const submitBtn  = document.getElementById("submitBtn");

    /* --- Prefill desde la URL (?tipo=...&tema=...) --- */
    const params = new URLSearchParams(location.search);
    if (params.get("tipo") === "capacitacion") {
        tipoSel.value = "Capacitación Power BI / Excel";
    }
    if (params.get("tema")) {
        temaInput.value = params.get("tema");
    }

    /* --- Fecha: mínimo hoy, por defecto mañana --- */
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    fechaInput.min = isoDate(today);
    fechaInput.value = isoDate(tomorrow);

    function isoDate(d) {
        return d.toISOString().split("T")[0];
    }

    function showAlert(msg, type) {
        alertBox.textContent = msg;
        alertBox.className = "alert " + type;
        alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    /* --- Cargar horarios disponibles al elegir fecha --- */
    async function loadSlots() {
        const fecha = fechaInput.value;
        horaInput.value = "";
        if (!fecha) return;

        if (!API_URL || API_URL.startsWith("PEGA_AQUI")) {
            slotsBox.innerHTML =
                '<p class="form-note">⚠️ El calendario aún no está conectado. ' +
                'Configura la URL del Apps Script en js/agenda.js. ' +
                'Mientras tanto puedes <a class="accent" href="https://wa.me/573186413008" target="_blank" rel="noopener">escribirnos por WhatsApp</a>.</p>';
            return;
        }

        slotsBox.innerHTML = '<p class="form-note">Cargando horarios disponibles…</p>';
        try {
            const res = await fetch(`${API_URL}?action=slots&fecha=${encodeURIComponent(fecha)}`);
            const data = await res.json();
            renderSlots(data.slots || []);
        } catch (err) {
            slotsBox.innerHTML =
                '<p class="form-note">No se pudieron cargar los horarios. Intenta de nuevo o escríbenos por WhatsApp.</p>';
        }
    }

    function renderSlots(slots) {
        if (!slots.length) {
            slotsBox.innerHTML =
                '<p class="form-note">No hay horarios disponibles ese día. Prueba con otra fecha.</p>';
            return;
        }
        slotsBox.innerHTML = "";
        slots.forEach(hora => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "slot-btn";
            b.textContent = hora;
            b.addEventListener("click", () => {
                document.querySelectorAll(".slot-btn").forEach(x => x.classList.remove("selected"));
                b.classList.add("selected");
                horaInput.value = hora;
            });
            slotsBox.appendChild(b);
        });
    }

    fechaInput.addEventListener("change", loadSlots);
    loadSlots();

    /* --- Envío del formulario --- */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!horaInput.value) {
            showAlert("Por favor selecciona un horario disponible.", "err");
            return;
        }
        if (!API_URL || API_URL.startsWith("PEGA_AQUI")) {
            showAlert("El agendamiento aún no está conectado al calendario. Escríbenos por WhatsApp al 318 641 3008.", "info");
            return;
        }

        const payload = {
            action:   "book",
            tipo:     tipoSel.value,
            tema:     temaInput.value,
            nombre:   form.nombre.value,
            email:    form.email.value,
            telefono: form.telefono.value,
            empresa:  form.empresa.value,
            fecha:    fechaInput.value,
            hora:     horaInput.value,
            mensaje:  form.mensaje.value
        };

        submitBtn.disabled = true;
        submitBtn.textContent = "Agendando…";

        try {
            // text/plain evita el preflight CORS con Apps Script
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.ok) {
                showAlert("✅ ¡Listo! Tu cita quedó agendada para el " + payload.fecha +
                    " a las " + payload.hora + ". Revisa tu correo (" + payload.email +
                    ") para ver la invitación.", "ok");
                form.reset();
                slotsBox.innerHTML = '<p class="form-note">Elige primero una fecha para ver los horarios.</p>';
            } else {
                showAlert("No se pudo agendar: " + (data.error || "intenta con otro horario."), "err");
            }
        } catch (err) {
            showAlert("Ocurrió un error de conexión. Intenta de nuevo o escríbenos por WhatsApp.", "err");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Confirmar agendamiento";
        }
    });
});
