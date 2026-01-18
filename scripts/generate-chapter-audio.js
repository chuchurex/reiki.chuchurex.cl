#!/usr/bin/env node

/**
 * Generate Chapter Audio Script
 *
 * Takes prepared chunks and generates audio files using Fish Audio API
 * Also creates silence MP3 files for concatenation
 *
 * Usage:
 *   node scripts/generate-chapter-audio.js <chapter-number> <lang>
 *   node scripts/generate-chapter-audio.js 1 en
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const { encode } = require('@msgpack/msgpack');
const { execSync } = require('child_process');

const API_URL = 'https://api.fish.audio/v1/tts';
const DELAY_BETWEEN_REQUESTS = 500; // ms

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateSilence(duration, outputPath) {
  if (fs.existsSync(outputPath)) {
    console.log(`   ⏭️  Silence file exists: ${duration}s`);
    return;
  }

  console.log(`   🔇 Generating silence: ${duration}s`);

  const command = `ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t ${duration} -q:a 9 -acodec libmp3lame "${outputPath}" -y 2>/dev/null`;

  try {
    execSync(command);
    console.log(`   ✅ Created: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`   ❌ Failed to create silence file: ${error.message}`);
    throw error;
  }
}

async function generateAllSilences(audioDir) {
  const silencesDir = path.join(audioDir, 'silences');
  if (!fs.existsSync(silencesDir)) {
    fs.mkdirSync(silencesDir, { recursive: true });
  }

  console.log('\n🔇 Creating silence files...');

  const durations = [0.8, 1.5, 2.0, 2.5, 3.0];

  for (const duration of durations) {
    const outputPath = path.join(silencesDir, `silence-${duration}s.mp3`);
    await generateSilence(duration, outputPath);
  }

  console.log('');
}

async function textToSpeech(text, outputPath, voiceId) {
  const apiKey = process.env.FISH_API_KEY;

  if (!apiKey) {
    throw new Error('FISH_API_KEY environment variable is required');
  }

  const requestData = {
    text: text,
    reference_id: voiceId,
    format: 'mp3',
    mp3_bitrate: 128,
    chunk_length: 200,
    latency: 'normal',
    normalize: true
  };

  const body = Buffer.from(encode(requestData));

  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);

    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/msgpack',
        'Content-Length': body.length
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        let errorData = '';
        res.on('data', chunk => errorData += chunk);
        res.on('end', () => {
          reject(new Error(`API Error ${res.statusCode}: ${errorData}`));
        });
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const audioBuffer = Buffer.concat(chunks);
        fs.writeFileSync(outputPath, audioBuffer);
        resolve(outputPath);
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function generateChapterAudio(chapterNum, lang) {
  const chunksFile = path.join(__dirname, '..', 'audio', lang, `ch${chapterNum}`, 'chunks.json');

  if (!fs.existsSync(chunksFile)) {
    console.error(`❌ Chunks file not found: ${chunksFile}`);
    console.error(`   Run: node scripts/prepare-audio-chunks.js ${chapterNum} ${lang}`);
    process.exit(1);
  }

  const chunksData = JSON.parse(fs.readFileSync(chunksFile, 'utf8'));
  const voiceId = process.env.FISH_VOICE_ID || 'f53102becdf94a51af6d64010bc658f2';

  console.log(`📖 Generating audio for Chapter ${chapterNum}: ${chunksData.title}`);
  console.log(`   🎤 Voice ID: ${voiceId}`);
  console.log(`   📊 Total chunks: ${chunksData.totalChunks}`);

  const audioDir = path.dirname(chunksFile);
  const chunksDir = path.join(audioDir, 'chunks');

  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir, { recursive: true });
  }

  // Generate silence files first
  await generateAllSilences(path.join(__dirname, '..', 'audio'));

  console.log('\n🎙️  Generating audio chunks...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < chunksData.chunks.length; i++) {
    const chunk = chunksData.chunks[i];
    const outputPath = path.join(chunksDir, `${chunk.id}.mp3`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`   ⏭️  [${i + 1}/${chunksData.totalChunks}] Skipping (exists): ${chunk.id}`);
      successCount++;
      continue;
    }

    console.log(`   🎵 [${i + 1}/${chunksData.totalChunks}] Generating: ${chunk.id}`);
    console.log(`      Text: ${chunk.text.substring(0, 60)}...`);

    try {
      await textToSpeech(chunk.text, outputPath, voiceId);
      const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`      ✅ Saved: ${sizeKB} KB`);
      successCount++;

      // Delay to avoid rate limits
      if (i < chunksData.totalChunks - 1) {
        await sleep(DELAY_BETWEEN_REQUESTS);
      }

    } catch (error) {
      console.error(`      ❌ Error: ${error.message}`);
      errorCount++;

      // If rate limited, wait longer and retry
      if (error.message.includes('429')) {
        console.log(`      ⏳ Rate limited, waiting 5 seconds...`);
        await sleep(5000);
        i--; // Retry this chunk
        continue;
      }
    }

    console.log('');
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Success: ${successCount}/${chunksData.totalChunks}`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return { successCount, errorCount, total: chunksData.totalChunks };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node scripts/generate-chapter-audio.js <chapter-number> <lang>');
    console.log('Example: node scripts/generate-chapter-audio.js 1 en');
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

  console.log(`\n🎬 Audio Generation\n`);

  generateChapterAudio(chapterNum, lang)
    .then((result) => {
      if (result.errorCount === 0) {
        console.log('🎉 All chunks generated successfully!');
        console.log('\n➡️  Next step: node scripts/concat-chapter-audio.js ' + chapterNum + ' ' + lang);
      } else {
        console.log('⚠️  Some chunks failed. Please check errors above.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    });
}

main();
