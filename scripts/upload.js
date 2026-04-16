/**
 * PKV-ANGESTELLT — FTP Upload (Inkrementell)
 * ============================================
 * Lädt nur GEÄNDERTE Dateien per FTP hoch.
 * Vergleicht MD5-Hash des Dateiinhalts (nicht Dateigröße!).
 * Löscht automatisch Dateien auf dem Server, die lokal nicht mehr existieren.
 *
 * STANDARD:  Upload auf TEST-Umgebung (test.angestellt-pkv.de)
 * LIVE:      Nur mit explizitem Flag: node scripts/upload.js --live
 * FULL:      Alles neu hochladen:     node scripts/upload.js --full
 * DRY-RUN:   Nur anzeigen was passiert: node scripts/upload.js --dry-run
 * NO-DELETE: Löschen überspringen:    node scripts/upload.js --no-delete
 *
 * SICHERHEIT:
 * - Liest Zugangsdaten NUR aus config.json
 * - Loggt keine Passwörter
 * - Lädt NUR den dist/ Ordner hoch
 * - Erstellt ein Upload-Log
 * - LIVE-Deploy nur mit --live Flag + Bestätigung
 * - Löschen > DELETE_LIMIT braucht Bestätigung
 */

import { Client } from "basic-ftp";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG = JSON.parse(
  fs.readFileSync(path.join(__dirname, "config.json"), "utf-8")
);

const configuredRoot = CONFIG.project.rootDir;
const scriptRoot = path.resolve(__dirname, "..");
const rootDir = (configuredRoot && fs.existsSync(configuredRoot)) ? configuredRoot : scriptRoot;
const distDir = path.join(rootDir, CONFIG.project.distDir);
const logFile = path.join(__dirname, "upload.log");
const manifestFile = path.join(__dirname, `.upload-manifest-${process.argv.includes("--live") ? "live" : "test"}.json`);

const isLive = process.argv.includes("--live");
const isFull = process.argv.includes("--full");
const isDryRun = process.argv.includes("--dry-run");
const noDelete = process.argv.includes("--no-delete");
const DELETE_LIMIT = 50;
const targetName = isLive ? "live" : CONFIG.ftp.defaultTarget || "test";
const target = CONFIG.ftp.targets[targetName];

if (!target) {
  console.log(`\n  [FEHLER] Unbekanntes Target: ${targetName}`);
  process.exit(1);
}

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${targetName.toUpperCase()}] ${msg}`;
  console.log(`  ${msg}`);
  fs.appendFileSync(logFile, line + "\n");
}

function askConfirmation(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim());
    });
  });
}

function fileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("md5").update(content).digest("hex");
}

function getAllFiles(dir, base = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, base));
    } else {
      const relativePath = path.relative(base, fullPath).replace(/\\/g, '/');
      const stat = fs.statSync(fullPath);
      results.push({
        localPath: fullPath,
        remotePath: relativePath,
        size: stat.size,
        hash: fileHash(fullPath),
      });
    }
  }
  return results;
}

function loadManifest() {
  try { return JSON.parse(fs.readFileSync(manifestFile, "utf-8")); } catch { return {}; }
}

function saveManifest(manifest) {
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
}

async function upload() {
  const client = new Client(60000);
  client.ftp.verbose = false;

  if (CONFIG.ftp.host === "HIER_EINTRAGEN" || CONFIG.ftp.user === "HIER_EINTRAGEN") {
    console.log("\n  [FEHLER] FTP-Zugangsdaten nicht konfiguriert!");
    console.log("  Bitte scripts/config.json bearbeiten und FTP-Daten eintragen.");
    process.exit(1);
  }

  if (isLive) {
    console.log("\n  ========================================");
    console.log("  ACHTUNG: LIVE-DEPLOY auf angestellt-pkv.de!");
    console.log("  ========================================");
    console.log("  Das überschreibt die aktuelle Live-Seite.\n");
    const answer = await askConfirmation("  Wirklich auf LIVE deployen? (ja/nein): ");
    if (answer !== "ja") {
      console.log("\n  Abgebrochen. Kein Upload durchgeführt.");
      process.exit(0);
    }
  }

  console.log(`\n  ► Ziel: ${target.description}`);
  console.log(`  ► Pfad: ${target.remotePath}`);
  console.log(`  ► Modus: ${isDryRun ? "DRY-RUN (keine Änderungen)" : isFull ? "VOLLSTÄNDIG (alle Dateien)" : "INKREMENTELL (nur Änderungen)"}`);
  if (noDelete) console.log(`  ► Löschen: DEAKTIVIERT (--no-delete)`);
  console.log("");

  try {
    log("Verbinde mit FTP-Server...");
    await client.access({
      host: CONFIG.ftp.host,
      user: CONFIG.ftp.user,
      password: CONFIG.ftp.password,
      port: CONFIG.ftp.port || 21,
      secure: false,
    });

    log(`Verbunden mit ${CONFIG.ftp.host}`);
    log(`Zielverzeichnis: ${target.remotePath}`);

    await client.ensureDir(target.remotePath);

    const allFiles = getAllFiles(distDir);
    log(`${allFiles.length} Dateien in dist/ gefunden`);

    if (isFull) {
      log("Starte vollständigen Upload...");
      client.trackProgress(info => {
        if (info.bytes > 0) {
          process.stdout.write(`\r  Übertrage: ${info.name} (${Math.round(info.bytes / 1024)} KB)`);
        }
      });
      await client.uploadFromDir(distDir);
      client.trackProgress();
      console.log("");

      const manifest = {};
      for (const f of allFiles) manifest[f.remotePath] = f.hash;
      saveManifest(manifest);
    } else {
      const oldManifest = loadManifest();
      const newManifest = {};
      const toUpload = [];

      for (const f of allFiles) {
        newManifest[f.remotePath] = f.hash;
        if (oldManifest[f.remotePath] !== f.hash) toUpload.push(f);
      }

      const toDelete = [];
      for (const remotePath of Object.keys(oldManifest)) {
        if (!(remotePath in newManifest)) toDelete.push(remotePath);
      }

      if (toDelete.length > 0 && !noDelete) {
        log(`\n  ── LÖSCHVORSCHAU ──────────────────────────────`);
        log(`${toDelete.length} Dateien auf dem Server, die lokal nicht mehr existieren:`);

        const byExt = {};
        for (const f of toDelete) {
          const ext = path.extname(f).toLowerCase() || '(kein Suffix)';
          byExt[ext] = (byExt[ext] || 0) + 1;
        }
        for (const [ext, count] of Object.entries(byExt).sort((a, b) => b[1] - a[1])) {
          log(`  ${ext}: ${count} Dateien`);
        }

        const preview = toDelete.slice(0, 10);
        log(`\n  Beispiele (erste ${Math.min(10, toDelete.length)}):`);
        for (const f of preview) log(`    ✕ ${f}`);
        if (toDelete.length > 10) log(`    ... und ${toDelete.length - 10} weitere`);
        log(`  ────────────────────────────────────────────────`);

        if (isDryRun) {
          log(`DRY-RUN: ${toDelete.length} Dateien WÜRDEN gelöscht werden. Keine Aktion.`);
        } else {
          let proceedWithDelete = true;
          if (toDelete.length > DELETE_LIMIT) {
            console.log(`\n  ⚠  ACHTUNG: ${toDelete.length} Dateien sollen gelöscht werden (Limit: ${DELETE_LIMIT})`);
            const answer = await askConfirmation(`  Wirklich ${toDelete.length} Dateien vom Server löschen? (ja/nein): `);
            proceedWithDelete = answer === "ja";
          }

          if (proceedWithDelete) {
            let deleted = 0;
            let errors = 0;
            for (const remotePath of toDelete) {
              deleted++;
              const remoteFull = target.remotePath + '/' + remotePath;
              try {
                process.stdout.write(`\r  Lösche [${deleted}/${toDelete.length}] ${remotePath}  `);
                await client.remove(remoteFull);
              } catch (err) {
                if (!err.message.includes('550')) {
                  errors++;
                  log(`Warnung beim Löschen von ${remotePath}: ${err.message}`);
                }
              }
            }
            console.log("");
            log(`${deleted} Dateien gelöscht${errors > 0 ? ` (${errors} Fehler)` : ''}`);
          } else {
            log("Löschen abgebrochen durch Benutzer. Dateien bleiben auf dem Server.");
          }
        }
      } else if (toDelete.length > 0 && noDelete) {
        log(`${toDelete.length} Dateien wären zu löschen — übersprungen (--no-delete)`);
      }

      if (toUpload.length === 0 && toDelete.length === 0) {
        log("Keine Änderungen erkannt — nichts hochzuladen oder zu löschen!");
      } else if (toUpload.length === 0) {
        log("Keine neuen/geänderten Dateien — nur Löschungen durchgeführt.");
      } else if (isDryRun) {
        const totalSize = toUpload.reduce((sum, f) => sum + f.size, 0);
        log(`DRY-RUN: ${toUpload.length} Dateien (${Math.round(totalSize / 1024)} KB) WÜRDEN hochgeladen.`);
      } else {
        const totalSize = toUpload.reduce((sum, f) => sum + f.size, 0);
        log(`${toUpload.length} geänderte Dateien (${Math.round(totalSize / 1024)} KB)`);

        let uploaded = 0;
        for (const f of toUpload) {
          uploaded++;
          const remoteFull = target.remotePath + '/' + f.remotePath;
          const remoteDir = path.posix.dirname(remoteFull);

          await client.ensureDir(remoteDir);
          await client.cd(target.remotePath);

          process.stdout.write(`\r  [${uploaded}/${toUpload.length}] ${f.remotePath} (${Math.round(f.size / 1024)} KB)  `);
          try {
            await client.uploadFrom(f.localPath, remoteFull);
          } catch (uploadErr) {
            if (uploadErr.code === 'ENOENT') {
              log(`\n  WARNUNG: ${f.remotePath} lokal nicht gefunden — übersprungen`);
              delete newManifest[f.remotePath];
              continue;
            }
            throw uploadErr;
          }
        }
        console.log("");
      }

      // Manifest NIEMALS im Dry-Run speichern — sonst denkt der nächste Live-Run
      // fälschlich, die Dateien wären schon hochgeladen.
      if (!isDryRun) {
        saveManifest(newManifest);
      }
    }

    log("Upload abgeschlossen!");

    if (!isLive) {
      console.log(`\n  ✓ Test-Upload fertig!`);
      console.log(`  → Prüfe: http://test.angestellt-pkv.de`);
      console.log(`  → Für LIVE: node scripts/upload.js --live\n`);
    } else {
      console.log(`\n  ✓ LIVE-Upload fertig!`);
      console.log(`  → Prüfe: https://angestellt-pkv.de\n`);
    }
  } catch (err) {
    log(`FEHLER: ${err.message}`);
    process.exit(1);
  } finally {
    client.close();
  }
}

upload();
