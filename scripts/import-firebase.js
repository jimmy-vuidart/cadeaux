/**
 * Script d'import hors-ligne des listes et cadeaux depuis un export Firebase RTDB vers PocketBase.
 * Valide le rattachement obligatoire des propriétaires via un fichier mapping.json.
 * Répétable et idempotent, supporte les modes --dry-run (par défaut) et --apply.
 */

const fs = require('fs');
const path = require('path');
const PocketBase = require('pocketbase/cjs');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    rtdbPath: path.join(__dirname, '..', 'firebase', 'mock', 'database_export', 'cadeaux-vuidart-default-rtdb.json'),
    mappingPath: path.join(__dirname, '..', 'mapping.json'),
    pbUrl: process.env.PB_URL || 'http://127.0.0.1:8090',
    adminEmail: process.env.PB_ADMIN_EMAIL || '',
    adminPassword: process.env.PB_ADMIN_PASSWORD || '',
    apply: args.includes('--apply'),
    dryRun: !args.includes('--apply') || args.includes('--dry-run'),
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--rtdb' && args[i + 1]) options.rtdbPath = args[++i];
    if (args[i] === '--mapping' && args[i + 1]) options.mappingPath = args[++i];
    if (args[i] === '--url' && args[i + 1]) options.pbUrl = args[++i];
    if (args[i] === '--admin-email' && args[i + 1]) options.adminEmail = args[++i];
    if (args[i] === '--admin-password' && args[i + 1]) options.adminPassword = args[++i];
  }

  return options;
}

function normalizeSlug(rawKey, title) {
  // Si la clé Firebase commence par '-' (pushId aléatoire), on normalise depuis le titre
  if (rawKey.startsWith('-')) {
    const stem = (title || 'liste')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]+/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
    return stem || 'liste';
  }
  return rawKey;
}

async function main() {
  const opts = parseArgs();

  console.log('--- Début du script d\'import Firebase -> PocketBase ---');
  console.log(`Mode : ${opts.apply ? 'APPLICATION RÉELLE (--apply)' : 'SIMULATION (--dry-run)'}`);
  console.log(`Source RTDB : ${opts.rtdbPath}`);
  console.log(`Mapping propriétaires : ${opts.mappingPath}`);

  if (!fs.existsSync(opts.rtdbPath)) {
    console.error(`Fichier RTDB introuvable : ${opts.rtdbPath}`);
    process.exit(1);
  }

  let mapping = {};
  if (fs.existsSync(opts.mappingPath)) {
    mapping = JSON.parse(fs.readFileSync(opts.mappingPath, 'utf-8'));
  } else {
    console.warn(`Attention : fichier de mapping introuvable (${opts.mappingPath}), mapping vide utilisé.`);
  }

  const rtdbData = JSON.parse(fs.readFileSync(opts.rtdbPath, 'utf-8'));
  const rawLists = rtdbData.lists || {};

  const stats = {
    totalLists: 0,
    totalGifts: 0,
    boughtGifts: 0,
    missingOwners: [],
    processedLists: 0,
    processedGifts: 0,
  };

  const listsToImport = [];

  for (const [listKey, listVal] of Object.entries(rawLists)) {
    stats.totalLists++;
    const title = listVal.title || 'Liste sans titre';
    const slug = normalizeSlug(listKey, title);
    const rawOwnerId = listVal.ownerId || null;

    let pbOwnerId = null;
    if (rawOwnerId) {
      if (mapping[rawOwnerId]) {
        pbOwnerId = mapping[rawOwnerId];
      } else {
        stats.missingOwners.push({ listKey, slug, title, rawOwnerId });
      }
    } else {
      // Pour une liste sans ownerId explicite dans l'export, on vérifie si la clé de liste est mappée
      if (mapping[listKey]) {
        pbOwnerId = mapping[listKey];
      }
    }

    const gifts = [];
    const rawGifts = listVal.gifts || {};
    for (const [giftKey, giftVal] of Object.entries(rawGifts)) {
      stats.totalGifts++;
      const isBought = !!giftVal.bought;
      if (isBought) stats.boughtGifts++;

      gifts.push({
        sourceId: giftKey,
        title: (giftVal.title || '').trim(),
        url: giftVal.url || null,
        position: typeof giftVal.order === 'number' ? giftVal.order : 0,
        bought: isBought,
      });
    }

    listsToImport.push({
      sourceKey: listKey,
      slug,
      title,
      ownerId: pbOwnerId,
      rawOwnerId,
      gifts,
    });
  }

  console.log('\n--- Bilan de l\'analyse préalable ---');
  console.log(`Listes identifiées : ${stats.totalLists}`);
  console.log(`Cadeaux identifiés : ${stats.totalGifts}`);
  console.log(`Cadeaux marqués achetés : ${stats.boughtGifts}`);

  if (stats.missingOwners.length > 0) {
    console.error(`\nErreur bloquante : ${stats.missingOwners.length} liste(s) ont un propriétaire Firebase non mappé dans ${opts.mappingPath} :`);
    stats.missingOwners.forEach((m) => {
      console.error(`  - [${m.slug}] "${m.title}" -> UID Firebase : ${m.rawOwnerId}`);
    });
    if (opts.apply) {
      console.error('L\'import en mode --apply est refusé tant que tous les propriétaires ne sont pas résolus.');
      process.exit(1);
    }
  } else {
    console.log('Tous les propriétaires déclarés sont correctement mappés ou aucun n\'est manquant.');
  }

  if (opts.dryRun) {
    console.log('\nSimulation terminée (--dry-run). Aucune écriture n\'a été effectuée dans PocketBase.');
    return;
  }

  // Exécution réelle en mode --apply
  console.log(`\nConnexion à PocketBase (${opts.pbUrl})...`);
  const pb = new PocketBase(opts.pbUrl);

  if (opts.adminEmail && opts.adminPassword) {
    await pb.collection('_superusers').authWithPassword(opts.adminEmail, opts.adminPassword);
    console.log('Authentifié en tant que superutilisateur.');
  }

  for (const item of listsToImport) {
    let listRecord;
    try {
      listRecord = await pb.collection('lists').getFirstListItem(`slug = "${item.slug}"`);
      // Mise à jour si existante
      listRecord = await pb.collection('lists').update(listRecord.id, {
        title: item.title,
        owner: item.ownerId || listRecord['owner'] || null,
      });
    } catch {
      // Création
      listRecord = await pb.collection('lists').create({
        slug: item.slug,
        title: item.title,
        owner: item.ownerId || null,
      });
    }
    stats.processedLists++;

    for (const g of item.gifts) {
      try {
        const existingGift = await pb
          .collection('gifts')
          .getFirstListItem(`list = "${listRecord.id}" && title = "${g.title.replace(/"/g, '\\"')}"`)
          .catch(() => null);

        if (existingGift) {
          await pb.collection('gifts').update(existingGift.id, {
            url: g.url,
            position: g.position,
            bought: g.bought,
          });
        } else {
          await pb.collection('gifts').create({
            list: listRecord.id,
            title: g.title,
            url: g.url,
            position: g.position,
            bought: g.bought,
            buyer: null, // Pas d'acheteur historique migré
          });
        }
        stats.processedGifts++;
      } catch (err) {
        console.error(`Erreur import cadeau "${g.title}" dans liste [${item.slug}] :`, err.message);
      }
    }
  }

  console.log('\n--- Rapport d\'importation terminé ---');
  console.log(`Listes traitées : ${stats.processedLists}`);
  console.log(`Cadeaux traités : ${stats.processedGifts}`);
}

main().catch((err) => {
  console.error('Erreur fatale lors de l\'importation :', err);
  process.exit(1);
});
