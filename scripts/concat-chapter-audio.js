#!/usr/bin/env node

/**
 * Concatenate Chapter Audio Script
 *
 * Takes generated audio chunks and concatenates them with silences
 * Creates the final chapter audiobook MP3
 *
 * Usage:
 *   node scripts/concat-chapter-audio.js <chapter-number> <lang>
 *   node scripts/concat-chapter-audio.js 1 en
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function concatChapterAudio(chapterNum, lang) {
  const audioDir = path.join(__dirname, '..', 'audio', lang, `ch${chapterNum}`);
  const chunksFile = path.join(audioDir, 'chunks.json');
  const chunksDir = path.join(audioDir, 'chunks');
  const silencesDir = path.join(__dirname, '..', 'audio', 'silences');

  if (!fs.existsSync(chunksFile)) {
    console.error(`❌ Chunks file not found: ${chunksFile}`);
    console.error(`   Run: node scripts/prepare-audio-chunks.js ${chapterNum} ${lang}`);
    process.exit(1);
  }

  if (!fs.existsSync(chunksDir)) {
    console.error(`❌ Chunks directory not found: ${chunksDir}`);
    console.error(`   Run: node scripts/generate-chapter-audio.js ${chapterNum} ${lang}`);
    process.exit(1);
  }

  const chunksData = JSON.parse(fs.readFileSync(chunksFile, 'utf8'));

  console.log(`📖 Concatenating audio for Chapter ${chapterNum}: ${chunksData.title}`);
  console.log(`   📊 Total chunks: ${chunksData.totalChunks}`);

  // Create concat list
  const concatListPath = path.join(audioDir, 'concat-list.txt');
  let concatList = '';
  let missingChunks = [];

  for (const chunk of chunksData.chunks) {
    const chunkFile = path.join(chunksDir, `${chunk.id}.mp3`);

    if (!fs.existsSync(chunkFile)) {
      missingChunks.push(chunk.id);
      continue;
    }

    // Add chunk audio
    concatList += `file '${chunkFile}'\n`;

    // Add silence after chunk
    if (chunk.pauseAfter > 0) {
      const silenceFile = path.join(silencesDir, `silence-${chunk.pauseAfter}s.mp3`);

      if (!fs.existsSync(silenceFile)) {
        console.error(`❌ Silence file not found: ${silenceFile}`);
        console.error(`   This should have been created by generate-chapter-audio.js`);
        process.exit(1);
      }

      concatList += `file '${silenceFile}'\n`;
    }
  }

  if (missingChunks.length > 0) {
    console.error(`\n❌ Missing ${missingChunks.length} audio chunks:`);
    missingChunks.forEach(id => console.error(`   - ${id}.mp3`));
    console.error(`\n   Run: node scripts/generate-chapter-audio.js ${chapterNum} ${lang}`);
    process.exit(1);
  }

  // Save concat list
  fs.writeFileSync(concatListPath, concatList, 'utf8');
  console.log(`   ✅ Created concat list: ${chunksData.chunks.length * 2} entries`);

  // Concatenate with ffmpeg
  const outputFile = path.join(audioDir, `ch${chapterNum}-${lang}.mp3`);

  console.log(`\n🎵 Concatenating audio with ffmpeg...`);
  console.log(`   Output: ${path.basename(outputFile)}`);

  try {
    const command = `ffmpeg -f concat -safe 0 -i "${concatListPath}" -c copy "${outputFile}" -y 2>&1`;
    const output = execSync(command, { encoding: 'utf8' });

    // Parse duration from ffmpeg output
    const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const seconds = parseInt(durationMatch[3]);
      const totalMinutes = hours * 60 + minutes + (seconds / 60);
      console.log(`   ⏱️  Duration: ${hours}h ${minutes}m ${seconds}s (${totalMinutes.toFixed(1)} min)`);
    }

    const sizeKB = (fs.statSync(outputFile).size / 1024).toFixed(1);
    const sizeMB = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(2);

    console.log(`   📦 File size: ${sizeMB} MB (${sizeKB} KB)`);
    console.log(`\n   ✅ Final audio saved: ${outputFile}`);

  } catch (error) {
    console.error(`\n❌ ffmpeg error: ${error.message}`);
    process.exit(1);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Concatenation complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Optional: Ask if user wants to clean up chunks
  console.log('💡 Tip: You can now delete the chunks/ directory to save space:');
  console.log(`   rm -rf "${chunksDir}"`);
  console.log('');

  return outputFile;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node scripts/concat-chapter-audio.js <chapter-number> <lang>');
    console.log('Example: node scripts/concat-chapter-audio.js 1 en');
    process.exit(1);
  }

  const chapterNum = parseInt(args[0]);
  const lang = args[1];

  if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 11) {
    console.error('❌ Chapter number must be between 1 and 11');
    process.exit(1);
  }

  if (!['en', 'es'].includes(lang)) {
    console.error('❌ Language must be "en" or "es"');
    process.exit(1);
  }

  console.log(`\n🎬 Audio Concatenation\n`);

  try {
    concatChapterAudio(chapterNum, lang);
    console.log('🎉 Done! Your audiobook is ready.');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
