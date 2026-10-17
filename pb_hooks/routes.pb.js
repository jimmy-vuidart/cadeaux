/**
 * Points d'entrée HTTP personnalisés PocketBase pour les listes de cadeaux.
 * Gère la consultation publique enrichie, la création de slug sans collision,
 * la coche/décoche sécurisée et le réordonnancement atomique.
 */

// 1. Consultation publique d'une liste par son slug ou son identifiant avec cadeaux et résolution du nom de l'acheteur
routerAdd('GET', '/api/custom/lists/{slug}', (e) => {
  const slugOrId = e.request.pathValue('slug');
  if (!slugOrId) {
    throw new BadRequestError('Identifiant ou slug manquant');
  }

  let listRecord;
  try {
    listRecord = $app.findFirstRecordByFilter('lists', 'slug = {:slugOrId} || id = {:slugOrId}', { slugOrId });
  } catch (err) {
    throw new NotFoundError('Liste introuvable');
  }

  // Récupération des cadeaux associés triés par position
  const giftRecords = $app.findRecordsByFilter(
    'gifts',
    'list = {:listId}',
    'position',
    0,
    0,
    { listId: listRecord.id }
  );

  const gifts = giftRecords.map((g) => {
    let buyerName = null;
    const buyerId = g.get('buyer');
    if (g.get('bought') && buyerId) {
      try {
        const buyer = $app.findRecordById('users', buyerId);
        buyerName = buyer.get('displayName') || buyer.get('name') || null;
      } catch (err) {
        buyerName = null;
      }
    }

    return {
      id: g.id,
      list: g.get('list'),
      title: g.get('title'),
      url: g.get('url') || null,
      position: g.get('position'),
      bought: g.get('bought'),
      buyer: buyerId || null,
      buyerName: buyerName,
      created: g.get('created'),
      updated: g.get('updated'),
    };
  });

  return e.json(200, {
    list: {
      id: listRecord.id,
      title: listRecord.get('title'),
      slug: listRecord.get('slug'),
      owner: listRecord.get('owner'),
      created: listRecord.get('created'),
      updated: listRecord.get('updated'),
    },
    gifts: gifts,
  });
});

// 2. Création authentifiée d'une liste avec génération atomique de slug kebab-case unique
routerAdd('POST', '/api/custom/lists', (e) => {
  const authRecord = e.auth;
  if (!authRecord) {
    throw new UnauthorizedError('Authentification requise');
  }

  const data = e.requestInfo().body || {};
  const rawTitle = (data.title || '').trim();
  if (!rawTitle) {
    throw new BadRequestError('Le titre de la liste est requis');
  }

  // Normalisation kebab-case du slug
  let stem = rawTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]+/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!stem) {
    stem = 'liste';
  }

  // Recherche d'un slug disponible avec suffixe numérique
  let candidate = stem;
  let counter = 1;

  while (true) {
    try {
      $app.findFirstRecordByFilter('lists', 'slug = {:slug}', { slug: candidate });
      // S'il existe, on incrémente le suffixe
      counter++;
      candidate = `${stem}-${counter}`;
    } catch (err) {
      // Introuvable => le slug est libre
      break;
    }
  }

  const listsCollection = $app.findCollectionByNameOrId('lists');
  const record = new Record(listsCollection);
  record.set('title', rawTitle);
  record.set('slug', candidate);
  record.set('owner', authRecord.id);

  $app.save(record);

  return e.json(200, {
    id: record.id,
    title: record.get('title'),
    slug: record.get('slug'),
    owner: record.get('owner'),
  });
}, $apis.requireAuth());

// 3. Modification publique limitée à la coche/décoche d'un cadeau
routerAdd('POST', '/api/custom/gifts/{id}/toggle', (e) => {
  const giftId = e.request.pathValue('id');
  if (!giftId) {
    throw new BadRequestError('Identifiant de cadeau manquant');
  }

  let giftRecord;
  try {
    giftRecord = $app.findRecordById('gifts', giftId);
  } catch (err) {
    throw new NotFoundError('Cadeau introuvable');
  }

  const data = e.requestInfo().body || {};
  // Si le booléen bought est spécifié, on l'utilise, sinon on inverse l'état existant
  const newBoughtState = typeof data.bought === 'boolean' ? data.bought : !giftRecord.get('bought');

  giftRecord.set('bought', newBoughtState);

  if (newBoughtState) {
    // Si l'utilisateur est connecté, on associe son ID, sinon coche anonyme (buyer = null)
    if (e.auth) {
      giftRecord.set('buyer', e.auth.id);
    } else {
      giftRecord.set('buyer', null);
    }
  } else {
    // Lors d'une décoche, on efface systématiquement l'acheteur
    giftRecord.set('buyer', null);
  }

  $app.save(giftRecord);

  // Résolution du nom d'acheteur éventuel pour la réponse
  let buyerName = null;
  const buyerId = giftRecord.get('buyer');
  if (newBoughtState && buyerId) {
    try {
      const buyer = $app.findRecordById('users', buyerId);
      buyerName = buyer.get('displayName') || buyer.get('name') || null;
    } catch (err) {
      buyerName = null;
    }
  }

  return e.json(200, {
    id: giftRecord.id,
    bought: giftRecord.get('bought'),
    buyer: buyerId,
    buyerName: buyerName,
  });
});

// 4. Réordonnancement atomique réservé au propriétaire de la liste
routerAdd('POST', '/api/custom/lists/{id}/reorder', (e) => {
  const authRecord = e.auth;
  if (!authRecord) {
    throw new UnauthorizedError('Authentification requise');
  }

  const listId = e.request.pathValue('id');
  if (!listId) {
    throw new BadRequestError('Identifiant de liste manquant');
  }

  let listRecord;
  try {
    listRecord = $app.findFirstRecordByFilter('lists', 'id = {:id} || slug = {:id}', { id: listId });
  } catch (err) {
    throw new NotFoundError('Liste introuvable');
  }

  if (listRecord.get('owner') !== authRecord.id) {
    throw new ForbiddenError('Action réservée au propriétaire de la liste');
  }

  const data = e.requestInfo().body || {};
  const orderedIds = data.orderedIds;
  if (!Array.isArray(orderedIds)) {
    throw new BadRequestError('orderedIds doit être un tableau');
  }

  // Mise à jour de chaque position sous transaction SQLite
  $app.runInTransaction((txApp) => {
    for (let i = 0; i < orderedIds.length; i++) {
      const gId = orderedIds[i];
      try {
        const gift = txApp.findRecordById('gifts', gId);
        if (gift.get('list') === listRecord.id) {
          gift.set('position', i);
          txApp.save(gift);
        }
      } catch (err) {
        // Ignorer si le cadeau n'existe plus
      }
    }
  });

  return e.json(200, { success: true });
}, $apis.requireAuth());
