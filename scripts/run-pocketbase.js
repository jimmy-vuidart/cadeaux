/**
 * Script de gestion et démarrage local de PocketBase pour le développement.
 * Télécharge la version requise du binaire si nécessaire et lance le serveur avec les migrations et hooks.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync, spawn } = require('child_process');

const PB_VERSION = '0.40.5';
const BIN_DIR = path.join(__dirname, '..', 'bin');
const PB_BIN = path.join(BIN_DIR, 'pocketbase');
const PB_DATA_DEV = path.join(__dirname, '..', 'pb_data_dev');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'pb_migrations');
const HOOKS_DIR = path.join(__dirname, '..', 'pb_hooks');

const ARCH_MAP = {
  x64: 'amd64',
  arm64: 'arm64',
};

function getDownloadUrl() {
  const platform = process.platform;
  const arch = ARCH_MAP[process.arch] || process.arch;
  const filename = `pocketbase_${PB_VERSION}_${platform}_${arch}.zip`;
  return `https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${filename}`;
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`Échec du téléchargement: HTTP ${response.statusCode}`));
        }
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function ensurePocketBaseBinary() {
  if (fs.existsSync(PB_BIN)) {
    return PB_BIN;
  }

  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }

  const zipPath = path.join(BIN_DIR, 'pocketbase.zip');
  const url = getDownloadUrl();
  console.log(`Téléchargement de PocketBase v${PB_VERSION} depuis ${url}...`);

  await downloadFile(url, zipPath);
  console.log('Extraction de l\'archive...');

  // Extraction via unzip (ou commande système)
  execSync(`unzip -o "${zipPath}" -d "${BIN_DIR}" pocketbase`);
  fs.unlinkSync(zipPath);
  fs.chmodSync(PB_BIN, 0o755);

  console.log('PocketBase installé dans', PB_BIN);
  return PB_BIN;
}

async function main() {
  await ensurePocketBaseBinary();

  // Création des dossiers si inexistants
  [PB_DATA_DEV, MIGRATIONS_DIR, HOOKS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const customArgs = process.argv.slice(2);
  const args =
    customArgs.length > 0
      ? customArgs
      : [
          'serve',
          '--http=127.0.0.1:8090',
          `--dir=${PB_DATA_DEV}`,
          `--migrationsDir=${MIGRATIONS_DIR}`,
          `--hooksDir=${HOOKS_DIR}`,
        ];

  console.log(`Lancement de PocketBase : ${PB_BIN} ${args.join(' ')}`);
  const child = spawn(PB_BIN, args, { stdio: 'inherit' });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Erreur lors du démarrage de PocketBase :', err);
    process.exit(1);
  });
}

module.exports = { ensurePocketBaseBinary, PB_BIN };
