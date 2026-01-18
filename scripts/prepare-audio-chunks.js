#!/usr/bin/env node

/**
 * Prepare Audio Chunks Script
 *
 * Reads a chapter JSON and divides it into chunks for TTS generation
 * Each chunk has metadata about pause duration after it
 *
 * Usage:
 *   node scripts/prepare-audio-chunks.js <chapter-number> <lang>
 *   node scripts/prepare-audio-chunks.js 1 en
 *   node scripts/prepare-audio-chunks.js all en
 */

const fs = require('fs');
const path = require('path');

// Pause durations in seconds
const PAUSES = {
  afterTitle: 2.0,
  afterParagraph: 0.8,
  afterQuote: 1.5,
  afterSection: 2.5,
  endChapter: 3.0
};

function cleanText(text) {
  if (!text) return '';

  // Remove {term:...} markers
  text = text.replace(/\{term:([^}|]+)(?:\|([^}]+))?\}/g, (match, termId, customText) => {
    return customText || termId;
  });

  // Remove {ref:...} markers
  text = text.replace(/\{ref:([^}]+)\}/g, '');

  // Remove HTML tags but keep the content
  text = text.replace(/<em>/g, '');
  text = text.replace(/<\/em>/g, '');
  text = text.replace(/<strong>/g, '');
  text = text.replace(/<\/strong>/g, '');

  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

function prepareChapterChunks(chapterNum, lang) {
  const chapterFile = path.join(__dirname, '..', 'i18n', lang, 'chapters', `ch${chapterNum}.json`);

  if (!fs.existsSync(chapterFile)) {
    console.error(`❌ Chapter file not found: ${chapterFile}`);
    process.exit(1);
  }

  const chapter = JSON.parse(fs.readFileSync(chapterFile, 'utf8'));

  console.log(`📖 Preparing chunks for Chapter ${chapterNum}: ${chapter.title}`);

  const chunks = [];

  // Chunk 0: Chapter intro (number + title)
  chunks.push({
    id: `ch${chapterNum}-chunk-000`,
    type: 'intro',
    text: `${chapter.numberText}. ${chapter.title}`,
    pauseAfter: PAUSES.afterTitle
  });

  let chunkIndex = 1;

  // Process each section
  chapter.sections.forEach((section, sectionIndex) => {
    const isLastSection = sectionIndex === chapter.sections.length - 1;

    // Process each content block in the section
    section.content.forEach((block, blockIndex) => {
      const isLastBlock = blockIndex === section.content.length - 1;

      const cleanedText = cleanText(block.text);

      if (!cleanedText) return; // Skip empty blocks

      let pauseAfter = PAUSES.afterParagraph;

      // Determine pause based on block type and position
      if (block.type === 'quote') {
        pauseAfter = PAUSES.afterQuote;
      }

      if (isLastBlock && isLastSection) {
        pauseAfter = PAUSES.endChapter;
      } else if (isLastBlock) {
        pauseAfter = PAUSES.afterSection;
      }

      chunks.push({
        id: `ch${chapterNum}-chunk-${String(chunkIndex).padStart(3, '0')}`,
        type: block.type,
        text: cleanedText,
        pauseAfter: pauseAfter
      });

      chunkIndex++;
    });
  });

  // Save chunks JSON
  const outputDir = path.join(__dirname, '..', 'audio', lang, `ch${chapterNum}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const chunksFile = path.join(outputDir, 'chunks.json');
  const chunksData = {
    chapter: chapterNum,
    title: chapter.title,
    lang: lang,
    totalChunks: chunks.length,
    chunks: chunks
  };

  fs.writeFileSync(chunksFile, JSON.stringify(chunksData, null, 2), 'utf8');

  console.log(`   ✅ Created ${chunks.length} chunks`);
  console.log(`   💾 Saved: ${chunksFile}`);

  // Calculate estimated characters and duration
  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.text.length, 0);
  const estimatedMinutes = Math.ceil(totalChars / 1000 * 0.8); // Rough estimate: 1000 chars ≈ 0.8 min

  console.log(`   📊 Total characters: ${totalChars.toLocaleString()}`);
  console.log(`   ⏱️  Estimated duration: ~${estimatedMinutes} minutes`);

  return chunksData;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node scripts/prepare-audio-chunks.js <chapter-number> <lang>');
    console.log('Example: node scripts/prepare-audio-chunks.js 1 en');
    console.log('         node scripts/prepare-audio-chunks.js all en');
    process.exit(1);
  }

  const chapterArg = args[0];
  const lang = args[1];

  if (!['en', 'es'].includes(lang)) {
    console.error('❌ Language must be "en" or "es"');
    process.exit(1);
  }

  console.log(`\n🎬 Audio Chunks Preparation\n`);

  if (chapterArg === 'all') {
    console.log('📚 Processing all 11 chapters...\n');
    for (let i = 1; i <= 11; i++) {
      prepareChapterChunks(i, lang);
      console.log('');
    }
    console.log('✨ All chapters prepared!\n');
  } else {
    const chapterNum = parseInt(chapterArg);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 11) {
      console.error('❌ Chapter number must be between 1 and 11');
      process.exit(1);
    }
    prepareChapterChunks(chapterNum, lang);
  }
}

main();
