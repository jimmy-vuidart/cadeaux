/**
 * Migration d'initialisation du schéma PocketBase.
 * Crée les collections : users (enrichissement), lists, gifts, et visits.
 */

migrate((app) => {
  // 1. Enrichir la collection d'authentification users avec le champ displayName si absent
  const users = app.findCollectionByNameOrId('users');
  if (!users.fields.getByName('displayName')) {
    users.fields.add(
      new TextField({
        name: 'displayName',
        required: false,
      }),
    );
    app.save(users);
  }

  // 2. Collection des listes de cadeaux
  const lists = new Collection({
    name: 'lists',
    type: 'base',
  });
  lists.fields.add(new TextField({ name: 'title', required: true, min: 1, max: 200 }));
  lists.fields.add(new TextField({ name: 'slug', required: true, min: 1, max: 200 }));
  lists.fields.add(new RelationField({
    name: 'owner',
    collectionId: users.id,
    maxSelect: 1,
    cascadeDelete: true,
    required: false,
  }));
  lists.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }));
  lists.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }));
  lists.listRule = '';
  lists.viewRule = '';
  lists.createRule = '@request.auth.id != ""';
  lists.updateRule = '@request.auth.id != "" && owner = @request.auth.id';
  lists.deleteRule = '@request.auth.id != "" && owner = @request.auth.id';
  lists.indexes = ['CREATE UNIQUE INDEX idx_lists_slug ON lists (slug)'];
  app.save(lists);

  // 3. Collection des cadeaux
  const gifts = new Collection({
    name: 'gifts',
    type: 'base',
  });
  gifts.fields.add(new RelationField({
    name: 'list',
    collectionId: lists.id,
    maxSelect: 1,
    cascadeDelete: true,
    required: true,
  }));
  gifts.fields.add(new TextField({ name: 'title', required: true, min: 1, max: 200 }));
  gifts.fields.add(new URLField({ name: 'url', required: false }));
  gifts.fields.add(new NumberField({ name: 'position', required: false, defaultValue: 0 }));
  gifts.fields.add(new BoolField({ name: 'bought', defaultValue: false }));
  gifts.fields.add(new RelationField({
    name: 'buyer',
    collectionId: users.id,
    maxSelect: 1,
    cascadeDelete: false,
    required: false,
  }));
  gifts.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }));
  gifts.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }));
  gifts.listRule = '';
  gifts.viewRule = '';
  gifts.createRule = '@request.auth.id != "" && list.owner = @request.auth.id';
  gifts.updateRule = '@request.auth.id != "" && list.owner = @request.auth.id';
  gifts.deleteRule = '@request.auth.id != "" && list.owner = @request.auth.id';
  gifts.indexes = ['CREATE INDEX idx_gifts_list ON gifts (list)'];
  app.save(gifts);

  // 4. Collection des visites
  const visits = new Collection({
    name: 'visits',
    type: 'base',
  });
  visits.fields.add(new RelationField({
    name: 'user',
    collectionId: users.id,
    maxSelect: 1,
    cascadeDelete: true,
    required: true,
  }));
  visits.fields.add(new RelationField({
    name: 'list',
    collectionId: lists.id,
    maxSelect: 1,
    cascadeDelete: true,
    required: true,
  }));
  visits.fields.add(new DateField({ name: 'lastVisited', required: true }));
  visits.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }));
  visits.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }));
  visits.listRule = '@request.auth.id != "" && user = @request.auth.id';
  visits.viewRule = '@request.auth.id != "" && user = @request.auth.id';
  visits.createRule = '@request.auth.id != "" && user = @request.auth.id';
  visits.updateRule = '@request.auth.id != "" && user = @request.auth.id';
  visits.deleteRule = '@request.auth.id != "" && user = @request.auth.id';
  visits.indexes = ['CREATE UNIQUE INDEX idx_user_list ON visits (user, list)'];
  app.save(visits);
}, (app) => {
  ['visits', 'gifts', 'lists'].forEach((name) => {
    try {
      const col = app.findCollectionByNameOrId(name);
      app.delete(col);
    } catch {}
  });
});
