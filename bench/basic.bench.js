const sqlite3 = require('sqlite3');
const Sqlite = require('../');

const t = process.hrtime();
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run('CREATE TABLE lorem (info TEXT)');

  const stmt = db.prepare('INSERT INTO lorem VALUES (?)');
  for (let i = 0; i < 10; i++) {
    stmt.run(`Ipsum ${i}`);
  }
  stmt.finalize();

  db.each('SELECT rowid AS id, info FROM lorem', (err, row) => {
    // console.log(`${row.id}: ${row.info}`);
  });
  db.close();
  console.log('sqlite3', process.hrtime(t)[1]);
});

const connector = new Sqlite.Sqlite();

(async () => {
  const s = process.hrtime();
  // Creating a regular async connection
  const conn = await connector.open({
    verbose: true // process.env.NODE_ENV !== 'production'
  });
  // conn.prepare('CREATE TABLE lorem (info TEXT)');
  // conn.close();
  console.log('neon sqlite', process.hrtime(s)[1]);
})();

(async () => {
  const s = process.hrtime();
  // Creating a regular async connection
  // Sqlite.example();
  // conn.close();
  console.log('example', process.hrtime(s)[1]);
})();
