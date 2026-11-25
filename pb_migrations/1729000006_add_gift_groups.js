/**
 * Migration PocketBase ajoutant la gestion des groupes (catégories) de cadeaux.
 * Crée la collection gift_groups et ajoute la relation optionnelle group sur gifts.
 */

migrate((app) => {
  const lists = app.findCollectionByNameOrId('lists');
  const gifts = app.findCollectionByNameOrId('gifts');

  // 1. Création de la collection gift_groups
  let giftGroups;
  try {
    giftGroups = app.findCollectionByNameOrId('gift_groups');
  } catch {
    giftGroups = new Collection({
      name: 'gift_groups',
      type: 'base',
    });
    giftGroups.fields.add(new RelationField({
      name: 'list',
      collectionId: lists.id,
      maxSelect: 1,
      cascadeDelete: true,
      required: true,
    }));
    giftGroups.fields.add(new TextField({ name: 'name', required: true, min: 1, max: 120 }));
    giftGroups.fields.add(new NumberField({ name: 'position', required: false, defaultValue: 0 }));
    giftGroups.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }));
    giftGroups.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }));
    giftGroups.listRule = '';
    giftGroups.viewRule = '';
    giftGroups.createRule = '@request.auth.id != "" && list.owner = @request.auth.id';
    giftGroups.updateRule = '@request.auth.id != "" && list.owner = @request.auth.id';
    giftGroups.deleteRule = '@request.auth.id != "" && list.owner = @request.auth.id';
    giftGroups.indexes = ['CREATE INDEX idx_gift_groups_list ON gift_groups (list)'];
    app.save(giftGroups);
  }

  // 2. Ajout de la relation optionnelle group sur gifts (détachement sans suppression en cascade)
  if (!gifts.fields.getByName('group')) {
    gifts.fields.add(new RelationField({
      name: 'group',
      collectionId: giftGroups.id,
      maxSelect: 1,
      cascadeDelete: false,
      required: false,
    }));
  }

  gifts.createRule = '@request.auth.id != "" && list.owner = @request.auth.id && (group = "" || group.list = list)';
  gifts.updateRule = '@request.auth.id != "" && list.owner = @request.auth.id && (group = "" || group.list = list)';

  const existingIndexes = Array.isArray(gifts.indexes) ? [...gifts.indexes] : [];
  if (!existingIndexes.some((idx) => idx.includes('idx_gifts_group'))) {
    existingIndexes.push('CREATE INDEX idx_gifts_group ON gifts (group)');
    gifts.indexes = existingIndexes;
  }

  app.save(gifts);
}, (app) => {
  // Rollback : retrait du champ group sur gifts puis suppression de gift_groups
  try {
    const gifts = app.findCollectionByNameOrId('gifts');
    gifts.fields.removeByName('group');
    gifts.createRule = '@request.auth.id != "" && list.owner = @request.auth.id';
    gifts.updateRule = '@request.auth.id != "" && list.owner = @request.auth.id';
    gifts.indexes = (gifts.indexes || []).filter((idx) => !idx.includes('idx_gifts_group'));
    app.save(gifts);
  } catch {}

  try {
    const giftGroups = app.findCollectionByNameOrId('gift_groups');
    app.delete(giftGroups);
  } catch {}
});
