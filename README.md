# 📖 Reiki Book - Digital Edition

> A comprehensive guide to Reiki healing practice

This project presents a complete guide to Reiki healing in an accessible digital format.

**Website**: https://reiki.chuchurex.cl

## 🌟 Features

- 11 comprehensive chapters on Reiki
- Multilingual support (EN/ES)
- Responsive design (desktop, tablet, mobile)
- Dark/Light theme toggle
- Notes and definitions panel
- PDF generation support
- Audio support (optional)

## 🎯 Purpose

This digital book aims to share the wisdom and practice of Reiki healing in an accessible, modern format.

## 🚀 Using the Project

### Installation

```bash
# Navigate to project directory
cd reiki.chuchurex.cl

# Install dependencies
npm install

# Configure environment variables
# Edit .env with your deployment credentials
```

### Local Development

```bash
# Development server
npm run dev

# The site will be available at http://127.0.0.1:3002
```

### Build and Deploy

```bash
# Generate static site
npm run build

# Deploy (requires configuration in .env)
npm run publish
```

## 📁 Structure

```
reiki.chuchurex.cl/
├── i18n/                     # Multilingual content
│   ├── es/                   # Spanish
│   └── en/                   # English
│       ├── ui.json           # Site configuration
│       ├── chapters/         # Book chapters (ch1-ch11.json)
│       ├── about.json        # About page
│       ├── glossary.json     # Glossary of terms
│       ├── references.json   # References
│       └── media.json        # Media resources
├── scripts/                  # Build and deploy scripts
├── scss/                     # Styles (SASS)
├── dist/                     # Generated static site
├── fonts/                    # Custom fonts
└── .env                      # Deployment configuration
```

## 📝 Content Structure

Each chapter file (`ch1.json` - `ch11.json`) should follow this structure:

```json
{
  "number": 1,
  "title": "Chapter Title",
  "sections": [
    {
      "title": "Section Title",
      "content": [
        {
          "type": "paragraph",
          "text": "Content here..."
        }
      ]
    }
  ]
}
```

## 🔧 Configuration

The `.env` file contains deployment credentials:

```env
DOMAIN=reiki.chuchurex.cl
UPLOAD_HOST=195.35.41.9
UPLOAD_PORT=65002
UPLOAD_USER=u363856815
UPLOAD_PASS=your-password
REMOTE_DIR=/home/u363856815/domains/reiki.chuchurex.cl/public_html/
```

## 🌐 Deployment

Deploy to production with:

```bash
npm run publish
```

This will:
1. Build the static site
2. Upload to server via rsync/SSH
3. Commit and push changes to git

## 📄 License

© 2026 Reiki Book - All rights reserved

---

Created with ❤️ by Carlos Martínez
