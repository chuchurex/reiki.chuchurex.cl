# 📖 The Teachings of the Law of One - Documentation

> Static website generator for presenting the Law of One teachings

## Overview

This project is a static website generator specifically designed for presenting spiritual and philosophical texts in an accessible, beautiful format. Built for "The Teachings of the Law of One," a personal interpretation of Ra's material.

**Live site**: https://lawofone.chuchurex.cl

## Features

- 📖 **Static HTML generation** from JSON content
- 🌍 **Multilingual support** (Spanish, English, Portuguese)
- 📄 **Automatic PDF generation** with Puppeteer
- 📝 **Glossary and references system** with hover tooltips
- 🎨 **Responsive design** optimized for reading
- 🚀 **Automated deployment** via rsync/SSH
- 🔊 **Audiobook generation** support (optional)
- 🤖 **SEO-friendly** with proper metadata

## Quick Start

```bash
# Clone the repository
git clone https://github.com/chuchurex/lawofone.chuchurex.cl.git
cd lawofone.chuchurex.cl

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
# Site available at http://127.0.0.1:3002
```

## Project Structure

```
lawofone.chuchurex.cl/
├── i18n/                     # Multilingual content
│   ├── es/                   # Spanish
│   ├── en/                   # English
│   └── pt/                   # Portuguese (if available)
│       ├── ui.json           # UI translations
│       ├── chapters/         # Book chapters
│       ├── about.json        # About page
│       ├── glossary.json     # Glossary terms
│       └── references.json   # References
├── scripts/                  # Build and deploy scripts
│   ├── build.js              # Main build script
│   ├── build-pdf.js          # PDF generation
│   └── deploy.js             # Deployment script
├── scss/                     # Styles
├── templates/                # HTML templates
├── fonts/                    # Self-hosted fonts
└── docs/                     # Documentation (this folder)
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with live reload |
| `npm run build` | Generate static site in `/dist` |
| `npm run build:pdf <ch> <lang>` | Generate PDF for specific chapter |
| `npm run build:pdf all <lang>` | Generate all PDFs for a language |
| `npm run publish` | Build + Deploy to production |

## Content Format

Content is stored in JSON files with the following structure:

```json
{
  "id": "ch1",
  "number": 1,
  "numberText": "Chapter One",
  "title": "Introduction",
  "sections": [
    {
      "id": "ch1-intro",
      "title": "Section Title",
      "content": [
        {
          "type": "paragraph",
          "text": "Text with **bold** and *italic*."
        },
        {
          "type": "quote",
          "text": "A highlighted quote."
        }
      ]
    }
  ]
}
```

### Text Features

- **Bold**: `**text**`
- **Italic**: `*text*`
- **Glossary terms**: `{term:id}` or `{term:id|Custom Text}`
- **References**: `{ref:category:id}`

## Configuration

Key configuration in `.env`:

```bash
# Domain
DOMAIN=your-site.com

# Deployment (SSH/RSYNC)
UPLOAD_HOST=your-server.com
UPLOAD_PORT=65002
UPLOAD_USER=your-username
UPLOAD_PASS=your-password
UPLOAD_DIR=/path/to/public_html/

# Cloudflare (optional - for cache)
CF_API_KEY=your-api-key
CF_EMAIL=your-email
CF_ZONE_ID=your-zone-id

# Audio TTS (optional)
FISH_API_KEY=your-fish-api-key
FISH_VOICE_ID=your-voice-id
```

## Further Reading

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to production
- [Cloudflare Setup](./CLOUDFLARE.md) - Cache management and CDN

## Attribution

Based on **The Ra Material / The Law of One** © L/L Research
- Channeled by Don Elkins, Carla Rueckert, and Jim McCarty
- Original Spanish translation by Dhyana C. and llresearch.org team

**Important**: This project is a personal interpretation. For the original material, visit:
- Official site: https://llresearch.org
- Spanish: https://www.lawofone.info/es

## License

- **Code**: MIT License
- **Content**: Personal interpretation of Law of One material (© L/L Research)

Shared non-commercially for educational and spiritual purposes.

---

*"All is one, and that one is love/light, light/love, the Infinite Creator."*
