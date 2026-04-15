// FTP-Upload für PKV-Angestellt
// Nutzung:
//   node scripts/upload.js           -> Test-Deploy (FTP_REMOTE_TEST)
//   node scripts/upload.js --live    -> Live-Deploy (nur mit expliziter Freigabe)
//
// Erwartete .env-Variablen:
//   FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_PORT (optional, default 21)
//   FTP_REMOTE_TEST  z. B. /test.pkv-angestellt.de/
//   FTP_REMOTE_LIVE  z. B. /pkv-angestellt.de/
//   FTP_SECURE       optional 'true' für FTPS
import 'dotenv/config';
import { Client } from 'basic-ftp';
import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const LIVE = process.argv.includes('--live');
const MODE = LIVE ? 'LIVE' : 'TEST';
const REMOTE = LIVE ? process.env.FTP_REMOTE_LIVE : process.env.FTP_REMOTE_TEST;

function fail(msg) {
  console.error(`\n[upload] ${msg}\n`);
  process.exit(1);
}

if (!fs.existsSync(DIST)) fail('dist/ fehlt — vorher `npm run build` laufen lassen.');
if (!process.env.FTP_HOST) fail('FTP_HOST fehlt in .env');
if (!process.env.FTP_USER) fail('FTP_USER fehlt in .env');
if (!process.env.FTP_PASSWORD) fail('FTP_PASSWORD fehlt in .env');
if (!REMOTE) fail(`FTP_REMOTE_${MODE} fehlt in .env`);

if (LIVE) {
  console.log('\n[upload] LIVE-DEPLOY ausgewählt.');
  console.log('[upload] Nur mit expliziter Freigabe fortfahren. In 5s startet der Upload...');
  await new Promise((r) => setTimeout(r, 5000));
}

const client = new Client(30_000);
client.ftp.verbose = false;
try {
  await client.access({
    host: process.env.FTP_HOST,
    port: Number(process.env.FTP_PORT || 21),
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: process.env.FTP_SECURE === 'true'
  });
  console.log(`[upload] Verbunden. Ziel: ${REMOTE} (${MODE})`);
  await client.ensureDir(REMOTE);
  await client.clearWorkingDir();
  await client.uploadFromDir(DIST);
  console.log(`[upload] Fertig. ${MODE}-Upload nach ${REMOTE} abgeschlossen.`);
} catch (e) {
  fail(`Fehler: ${e.message}`);
} finally {
  client.close();
}
