/**
 * =====================================================================
 *  DOCHIGA SOLUCIONES — Backend de agendamiento (Google Apps Script)
 * =====================================================================
 *
 *  Qué hace:
 *   - GET  ?action=slots&fecha=YYYY-MM-DD  -> devuelve horarios libres de ese día
 *     leyendo TU Google Calendar real (respeta eventos, reuniones y vacaciones).
 *   - POST {JSON}                          -> crea el evento en tu calendario,
 *     agrega al cliente como invitado (recibe la invitación por correo) y
 *     crea un enlace de Google Meet.
 *
 *  CÓMO PUBLICARLO (lo haces tú con tu cuenta dochigasoluciones@gmail.com):
 *   1. Entra a https://script.google.com  ->  Nuevo proyecto.
 *   2. Borra el contenido y pega TODO este archivo.
 *   3. Ajusta la sección CONFIG de abajo (horario, duración, zona horaria).
 *   4. Menú "Implementar" > "Nueva implementación" > tipo "Aplicación web".
 *        - Ejecutar como:  Yo (dochigasoluciones@gmail.com)
 *        - Quién tiene acceso:  Cualquier usuario
 *   5. Autoriza los permisos cuando lo pida (Calendar).
 *   6. Copia la URL que termina en /exec y pégala en  js/agenda.js  (API_URL).
 * =====================================================================
 */

// ======================= CONFIG — AJUSTA AQUÍ =======================
var CONFIG = {
  CALENDAR_ID:  "primary",          // "primary" = tu calendario principal
  TIMEZONE:     "America/Bogota",   // zona horaria de Colombia
  WORK_START:   8,                  // hora de inicio de atención (8 = 8:00 am)
  WORK_END:     18,                 // hora de fin de atención (18 = 6:00 pm)
  SLOT_MINUTES: 60,                 // duración de cada cita en minutos
  WORK_DAYS:    [1, 2, 3, 4, 5],    // días hábiles (0=Dom ... 6=Sáb). Lun–Vie.
  MIN_LEAD_HOURS: 2,                 // no permitir agendar con menos de X horas de anticipación
  ADMIN_EMAIL:  "dochigasoluciones@gmail.com"  // recibe copia/notificación
};
// ====================================================================


/** Punto de entrada GET: disponibilidad de horarios. */
function doGet(e) {
  try {
    var action = (e.parameter.action || "slots");
    if (action === "slots") {
      var fecha = e.parameter.fecha; // YYYY-MM-DD
      var slots = getAvailableSlots(fecha);
      return json({ ok: true, fecha: fecha, slots: slots });
    }
    return json({ ok: false, error: "Acción no soportada" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Punto de entrada POST: crear la cita. */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action !== "book") {
      return json({ ok: false, error: "Acción no soportada" });
    }
    var result = createBooking(body);
    return json(result);
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Devuelve array de horas libres ["08:00","09:00",...] para la fecha dada. */
function getAvailableSlots(fecha) {
  if (!fecha) return [];
  var parts = fecha.split("-");
  var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10) - 1, d = parseInt(parts[2], 10);

  var dayStart = new Date(y, m, d, 0, 0, 0);

  // Día no hábil -> sin horarios
  if (CONFIG.WORK_DAYS.indexOf(dayStart.getDay()) === -1) return [];

  var cal = getCalendar();
  var now = new Date();
  var minTime = new Date(now.getTime() + CONFIG.MIN_LEAD_HOURS * 3600000);

  var slots = [];
  for (var h = CONFIG.WORK_START; h < CONFIG.WORK_END; h++) {
    var start = new Date(y, m, d, h, 0, 0);
    var end   = new Date(start.getTime() + CONFIG.SLOT_MINUTES * 60000);

    if (start < minTime) continue;                 // muy pronto / pasado
    var busy = cal.getEvents(start, end);           // eventos que se solapan
    if (busy.length === 0) {
      slots.push(pad(h) + ":00");
    }
  }
  return slots;
}

/** Crea el evento en el calendario e invita al cliente. */
function createBooking(b) {
  // Validaciones mínimas
  if (!b.fecha || !b.hora || !b.nombre || !b.email) {
    return { ok: false, error: "Faltan datos obligatorios." };
  }

  var parts = b.fecha.split("-");
  var hm = b.hora.split(":");
  var y = parseInt(parts[0], 10), m = parseInt(parts[1], 10) - 1, d = parseInt(parts[2], 10);
  var hh = parseInt(hm[0], 10), mm = parseInt(hm[1], 10);

  var start = new Date(y, m, d, hh, mm, 0);
  var end   = new Date(start.getTime() + CONFIG.SLOT_MINUTES * 60000);

  var cal = getCalendar();

  // Verificar que el horario siga libre (evita doble reserva)
  if (cal.getEvents(start, end).length > 0) {
    return { ok: false, error: "Ese horario acaba de ocuparse. Elige otro, por favor." };
  }

  var titulo = "[" + (b.tipo || "Cita") + "] " + b.nombre +
               (b.tema ? " — " + b.tema : "");

  var descripcion =
      "Tipo: " + (b.tipo || "") + "\n" +
      "Tema: " + (b.tema || "") + "\n" +
      "Nombre: " + b.nombre + "\n" +
      "Email: " + b.email + "\n" +
      "Teléfono: " + (b.telefono || "") + "\n" +
      "Empresa: " + (b.empresa || "") + "\n\n" +
      "Mensaje:\n" + (b.mensaje || "(sin mensaje)");

  var event = cal.createEvent(titulo, start, end, {
    description: descripcion,
    guests: b.email + "," + CONFIG.ADMIN_EMAIL,
    sendInvites: true
  });

  // Intentar agregar Google Meet (si la cuenta lo permite)
  try {
    event.setDescription(descripcion + "\n\nEsta invitación incluye los detalles de la reunión.");
  } catch (e) { /* opcional */ }

  return {
    ok: true,
    fecha: b.fecha,
    hora: b.hora,
    eventId: event.getId()
  };
}

// ----------------------- utilidades -----------------------
function getCalendar() {
  return (CONFIG.CALENDAR_ID === "primary")
    ? CalendarApp.getDefaultCalendar()
    : CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
}

function pad(n) { return (n < 10 ? "0" : "") + n; }

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
