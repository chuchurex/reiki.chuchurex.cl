# 📖 Las Enseñanzas de la Ley del Uno - Documentación

> Generador de sitio web estático para presentar las enseñanzas de la Ley del Uno

## Resumen

Este proyecto es un generador de sitios web estáticos diseñado específicamente para presentar textos espirituales y filosóficos en un formato accesible y hermoso. Construido para "Las Enseñanzas de la Ley del Uno", una interpretación personal del material de Ra.

**Sitio en vivo**: https://lawofone.chuchurex.cl

## Características

- 📖 **Generación de HTML estático** desde contenido JSON
- 🌍 **Soporte multilingüe** (Español, Inglés, Portugués)
- 📄 **Generación automática de PDFs** con Puppeteer
- 📝 **Sistema de glosario y referencias** con tooltips al pasar el cursor
- 🎨 **Diseño responsivo** optimizado para lectura
- 🚀 **Despliegue automatizado** vía rsync/SSH
- 🔊 **Soporte para generación de audiolibros** (opcional)
- 🤖 **Amigable con SEO** con metadatos apropiados

## Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/chuchurex/lawofone.chuchurex.cl.git
cd lawofone.chuchurex.cl

# Instalar dependencias
npm install

# Configurar entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor de desarrollo
npm run dev
# Sitio disponible en http://127.0.0.1:3002
```

## Estructura del Proyecto

```
lawofone.chuchurex.cl/
├── i18n/                     # Contenido multilingüe
│   ├── es/                   # Español
│   ├── en/                   # Inglés
│   └── pt/                   # Portugués (si está disponible)
│       ├── ui.json           # Traducciones de UI
│       ├── chapters/         # Capítulos del libro
│       ├── about.json        # Página "Acerca de"
│       ├── glossary.json     # Términos del glosario
│       └── references.json   # Referencias
├── scripts/                  # Scripts de build y deploy
│   ├── build.js              # Script principal de build
│   ├── build-pdf.js          # Generación de PDFs
│   └── deploy.js             # Script de despliegue
├── scss/                     # Estilos
├── templates/                # Plantillas HTML
├── fonts/                    # Fuentes auto-hospedadas
└── docs/                     # Documentación (esta carpeta)
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo con recarga en vivo |
| `npm run build` | Generar sitio estático en `/dist` |
| `npm run build:pdf <cap> <lang>` | Generar PDF para capítulo específico |
| `npm run build:pdf all <lang>` | Generar todos los PDFs para un idioma |
| `npm run publish` | Build + Deploy a producción |

## Formato del Contenido

El contenido se almacena en archivos JSON con la siguiente estructura:

```json
{
  "id": "ch1",
  "number": 1,
  "numberText": "Capítulo Uno",
  "title": "Introducción",
  "sections": [
    {
      "id": "ch1-intro",
      "title": "Título de la Sección",
      "content": [
        {
          "type": "paragraph",
          "text": "Texto con **negrita** y *cursiva*."
        },
        {
          "type": "quote",
          "text": "Una cita destacada."
        }
      ]
    }
  ]
}
```

### Características del Texto

- **Negrita**: `**texto**`
- **Cursiva**: `*texto*`
- **Términos del glosario**: `{term:id}` o `{term:id|Texto Personalizado}`
- **Referencias**: `{ref:categoria:id}`

## Configuración

Configuración clave en `.env`:

```bash
# Dominio
DOMAIN=tu-sitio.com

# Despliegue (SSH/RSYNC)
UPLOAD_HOST=tu-servidor.com
UPLOAD_PORT=65002
UPLOAD_USER=tu-usuario
UPLOAD_PASS=tu-contraseña
UPLOAD_DIR=/ruta/a/public_html/

# Cloudflare (opcional - para caché)
CF_API_KEY=tu-api-key
CF_EMAIL=tu-email
CF_ZONE_ID=tu-zone-id

# Audio TTS (opcional)
FISH_API_KEY=tu-fish-api-key
FISH_VOICE_ID=tu-voice-id
```

## Lectura Adicional

- [Guía de Despliegue](./DEPLOYMENT.md) - Cómo desplegar a producción
- [Configuración de Cloudflare](./CLOUDFLARE.md) - Gestión de caché y CDN

## Atribuciones

Basado en **The Ra Material / The Law of One** © L/L Research
- Canalizado por Don Elkins, Carla Rueckert y Jim McCarty
- Traducción original al español por Dhyana C. y equipo de llresearch.org

**Importante**: Este proyecto es una interpretación personal. Para el material original, visita:
- Sitio oficial: https://llresearch.org
- En español: https://www.lawofone.info/es

## Licencia

- **Código**: Licencia MIT
- **Contenido**: Interpretación personal del material de la Ley del Uno (© L/L Research)

Compartido sin fines de lucro con propósitos educativos y espirituales.

---

*"Todo es uno, y ese uno es amor/luz, luz/amor, el Creador Infinito."*
