#!/usr/bin/env node

/**
 * Build Reiki Audiobook - All-in-One Script
 *
 * Combines all 3 steps:
 * 1. Prepare chunks
 * 2. Generate audio
 * 3. Concatenate final MP3
 *
 * Usage:
 *   node scripts/build-reiki-audiobook.js <chapter-number> <lang>
 *   node scripts/build-reiki-audiobook.js 1 en
 *   node scripts/build-reiki-audiobook.js all en
 *   node scripts/build-reiki-audiobook.js all es
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${description}`);
  console.log('='.repeat(60));

  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\n❌ Failed: ${description}`);
    return false;
  }
}

function buildChapter(chapterNum, lang) {
  console.log(`\n${'━'.repeat(60)}`);
  console.log(`📚 Building Chapter ${chapterNum} (${lang.toUpperCase()})`);
  console.log('━'.repeat(60));

  // Step 1: Prepare chunks
  if (!runCommand(
    `node scripts/prepare-audio-chunks.js ${chapterNum} ${lang}`,
    'Step 1/3: Preparing audio chunks'
  )) {
    return false;
  }

  // Step 2: Generate audio
  if (!runCommand(
    `node scripts/generate-chapter-audio.js ${chapterNum} ${lang}`,
    'Step 2/3: Generating audio with Fish Audio API'
  )) {
    return false;
  }

  // Step 3: Concatenate
  if (!runCommand(
    `node scripts/concat-chapter-audio.js ${chapterNum} ${lang}`,
    'Step 3/3: Concatenating final audiobook'
  )) {
    return false;
  }

  return true;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('');
    console.log('🎙️  Reiki Audiobook Builder');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/build-reiki-audiobook.js <chapter-number> <lang>');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/build-reiki-audiobook.js 1 en      # Single chapter');
    console.log('  node scripts/build-reiki-audiobook.js all en    # All chapters English');
    console.log('  node scripts/build-reiki-audiobook.js all es    # All chapters Spanish');
    console.log('');
    process.exit(1);
  }

  const chapterArg = args[0];
  const lang = args[1];

  if (!['en', 'es'].includes(lang)) {
    console.error('❌ Language must be "en" or "es"');
    process.exit(1);
  }

  console.log('');
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(58) + '║');
  console.log('║' + '  🎙️  REIKI AUDIOBOOK BUILDER'.padEnd(58) + '║');
  console.log('║' + ' '.repeat(58) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  if (chapterArg === 'all') {
    console.log(`\n📚 Building all 11 chapters in ${lang.toUpperCase()}...\n`);

    for (let i = 1; i <= 11; i++) {
      if (buildChapter(i, lang)) {
        successCount++;
      } else {
        failCount++;
        console.error(`\n⚠️  Chapter ${i} failed. Continuing with next chapter...\n`);
      }
    }

    console.log('\n' + '━'.repeat(60));
    console.log('📊 SUMMARY');
    console.log('━'.repeat(60));
    console.log(`✅ Success: ${successCount}/11 chapters`);
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount}/11 chapters`);
    }

  } else {
    const chapterNum = parseInt(chapterArg);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 11) {
      console.error('❌ Chapter number must be between 1 and 11');
      process.exit(1);
    }

    if (buildChapter(chapterNum, lang)) {
      successCount = 1;
    } else {
      failCount = 1;
    }
  }

  const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log(`⏱️  Total time: ${duration} minutes`);

  if (failCount === 0) {
    console.log('\n' + '🎉'.repeat(20));
    console.log('');
    console.log('  ✨ ALL AUDIOBOOKS GENERATED SUCCESSFULLY! ✨');
    console.log('');
    console.log('🎉'.repeat(20));
    console.log('');
    console.log(`📁 Output location: audio/${lang}/`);
    console.log('');
  } else {
    console.log('\n⚠️  Some chapters failed. Check errors above.');
    process.exit(1);
  }
}

main();
