# Dochiga Soluciones

Sitio web de Dochiga Soluciones: capacitaciones de **Power BI** y **Excel**, automatización de procesos y proyectos de **Business Intelligence**, con **agendamiento en línea** conectado a Google Calendar y **donaciones** vía ePayco.

Sitio estático publicado en **GitHub Pages**.

## Páginas

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Inicio | `index.html` | Portada y resumen de servicios |
| Capacitaciones | `capacitaciones.html` | Cursos de Power BI y Excel (por nivel) |
| Agendar | `agendar.html` | Reserva de citas con disponibilidad real |
| Servicios | `servicios.html` | Catálogo de servicios |
| Tienda | `tienda.html` | Donaciones (ePayco) + proyectos cotizables |
| Nosotros | `nosotros.html` | Quiénes somos |
| Contacto | `contacto.html` | Canales de contacto |

## Configuración pendiente

Dos integraciones requieren tus credenciales. Ver **`CONFIGURACION.md`** para el paso a paso:

1. **Agendamiento (Google Apps Script)** → pega la URL del Web App en `js/agenda.js`.
2. **Donaciones (ePayco)** → pega tu `PUBLIC_KEY` en `js/donacion.js`.

## Estructura

```
.
├── index.html, capacitaciones.html, agendar.html, servicios.html,
│   tienda.html, nosotros.html, contacto.html
├── css/estilos.css
├── js/
│   ├── animaciones.js   # animaciones y menú móvil
│   ├── agenda.js        # agendamiento + pop-up de donación (requiere URL Apps Script)
│   ├── epayco-config.js # configuración ePayco compartida (requiere PUBLIC_KEY)
│   └── donacion.js      # donación en la página Tienda
├── apps-script/
│   └── Codigo.gs        # backend de calendario (desplegar en script.google.com)
├── CONFIGURACION.md     # guía de configuración
└── README.md
```

## Contacto

- 📞 318 641 3008
- 📧 dochigasoluciones@gmail.com
- 💬 [WhatsApp](https://wa.me/573186413008)
