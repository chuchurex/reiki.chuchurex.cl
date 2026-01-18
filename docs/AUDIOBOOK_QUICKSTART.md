# Reiki Audiobook - Quick Start Guide

## ✅ Prerequisites

1. **Node.js installed** (v14 or higher)
2. **ffmpeg installed** - Required for audio concatenation
   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   ```
3. **Environment variables** configured in `.env`:
   ```
   FISH_API_KEY=your_key_here
   FISH_VOICE_ID=your_voice_id_here
   ```

## 🚀 Quick Commands

### Build Single Chapter

```bash
# English Chapter 1
node scripts/build-reiki-audiobook.js 1 en

# Spanish Chapter 1
node scripts/build-reiki-audiobook.js 1 es
```

### Build All Chapters

```bash
# All English chapters
node scripts/build-reiki-audiobook.js all en

# All Spanish chapters
node scripts/build-reiki-audiobook.js all es
```

### Step-by-Step (Manual)

```bash
# Step 1: Prepare chunks
node scripts/prepare-audio-chunks.js 1 en

# Step 2: Generate audio
node scripts/generate-chapter-audio.js 1 en

# Step 3: Concatenate final MP3
node scripts/concat-chapter-audio.js 1 en
```

## 📁 Output Structure

```
audio/
├── en/
│   ├── ch1/
│   │   ├── chunks/              # Individual audio chunks
│   │   │   ├── ch1-chunk-000.mp3
│   │   │   ├── ch1-chunk-001.mp3
│   │   │   └── ...
│   │   ├── chunks.json          # Chunk metadata
│   │   ├── concat-list.txt      # ffmpeg concat list
│   │   └── ch1-en.mp3           # ✨ FINAL AUDIOBOOK
│   └── ...
├── es/
│   └── ...
└── silences/
    ├── silence-0.8s.mp3
    ├── silence-1.5s.mp3
    ├── silence-2.0s.mp3
    ├── silence-2.5s.mp3
    └── silence-3.0s.mp3
```

## ⚡ Pause Durations

The scripts automatically insert appropriate pauses:

- **After chapter title**: 2.0 seconds
- **Between paragraphs**: 0.8 seconds
- **After quotes**: 1.5 seconds
- **Between sections**: 2.5 seconds
- **End of chapter**: 3.0 seconds

## 🔧 Troubleshooting

### "FISH_API_KEY environment variable is required"
Add your Fish Audio API key to `.env`:
```
FISH_API_KEY=your_key_here
```

### "ffmpeg: command not found"
Install ffmpeg (see Prerequisites above)

### "Rate limited" (429 error)
The script automatically retries after 5 seconds. If it persists, reduce `DELAY_BETWEEN_REQUESTS` in `generate-chapter-audio.js`

### Missing audio chunks
Re-run the generation step:
```bash
node scripts/generate-chapter-audio.js <chapter> <lang>
```

## 💡 Tips

1. **Start with Chapter 1**: It's the shortest (~9KB)
2. **Test voice quality**: Listen to a short chapter before processing all 11
3. **Cleanup chunks**: After successful concatenation, you can delete the `chunks/` directory to save space
4. **Parallel processing**: You can run multiple chapters simultaneously in different terminals

## 📊 Estimated Costs

Fish Audio API pricing (check current rates):
- ~10,000 characters per chapter
- 11 chapters × 2 languages = 22 audiobooks
- Total: ~220,000 characters

## 🎯 Recommended Workflow

1. **Test with Chapter 1 (English)**
   ```bash
   node scripts/build-reiki-audiobook.js 1 en
   ```

2. **Listen and validate**
   - Check voice quality
   - Verify pause durations
   - Confirm naturalness

3. **Adjust if needed**
   - Edit pause durations in `prepare-audio-chunks.js`
   - Change voice ID in `.env`
   - Modify cleaning rules

4. **Process all chapters**
   ```bash
   node scripts/build-reiki-audiobook.js all en
   node scripts/build-reiki-audiobook.js all es
   ```

## 🎬 Next Steps After Generation

1. Upload audiobooks to hosting
2. Update `i18n/*/media.json` with audio URLs
3. Rebuild website to show audio controls
4. Test audio playback on the site

---

**Created**: January 2026
**Last Updated**: January 2026
