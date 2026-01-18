#!/usr/bin/env node

/**
 * Build Full Book HTML
 *
 * Generates a single HTML file with all chapters combined
 * Perfect for screen readers and continuous reading
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Domain Configuration
const DOMAIN = process.env.DOMAIN || 'reiki.chuchurex.cl';
const SITE_URL = `https://${DOMAIN}`;

// Configuration
const I18N_DIR = path.join(__dirname, '..', 'i18n');
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Load JSON file
function loadJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn(`Warning: Could not load ${filePath}`);
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

// Generate full book HTML
function generateFullBook(lang) {
  const langDir = path.join(I18N_DIR, lang, 'chapters');

  // Get all chapter files
  const chapterFiles = fs.readdirSync(langDir)
    .filter(f => f.endsWith('.json'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  console.log(`📖 Processing ${chapterFiles.length} chapters for ${lang.toUpperCase()}...`);

  // Load all chapters
  const chapters = chapterFiles.map(file => {
    const chapter = loadJSON(path.join(langDir, file));
    if (chapter) {
      console.log(`   ✅ Chapter ${chapter.number}: ${chapter.title}`);
    }
    return chapter;
  }).filter(c => c !== null);

  // Get translations
  const isSpanish = lang === 'es';
  const pageTitle = isSpanish ? 'Libro Completo' : 'Full Book';
  const bookTitle = isSpanish ? 'Las Enseñanzas' : 'The Teachings';
  const description = isSpanish
    ? 'Una guía completa de la práctica de sanación Reiki.'
    : 'A complete guide to Reiki healing practice.';

  // Generate HTML
  let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle} | ${DOMAIN}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="noindex, nofollow">
    <link rel="canonical" href="${SITE_URL}/${lang === 'en' ? '' : lang + '/'}full-book/">

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-9LDPDW8V6E"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-9LDPDW8V6E');
    </script>

    <link rel="alternate" hreflang="en" href="${SITE_URL}/full-book/">
    <link rel="alternate" hreflang="es" href="${SITE_URL}/es/full-book/">

    <meta property="og:type" content="book">
    <meta property="og:url" content="${SITE_URL}/${lang === 'en' ? '' : lang + '/'}full-book/">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:locale" content="${lang === 'es' ? 'es_ES' : 'en_US'}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#0d0d0f">

    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✧</text></svg>">

    <link rel="preload" href="/fonts/cormorant-garamond-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/fonts/spectral-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/fonts/fonts.css">
    <link rel="stylesheet" href="${lang === 'en' ? '..' : '../..'}css/main.css?v=${Date.now()}">

    <style>
        /* Full book specific styles */
        .full-book-header {
            text-align: center;
            margin: 3rem 0 4rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border);
        }

        .full-book-title {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-family: var(--serif);
        }

        .full-book-subtitle {
            font-size: 1.2rem;
            opacity: 0.7;
            font-weight: 300;
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
            .toggle, .back-link, .chapter-separator {
                display: none;
            }
        }
    </style>
</head>
<body>
    <button class="toggle theme-toggle" onclick="toggleTheme()" aria-label="Toggle Theme">☀</button>

    <div class="layout">
        <main class="main" style="max-width: 50rem; margin: 0 auto; padding: 2rem;">

            <a href="${lang === 'en' ? '/' : '/es/'}" class="back-link">← ${isSpanish ? 'Volver al índice' : 'Back to index'}</a>

            <header class="full-book-header">
                <h1 class="full-book-title">${bookTitle}</h1>
                <p class="full-book-subtitle">${isSpanish ? 'Libro Completo' : 'Full Book'}</p>
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

            <a href="${lang === 'en' ? '/' : '/es/'}" class="back-link">← ${isSpanish ? 'Volver al índice' : 'Back to index'}</a>

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

// Build full books
function buildFullBooks() {
  console.log('\n📚 Building full book versions...\n');

  const languages = ['en', 'es'];

  languages.forEach(lang => {
    const html = generateFullBook(lang);

    // Create output directory
    const outputDir = lang === 'en'
      ? path.join(DIST_DIR, 'full-book')
      : path.join(DIST_DIR, lang, 'full-book');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write HTML file
    const outputFile = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputFile, html, 'utf8');

    console.log(`   ✅ ${outputFile}`);
  });

  console.log('\n✨ Full book versions built successfully!\n');
  console.log('Access them at:');
  console.log(`   - English: ${SITE_URL}/full-book/`);
  console.log(`   - Spanish: ${SITE_URL}/es/full-book/`);
  console.log('');
}

// Run
buildFullBooks();
