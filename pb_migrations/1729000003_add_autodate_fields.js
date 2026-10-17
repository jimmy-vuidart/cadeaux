/**
 * Migration ajoutant les champs autodate (created, updated) aux collections lists, gifts et visits.
 */

migrate((app) => {
  const collections = ['lists', 'gifts', 'visits'];
  for (const name of collections) {
    const col = app.findCollectionByNameOrId(name);
    let changed = false;
    if (!col.fields.getByName('created')) {
      col.fields.add(new AutodateField({
        name: 'created',
        onCreate: true,
        onUpdate: false,
      }));
      changed = true;
    }
    if (!col.fields.getByName('updated')) {
      col.fields.add(new AutodateField({
        name: 'updated',
        onCreate: true,
        onUpdate: true,
      }));
      changed = true;
    }
    if (changed) {
      app.save(col);
    }
  }

  // Initialisation des dates pour les enregistrements existants n'ayant pas de valeur
  const now = new Date().toISOString().replace('T', ' ');
  try {
    app.db().newQuery("UPDATE lists SET created = {:now}, updated = {:now} WHERE created = '' OR created IS NULL").bind({ now }).execute();
    app.db().newQuery("UPDATE gifts SET created = {:now}, updated = {:now} WHERE created = '' OR created IS NULL").bind({ now }).execute();
    app.db().newQuery("UPDATE visits SET created = {:now}, updated = {:now} WHERE created = '' OR created IS NULL").bind({ now }).execute();
  } catch {}
}, (app) => {
  const collections = ['lists', 'gifts', 'visits'];
  for (const name of collections) {
    try {
      const col = app.findCollectionByNameOrId(name);
      col.fields.removeByName('created');
      col.fields.removeByName('updated');
      app.save(col);
    } catch {}
  }
});
