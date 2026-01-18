#!/usr/bin/env node

/**
 * Translate Reiki Book chapters from English to Spanish
 * Using Anthropic Claude API
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const GLOSSARY = {
  'healing': 'sanación',
  'healer': 'sanador/sanadora',
  'forgiveness': 'perdón',
  'awakening': 'despertar',
  'channel': 'canal',
  'Reiki': 'Reiki', // Keep as is
  'Jesus': 'Jesús',
  'God': 'Dios',
  'Source': 'la Fuente',
  'Infinite': 'el Infinito',
  'love': 'amor',
  'light': 'luz'
};

async function translateChapter(chapterNum) {
  const enPath = path.join(__dirname, '..', 'i18n', 'en', 'chapters', `ch${chapterNum}.json`);
  const esPath = path.join(__dirname, '..', 'i18n', 'es', 'chapters', `ch${chapterNum}.json`);

  // Load English chapter
  const enChapter = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  console.log(`\n📖 Translating Chapter ${chapterNum}: ${enChapter.title}`);

  // Create API key from environment or use a placeholder
  const apiKey = process.env.ANTHROPIC_API_KEY || 'DEMO_MODE';

  if (apiKey === 'DEMO_MODE') {
    console.log('⚠️  No ANTHROPIC_API_KEY found - skipping translation');
    return null;
  }

  const client = new Anthropic({ apiKey });

  // Prepare translation prompt
  const contentToTranslate = JSON.stringify(enChapter, null, 2);

  const prompt = `You are translating a spiritual book about Reiki and healing from English to Spanish.

GLOSSARY (use these translations consistently):
${Object.entries(GLOSSARY).map(([en, es]) => `- ${en} → ${es}`).join('\n')}

IMPORTANT INSTRUCTIONS:
1. Translate the JSON structure maintaining the exact same format
2. Translate: "title", "numberText", and all "text" fields in sections
3. Keep "id", "number", "type" fields unchanged
4. Use reverent, spiritual language appropriate for a healing/spiritual text
5. Maintain the poetic and contemplative tone of the original
6. When you see {term:...} markers, keep them exactly as they are (don't translate the term ID)
7. Keep HTML tags like <em> unchanged
8. Use formal "usted" form in Spanish

Here's the English chapter JSON to translate:

${contentToTranslate}

Return ONLY the translated JSON, no explanations.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const translatedText = message.content[0].text;

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = translatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not find JSON in response');
    }

    const translatedChapter = JSON.parse(jsonMatch[0]);

    // Save Spanish translation
    fs.writeFileSync(esPath, JSON.stringify(translatedChapter, null, 2), 'utf8');

    console.log(`   ✅ Saved: ${esPath}`);

    return translatedChapter;

  } catch (error) {
    console.error(`   ❌ Error translating chapter ${chapterNum}:`, error.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/translate-reiki.js <chapter-number>');
    console.log('Example: node scripts/translate-reiki.js 1');
    console.log('Or: node scripts/translate-reiki.js all');
    process.exit(1);
  }

  const chapterArg = args[0];

  if (chapterArg === 'all') {
    console.log('🌍 Translating all chapters...\n');
    for (let i = 1; i <= 11; i++) {
      await translateChapter(i);
      // Small delay to avoid rate limits
      if (i < 11) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    console.log('\n✨ All chapters translated!');
  } else {
    const chapterNum = parseInt(chapterArg);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 11) {
      console.error('❌ Invalid chapter number. Use 1-11 or "all"');
      process.exit(1);
    }
    await translateChapter(chapterNum);
  }
}

main().catch(console.error);
