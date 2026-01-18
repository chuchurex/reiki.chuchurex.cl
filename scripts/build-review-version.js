#!/usr/bin/env node

/**
 * Build Review Version from RAFA_REIKI_COMPLETO2.json
 *
 * Generates a single HTML file with all chapters for review
 * Perfect for screen readers and continuous reading
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Domain Configuration
const DOMAIN = process.env.DOMAIN || 'reiki.chuchurex.cl';
const SITE_URL = `https://${DOMAIN}`;

// Configuration
const SOURCE_FILE = path.join(__dirname, '..', 'RAFA_REIKI_COMPLETO2.json');
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Load JSON file
function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`❌ Error loading ${filePath}: ${e.message}`);
    return null;
  }
}

// Process text with emphasis
function processText(text) {
  // Replace **text** with <strong>
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Replace *text* or <em>text</em> with <em>
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Keep existing <em> tags
  text = text.replace(/<em>/g, '<em>').replace(/<\/em>/g, '</em>');

  return text;
}

// Generate review HTML
function generateReviewHTML() {
  console.log('\n📖 Generando versión de revisión...\n');

  // Load source file
  const chapters = loadJSON(SOURCE_FILE);
  if (!chapters) {
    console.error('❌ No se pudo cargar el archivo fuente');
    process.exit(1);
  }

  console.log(`✅ Cargados ${chapters.length} capítulos\n`);

  // Show chapter list
  chapters.forEach(ch => {
    console.log(`   ${ch.number}. ${ch.title}`);
  });

  // Generate HTML
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Versión de Revisión - Nueva Edición | ${DOMAIN}</title>
    <meta name="description" content="Versión de revisión del libro completo para lectura con lector de pantalla.">
    <meta name="robots" content="noindex, nofollow">

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-9LDPDW8V6E"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-9LDPDW8V6E');
    </script>

    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✧</text></svg>">

    <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/fonts/fonts.css">
    <link rel="stylesheet" href="../css/main.css?v=${Date.now()}">

    <style>
        /* Review version specific styles */
        .review-header {
            text-align: center;
            margin: 3rem 0 4rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border);
        }

        .review-title {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-family: var(--serif);
        }

        .review-subtitle {
            font-size: 1.2rem;
            opacity: 0.7;
            font-weight: 300;
            margin-bottom: 1rem;
        }

        .review-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: var(--accent);
            color: var(--bg);
            border-radius: 4px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-top: 1rem;
        }

        .chapter-separator {
            margin: 4rem 0;
            text-align: center;
            opacity: 0.3;
        }

        .chapter {
            margin-bottom: 4rem;
        }

        .back-link {
            display: inline-block;
            margin: 2rem 0;
            padding: 0.75rem 1.5rem;
            background: var(--accent);
            color: var(--bg);
            text-decoration: none;
            border-radius: 4px;
            transition: opacity 0.2s;
        }

        .back-link:hover {
            opacity: 0.8;
        }

        /* Print styles */
        @media print {
            .toggle, .back-link, .chapter-separator, .review-badge {
                display: none;
            }
        }
    </style>
</head>
<body>
    <button class="toggle theme-toggle" onclick="toggleTheme()" aria-label="Cambiar Tema">☀</button>

    <div class="layout">
        <main class="main" style="max-width: 50rem; margin: 0 auto; padding: 2rem;">

            <a href="/es/" class="back-link">← Volver al índice</a>

            <header class="review-header">
                <h1 class="review-title">Las Enseñanzas</h1>
                <p class="review-subtitle">Versión de Revisión - Nueva Edición</p>
                <span class="review-badge">VERSIÓN PARA REVISIÓN</span>
            </header>
`;

  // Add each chapter
  chapters.forEach((chapter, index) => {
    if (index > 0) {
      html += `\n            <div class="chapter-separator">✧ ✧ ✧</div>\n\n`;
    }

    html += `            <article class="chapter" id="ch${chapter.number}">
                <header class="ch-head">
                    <div class="ch-head-top">
                        <div class="ch-num">${chapter.numberText}</div>
                    </div>
                    <h2 class="ch-title">${chapter.title}</h2>
                </header>
`;

    // Add sections
    chapter.sections.forEach(section => {
      html += `
                <section class="section" id="${section.id}">
`;

      // Add content blocks
      section.content.forEach(block => {
        const processedText = processText(block.text);
        if (block.type === 'paragraph') {
          html += `                    <p>${processedText}</p>\n`;
        } else if (block.type === 'quote') {
          html += `                    <blockquote>${processedText}</blockquote>\n`;
        }
      });

      html += `                </section>\n`;
    });

    html += `            </article>\n`;
  });

  // Close HTML
  html += `
            <div class="chapter-separator">✧ ✧ ✧</div>

            <a href="/es/" class="back-link">← Volver al índice</a>

        </main>
    </div>

    <script>
        // Theme toggle
        function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeButton(newTheme);
        }

        function updateThemeButton(theme) {
            const btn = document.querySelector('.theme-toggle');
            btn.textContent = theme === 'light' ? '☀' : '☽';
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
    </script>
</body>
</html>`;

  return html;
}

// Build review version
function buildReviewVersion() {
  console.log('\n📚 Construyendo versión de revisión...\n');

  const html = generateReviewHTML();

  // Create output directory
  const outputDir = path.join(DIST_DIR, 'revision');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write HTML file
  const outputFile = path.join(outputDir, 'index.html');
  fs.writeFileSync(outputFile, html, 'utf8');

  const fileSize = (fs.statSync(outputFile).size / 1024).toFixed(1);

  console.log(`\n✅ Archivo generado: ${outputFile}`);
  console.log(`📦 Tamaño: ${fileSize} KB`);
  console.log('\n✨ Versión de revisión lista!\n');
  console.log('🔗 URL de acceso:');
  console.log(`   ${SITE_URL}/revision/`);
  console.log('');
}

// Run
buildReviewVersion();
