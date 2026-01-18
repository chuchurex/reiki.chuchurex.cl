#!/usr/bin/env node

/**
 * Split Spanish Chapters Script
 *
 * Takes RAFA_REIKI_COMPLETO.json and splits it into individual chapter files
 * in the i18n/es/chapters/ directory.
 */

const fs = require('fs');
const path = require('path');

// Paths
const SOURCE_FILE = path.join(__dirname, '..', 'RAFA_REIKI_COMPLETO.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'i18n', 'es', 'chapters');

console.log('\n📚 Splitting Spanish chapters...\n');

// Load the source file
let chapters;
try {
  const content = fs.readFileSync(SOURCE_FILE, 'utf8');
  chapters = JSON.parse(content);
  console.log(`✅ Loaded ${chapters.length} chapters from RAFA_REIKI_COMPLETO.json`);
} catch (error) {
  console.error(`❌ Error loading source file: ${error.message}`);
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Created output directory: ${OUTPUT_DIR}`);
}

// Process each chapter
let successCount = 0;
let errorCount = 0;

chapters.forEach((chapter, index) => {
  try {
    const chapterNum = chapter.number;
    const chapterId = chapter.id;
    const outputFile = path.join(OUTPUT_DIR, `${chapterId}.json`);

    // Write the chapter file
    fs.writeFileSync(outputFile, JSON.stringify(chapter, null, 2) + '\n', 'utf8');

    console.log(`✅ Chapter ${chapterNum}: ${chapter.title}`);
    console.log(`   → ${outputFile}`);

    successCount++;
  } catch (error) {
    console.error(`❌ Error processing chapter ${index + 1}: ${error.message}`);
    errorCount++;
  }
});

// Summary
console.log('\n' + '═'.repeat(60));
console.log('📊 Summary:');
console.log(`   ✅ Successfully created: ${successCount} chapters`);
if (errorCount > 0) {
  console.log(`   ❌ Errors: ${errorCount}`);
}
console.log('═'.repeat(60));

if (successCount > 0) {
  console.log('\n✨ Spanish chapters are ready!');
  console.log('\nNext steps:');
  console.log('   1. Review the generated files in i18n/es/chapters/');
  console.log('   2. Run: npm run build');
  console.log('   3. Commit the changes\n');
}

process.exit(errorCount > 0 ? 1 : 0);
