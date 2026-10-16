/**
 * Script d'initialisation et de remplissage (seed) de la base PocketBase avec les données réelles de production.
 * Extrait les listes et cadeaux de l'export Firebase, rattache les propriétaires correspondants,
 * et insère les données de façon strictement idempotente et répétable.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const PocketBase = require('pocketbase/cjs');

// Configuration des propriétaires par défaut associés aux listes historiques
const DEFAULT_OWNERS = {
  'cadeaux-jimmy': {
    email: 'jimmy@vuidart.com',
    displayName: 'Jimmy',
  },
  deborah: {
    email: 'deborah@vuidart.com',
    displayName: 'Déborah',
  },
  'noel-2025-andy': {
    email: 'andy@vuidart.com',
    displayName: 'Andy',
  },
  '-OgCMBHS1GiKdXMdpJnK': {
    email: 'jimmy@vuidart.com',
    displayName: 'Jimmy',
  },
  'joyeux-nowel': {
    email: 'jimmy@vuidart.com',
    displayName: 'Jimmy',
  },
};

const DEFAULT_USER_PASSWORD = process.env.PB_DEFAULT_PASSWORD || 'CadeauxVuidart2026!';
const DEFAULT_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@vuidart.com';
const DEFAULT_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'AdminCadeaux2026!';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    sourcePath: path.join(__dirname, '..', 'firebase', 'mock', 'database_export', 'cadeaux-vuidart-default-rtdb.json'),
    mappingPath: path.join(__dirname, '..', 'mapping.json'),
    pbUrl: process.env.PB_URL || 'http://127.0.0.1:8090',
    adminEmail: DEFAULT_ADMIN_EMAIL,
    adminPassword: DEFAULT_ADMIN_PASSWORD,
    createUsers: args.includes('--create-users'),
    dryRun: args.includes('--dry-run'),
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--source' && args[i + 1]) options.sourcePath = args[++i];
    if (args[i] === '--mapping' && args[i + 1]) options.mappingPath = args[++i];
    if (args[i] === '--url' && args[i + 1]) options.pbUrl = args[++i];
    if (args[i] === '--admin-email' && args[i + 1]) options.adminEmail = args[++i];
    if (args[i] === '--admin-password' && args[i + 1]) options.adminPassword = args[++i];
  }

  return options;
}

/**
 * Vérifie si le serveur PocketBase répond sur /api/health.
 */
async function isServerRunning(url) {
  try {
    const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Lance temporairement le binaire PocketBase en local si le serveur n'est pas déjà actif.
 */
async function ensureServerRunning(pbUrl) {
  if (await isServerRunning(pbUrl)) {
    return null;
  }

  const binPath = path.join(__dirname, '..', 'bin', 'pocketbase');
  const dataDev = path.join(__dirname, '..', 'pb_data_dev');
  const migrationsDir = path.join(__dirname, '..', 'pb_migrations');
  const hooksDir = path.join(__dirname, '..', 'pb_hooks');

  if (!fs.existsSync(binPath)) {
    throw new Error(`Serveur non joignable sur ${pbUrl} et binaire introuvable (${binPath}). Lance d'abord npm run dev:pb.`);
  }

  console.log('Serveur PocketBase non détecté. Démarrage automatique d\'une instance locale temporaire...');
  const child = spawn(
    binPath,
    ['serve', '--http=127.0.0.1:8090', `--dir=${dataDev}`, `--migrationsDir=${migrationsDir}`, `--hooksDir=${hooksDir}`],
    { stdio: 'ignore' }
  );

  // Attente que le serveur soit prêt (max 5 secondes)
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise((r) => setTimeout(r, 250));
    if (await isServerRunning(pbUrl)) {
      console.log('Instance PocketBase temporaire prête.');
      return child;
    }
  }

  child.kill();
  throw new Error('Impossible de démarrer l\'instance PocketBase locale.');
}

async function main() {
  const opts = parseArgs();

  console.log('====================================================');
  console.log('🌱 Script de seed PocketBase avec les données de prod');
  console.log('====================================================');
  console.log(`Cible PocketBase : ${opts.pbUrl}`);
  console.log(`Source Firebase  : ${opts.sourcePath}`);
  console.log(`Mode             : ${opts.dryRun ? 'SIMULATION SEULE (--dry-run)' : 'APPLICATION RÉELLE'}`);

  if (!fs.existsSync(opts.sourcePath)) {
    console.error(`Fichier source Firebase introuvable : ${opts.sourcePath}`);
    process.exit(1);
  }

  let fileMapping = {};
  if (fs.existsSync(opts.mappingPath)) {
    try {
      fileMapping = JSON.parse(fs.readFileSync(opts.mappingPath, 'utf-8'));
      console.log(`Fichier mapping.json chargé (${Object.keys(fileMapping).length} entrées).`);
    } catch (e) {
      console.warn('Erreur de lecture de mapping.json, mapping ignoré.');
    }
  }

  const rtdbData = JSON.parse(fs.readFileSync(opts.sourcePath, 'utf-8'));
  const rawLists = rtdbData.lists || {};

  // Démarrage éventuel du serveur local
  let temporaryServer = null;
  if (!opts.dryRun) {
    temporaryServer = await ensureServerRunning(opts.pbUrl);
  }

  try {
    const pb = new PocketBase(opts.pbUrl);

    if (!opts.dryRun) {
      console.log(`Authentification superutilisateur (${opts.adminEmail})...`);
      try {
        await pb.collection('_superusers').authWithPassword(opts.adminEmail, opts.adminPassword);
        console.log('Authentification superutilisateur réussie.');
      } catch (authErr) {
        console.error('Échec d\'authentification superutilisateur :', authErr.message);
        console.error('Assure-toi que les identifiants sont corrects ou crée le superutilisateur avec :');
        console.error(`./bin/pocketbase superuser upsert ${opts.adminEmail} ${opts.adminPassword} --dir=./pb_data_dev`);
        process.exit(1);
      }
    }

    // 1. Résolution et création des propriétaires
    const userCache = new Map(); // email/nom -> userId

    if (!opts.dryRun) {
      for (const [slug, ownerDef] of Object.entries(DEFAULT_OWNERS)) {
        if (!userCache.has(ownerDef.email)) {
          let userRecord = null;
          try {
            userRecord = await pb.collection('users').getFirstListItem(`email = "${ownerDef.email}"`);
          } catch {
            if (opts.createUsers) {
              try {
                userRecord = await pb.collection('users').create({
                  email: ownerDef.email,
                  password: DEFAULT_USER_PASSWORD,
                  passwordConfirm: DEFAULT_USER_PASSWORD,
                  displayName: ownerDef.displayName,
                  emailVisibility: true,
                });
                console.log(`  ✓ Compte créé : ${ownerDef.displayName} (${ownerDef.email})`);
              } catch (createErr) {
                console.warn(`  ⚠️ Impossible de créer ${ownerDef.email} :`, createErr.message);
              }
            }
          }

          if (userRecord) {
            userCache.set(ownerDef.email, userRecord.id);
            userCache.set(ownerDef.displayName, userRecord.id);
          }
        }
      }
    }

    // 2. Traitement des listes et cadeaux
    console.log('\nTraitement des listes et cadeaux...');
    const summary = [];
    let totalGiftsCount = 0;
    let totalBoughtCount = 0;

    for (const [slug, rawList] of Object.entries(rawLists)) {
      const title = rawList.title || slug;
      const rawGifts = rawList.gifts || {};
      const giftsList = Object.entries(rawGifts).map(([srcId, g]) => ({
        sourceId: srcId,
        title: (g.title || '').trim(),
        url: (g.url || '').trim() || null,
        position: typeof g.order === 'number' ? g.order : 0,
        bought: !!g.bought,
      }));

      // Détermination du propriétaire
      let ownerId = null;
      if (fileMapping[slug]) {
        ownerId = fileMapping[slug];
      } else if (rawList.ownerId && fileMapping[rawList.ownerId]) {
        ownerId = fileMapping[rawList.ownerId];
      } else if (DEFAULT_OWNERS[slug]) {
        const ownerDef = DEFAULT_OWNERS[slug];
        ownerId = userCache.get(ownerDef.email) || null;
      }

      const boughtInList = giftsList.filter((g) => g.bought).length;
      totalGiftsCount += giftsList.length;
      totalBoughtCount += boughtInList;

      summary.push({
        slug,
        title,
        owner: ownerId ? 'Rattaché' : 'Non défini',
        giftsCount: giftsList.length,
        boughtCount: boughtInList,
      });

      if (!opts.dryRun) {
        // Insertion / mise à jour de la liste
        let listRecord = null;
        try {
          listRecord = await pb.collection('lists').getFirstListItem(`slug = "${slug}"`);
          listRecord = await pb.collection('lists').update(listRecord.id, {
            title,
            owner: ownerId || listRecord['owner'] || null,
          });
        } catch {
          listRecord = await pb.collection('lists').create({
            slug,
            title,
            owner: ownerId || null,
          });
        }

        // Nettoyage préalable des cadeaux de la liste pour garantir un seed strictement idempotent
        const existingGifts = await pb.collection('gifts').getFullList({
          filter: `list = "${listRecord.id}"`,
        });
        for (const existing of existingGifts) {
          await pb.collection('gifts').delete(existing.id);
        }

        for (const g of giftsList) {
          await pb.collection('gifts').create({
            list: listRecord.id,
            title: g.title,
            url: g.url,
            position: g.position,
            bought: g.bought,
            buyer: null,
          });
        }
      }
    }

    // Affichage du bilan
    console.log('\n====================================================');
    console.log('📊 Récapitulatif du seed');
    console.log('====================================================');
    console.table(summary);
    console.log(`Total listes  : ${summary.length}`);
    console.log(`Total cadeaux : ${totalGiftsCount}`);
    console.log(`Cadeaux achetés cochés : ${totalBoughtCount}`);

    if (opts.dryRun) {
      console.log('\nℹ️ Simulation terminée avec succès (--dry-run). Aucune modification persistée.');
    } else {
      console.log('\n✅ Base PocketBase peuplée avec succès avec les données de prod !');
    }
  } finally {
    if (temporaryServer) {
      console.log('Arrêt de l\'instance PocketBase temporaire...');
      temporaryServer.kill();
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Erreur fatale lors du seed :', err);
    process.exit(1);
  });
}

module.exports = { main, DEFAULT_OWNERS };
