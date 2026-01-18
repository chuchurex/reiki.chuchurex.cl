#!/usr/bin/env node

/**
 * Media Update Publisher
 *
 * Rebuilds the site and publishes changes when media.json files are updated.
 *
 * IMPORTANT: After significant changes, update private-context.md with:
 * - New media uploaded
 * - Progress updates
 * - Any relevant notes
 *
 * Usage:
 *   npm run publish:media
 *   node scripts/publish-media.js
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function run(cmd, options = {}) {
  console.log(`\n🔧 ${cmd}`);
  try {
    execSync(cmd, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      ...options
    });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${cmd}`);
    return false;
  }
}

async function main() {
  require('dotenv').config({ path: path.join(ROOT_DIR, '.env') });
  console.log('\n📦 Media Update Publisher\n');
  console.log('='.repeat(50));

  // Step 1: Build the site
  console.log('\n📖 Step 1: Building site...');
  if (!run('npm run build')) {
    process.exit(1);
  }

  // Step 2: Git add, commit, and push
  console.log('\n📝 Step 2: Committing to Git...');

  // Check if there are changes
  try {
    const status = execSync('git status --porcelain', { cwd: ROOT_DIR, encoding: 'utf8' });

    if (status.trim()) {
      run('git add -A');

      const date = new Date().toISOString().split('T')[0];
      const commitMsg = `content: update media ${date}`;

      run(`git commit -m "${commitMsg}"`);
      run('git push');
      console.log('✅ Git push complete');
    } else {
      console.log('ℹ️  No changes to commit');
    }
  } catch (error) {
    console.log('ℹ️  Git operations skipped');
  }

  // Step 3: Deployment via SSH/rsync (Hostinger)
  console.log('\n🚀 Step 3: Deploying static assets via SSH/rsync...');

  const { UPLOAD_HOST, UPLOAD_PORT, UPLOAD_USER, UPLOAD_PASS, UPLOAD_DIR } = process.env;

  if (!UPLOAD_HOST || !UPLOAD_USER || !UPLOAD_PASS) {
    console.error('❌ Error: Missing SSH/Upload credentials in .env');
    process.exit(1);
  }

  // Ensure remote directory exists
  const mkdirCmd = `sshpass -p '${UPLOAD_PASS}' ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=no ${UPLOAD_USER}@${UPLOAD_HOST} "mkdir -p ${UPLOAD_DIR}"`;
  if (!run(mkdirCmd)) {
    console.error('❌ Failed to create remote directory');
    process.exit(1);
  }

  // Rsync books/
  const localBooks = path.join(ROOT_DIR, 'books/');
  if (require('fs').existsSync(localBooks)) {
    console.log('📤 Uploading books/...');
    const rsyncBooks = `sshpass -p '${UPLOAD_PASS}' rsync -avz -e "ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=no" ${localBooks} ${UPLOAD_USER}@${UPLOAD_HOST}:${UPLOAD_DIR}/books/`;
    run(rsyncBooks);
  }

  // Rsync audiobook/
  const localAudio = path.join(ROOT_DIR, 'audiobook/');
  if (require('fs').existsSync(localAudio)) {
    console.log('📤 Uploading audiobook/...');
    const rsyncAudio = `sshpass -p '${UPLOAD_PASS}' rsync -avz -e "ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=no" ${localAudio} ${UPLOAD_USER}@${UPLOAD_HOST}:${UPLOAD_DIR}/audiobook/`;
    run(rsyncAudio);
  }

  // Rsync dist/pdf/
  const localPdf = path.join(DIST_DIR, 'pdf/');
  if (require('fs').existsSync(localPdf)) {
    console.log('📤 Uploading dist/pdf/...');
    const rsyncPdf = `sshpass -p '${UPLOAD_PASS}' rsync -avz -e "ssh -p ${UPLOAD_PORT} -o StrictHostKeyChecking=no" ${localPdf} ${UPLOAD_USER}@${UPLOAD_HOST}:${UPLOAD_DIR}/pdf/`;
    run(rsyncPdf);
  }

  console.log('✅ SSH/rsync deployment complete');

  console.log('\n' + '='.repeat(50));
  console.log('✨ Media update published successfully!');
  console.log('\n💡 Reminder: Update private-context.md if needed\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
