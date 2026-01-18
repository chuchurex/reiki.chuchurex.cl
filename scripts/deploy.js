require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

async function deploy() {
    // Check for required environment variables
    if (!process.env.UPLOAD_HOST || !process.env.UPLOAD_USER || !process.env.UPLOAD_PASS || !process.env.UPLOAD_PORT) {
        console.error("❌ Error: Missing SSH credentials in .env file.");
        console.error("Please ensure UPLOAD_HOST, UPLOAD_USER, UPLOAD_PASS, and UPLOAD_PORT are set.");
        process.exit(1);
    }

    const host = process.env.UPLOAD_HOST;
    const port = process.env.UPLOAD_PORT;
    const user = process.env.UPLOAD_USER;
    const password = process.env.UPLOAD_PASS;
    // Remote directory - Edita según tu configuración de hosting
    // Ejemplos:
    // - Hostinger: "domains/tu-dominio.com/public_html/"
    // - VPS: "/var/www/html/"
    // - Subdirectorio: "domains/tu-dominio.com/public_html/mi-libro/"
    const remoteDir = process.env.REMOTE_DIR || "/var/www/html/";
    const localDir = path.join(__dirname, "../dist/");

    console.log(`🚀 Deploying via rsync over SSH...`);
    console.log(`📂 Local:  ${localDir}`);
    console.log(`📂 Remote: ${user}@${host}:${remoteDir}`);

    try {
        // Use rsync with SSH and sshpass for authentication
        const rsyncCmd = `sshpass -p "${password}" rsync -avz --delete -e "ssh -p ${port} -o StrictHostKeyChecking=no" ${localDir} ${user}@${host}:${remoteDir}`;

        console.log(`\n⚡ Syncing files...`);
        execSync(rsyncCmd, { stdio: 'inherit' });

        // Fix permissions for all HTML files
        console.log(`\n🔧 Setting correct permissions...`);
        const chmodCmd = `sshpass -p "${password}" ssh -p ${port} -o StrictHostKeyChecking=no ${user}@${host} "chmod -R 644 ${remoteDir}*.html ${remoteDir}*/*.html 2>/dev/null || true"`;
        execSync(chmodCmd, { stdio: 'inherit' });

        console.log("\n✅ Deployment complete!");
    } catch(err) {
        console.error("❌ Deployment failed:", err.message);
        process.exit(1);
    }
}

deploy();
