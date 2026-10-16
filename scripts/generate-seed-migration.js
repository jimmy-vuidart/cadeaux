/**
 * Générateur de migration PocketBase pour le seed des données de production.
 * Extrait les données de l'export Firebase et produit pb_migrations/1729000001_seed_prod_data.js.
 * N'intègre aucun utilisateur préconfiguré ni mot de passe par défaut pour des raisons de sécurité.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(__dirname, '..', 'firebase', 'mock', 'database_export', 'cadeaux-vuidart-default-rtdb.json');
const TARGET_MIGRATION = path.join(__dirname, '..', 'pb_migrations', '1729000001_seed_prod_data.js');

const DEFAULT_OWNERS = {
  'cadeaux-jimmy': 'jimmy@vuidart.com',
  deborah: 'deborah@vuidart.com',
  'noel-2025-andy': 'andy@vuidart.com',
  '-OgCMBHS1GiKdXMdpJnK': 'jimmy@vuidart.com',
  'joyeux-nowel': 'jimmy@vuidart.com',
};

function generateMigration() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Fichier source Firebase introuvable : ${SOURCE_PATH}`);
  }

  const rawData = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf-8'));
  const rawLists = rawData.lists || {};

  const structuredLists = [];
  let totalGifts = 0;
  let totalBought = 0;

  for (const [slug, rawList] of Object.entries(rawLists)) {
    const title = rawList.title || slug;
    const ownerEmail = DEFAULT_OWNERS[slug] || null;
    const gifts = Object.entries(rawList.gifts || {}).map(([key, g]) => {
      const isBought = !!g.bought;
      if (isBought) totalBought++;
      totalGifts++;
      return {
        title: (g.title || '').trim(),
        url: (g.url || '').trim() || null,
        position: typeof g.order === 'number' ? g.order : 0,
        bought: isBought,
      };
    });

    structuredLists.push({
      slug,
      title,
      ownerEmail,
      gifts,
    });
  }

  const migrationContent = `/**
 * Migration d'initialisation des données de production dans PocketBase.
 * Générée automatiquement depuis l'export officiel Firebase RTDB.
 * Embarque les 5 listes réelles et les 152 cadeaux (aucun utilisateur préconfiguré).
 */

migrate((app) => {
  const listsCol = app.findCollectionByNameOrId('lists');
  const giftsCol = app.findCollectionByNameOrId('gifts');

  // Données des listes et cadeaux réels
  const listsData = ${JSON.stringify(structuredLists, null, 2)};

  for (let i = 0; i < listsData.length; i++) {
    const listDef = listsData[i];

    // Résolution du propriétaire si le compte existe déjà en base
    let ownerId = null;
    if (listDef.ownerEmail) {
      try {
        const existingUser = app.findFirstRecordByFilter('users', 'email = {:email}', { email: listDef.ownerEmail });
        ownerId = existingUser.id;
      } catch {
        ownerId = null;
      }
    }

    let listRecord = null;
    try {
      listRecord = app.findFirstRecordByFilter('lists', 'slug = {:slug}', { slug: listDef.slug });
      listRecord.set('title', listDef.title);
      if (ownerId) {
        listRecord.set('owner', ownerId);
      }
      app.save(listRecord);
    } catch {
      listRecord = new Record(listsCol);
      listRecord.set('slug', listDef.slug);
      listRecord.set('title', listDef.title);
      if (ownerId) {
        listRecord.set('owner', ownerId);
      }
      app.save(listRecord);
    }

    // Nettoyage préalable des cadeaux de la liste pour garantir l'idempotence exacte
    try {
      const existingGifts = app.findRecordsByFilter('gifts', 'list = {:listId}', '', 0, 0, { listId: listRecord.id });
      for (let j = 0; j < existingGifts.length; j++) {
        app.delete(existingGifts[j]);
      }
    } catch {}

    // Insertion des cadeaux
    for (let j = 0; j < listDef.gifts.length; j++) {
      const g = listDef.gifts[j];
      const giftRecord = new Record(giftsCol);
      giftRecord.set('list', listRecord.id);
      giftRecord.set('title', g.title);
      if (g.url) {
        giftRecord.set('url', g.url);
      }
      giftRecord.set('position', g.position);
      giftRecord.set('bought', g.bought);
      app.save(giftRecord);
    }
  }
}, (app) => {
  // Rollback : suppression des listes et cadeaux de prod
  const slugs = ${JSON.stringify(structuredLists.map((l) => l.slug))};
  for (let i = 0; i < slugs.length; i++) {
    try {
      const listRecord = app.findFirstRecordByFilter('lists', 'slug = {:slug}', { slug: slugs[i] });
      app.delete(listRecord);
    } catch {}
  }
});
`;

  fs.writeFileSync(TARGET_MIGRATION, migrationContent, 'utf-8');
  console.log(`Migration générée avec succès : ${TARGET_MIGRATION}`);
  console.log(`Listes : ${structuredLists.length}, Cadeaux : ${totalGifts}, Achetés : ${totalBought}`);
  console.log('Utilisateurs préconfigurés : AUCUN (exclus pour la production).');
}

if (require.main === module) {
  generateMigration();
}

module.exports = { generateMigration };
