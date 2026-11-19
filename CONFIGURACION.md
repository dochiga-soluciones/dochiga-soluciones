# Guía de configuración

El sitio funciona de inmediato, pero el **agendamiento** y las **donaciones** necesitan que pegues tus credenciales. Son dos pasos, cada uno de 5 minutos. No requieren tocar el diseño.

---

## 1. Agendamiento con tu Google Calendar real

El sitio es estático (GitHub Pages) y no puede leer tu calendario por sí solo. Un **Google Apps Script** actúa de backend: lee tus huecos libres (respetando reuniones y vacaciones) y crea la cita invitando al cliente.

### Pasos (con la cuenta `dochigasoluciones@gmail.com`)

1. Entra a <https://script.google.com> → **Nuevo proyecto**.
2. Borra el código de ejemplo y pega **todo** el contenido de `apps-script/Codigo.gs`.
3. Revisa la sección `CONFIG` al inicio del archivo y ajusta si hace falta:
   - `WORK_START` / `WORK_END` → horario de atención (configurado: 8:00–14:00).
   - `SLOT_MINUTES` → duración de cada cita (por defecto 60 min).
   - `WORK_DAYS` → días hábiles (configurado: Lunes, Miércoles y Viernes → `[1, 3, 5]`).
   - `TIMEZONE` → `America/Bogota`.
4. Menú **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo** (tu cuenta).
   - Quién tiene acceso: **Cualquier usuario**.
5. Autoriza los permisos de Calendar cuando lo pida.
6. Copia la **URL** que termina en `/exec`.
7. Ábrela en `js/agenda.js` y reemplaza:
   ```js
   const API_URL = "PEGA_AQUI_LA_URL_DE_TU_APPS_SCRIPT";
   ```
   por tu URL real. Guarda y sube el cambio.

> Si cambias el código del Apps Script después, crea una **nueva versión** de la implementación para que surta efecto.

---

## 2. Donaciones con ePayco (cuenta ser-cafe)

La página **Tienda** permite donar un monto libre para las capacitaciones mediante el checkout de ePayco.

### Pasos

1. Entra a tu panel de ePayco → **Configuración / Integraciones → Llaves**.
2. Copia tu **PUBLIC_KEY** (la llave pública; es segura de exponer en el sitio).
3. Ábrela en `js/donacion.js` y reemplaza:
   ```js
   const EPAYCO_PUBLIC_KEY = "PEGA_AQUI_TU_PUBLIC_KEY_EPAYCO";
   const EPAYCO_TEST = true; // déjalo en true para probar; ponlo en false para cobrar de verdad
   ```
4. Prueba una donación en modo `test`. Cuando todo funcione, cambia `EPAYCO_TEST` a `false`.

> La `PRIVATE_KEY` **nunca** se pone en el sitio web. Solo se usa la pública aquí.

---

## 3. Publicar en GitHub Pages

En GitHub: **Settings → Pages →** rama `main`, carpeta `/ (root)`. El sitio quedará en
`https://dochiga-soluciones.github.io/dochiga-soluciones/`.

> Se eliminó el dominio `dojhogroup.com` (archivo `CNAME`), así que el sitio usa la URL de GitHub Pages.
