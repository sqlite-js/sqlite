/* eslint import/no-extraneous-dependencies: off */
const Benchmark = require('benchmark');
const { Database } = require('sqlite3');
const betterSqlite = require('better-sqlite3');
const { Sqlite } = require('..');

const suite = new Benchmark.Suite();

const defaultOpts = {
  maxTime: 0,
  minSamples: 10
};

suite
  .add('sqlite3', {
    fn: () => {
      const db = new Database(':memory:');

      db.serialize(() => {
        db.run('CREATE TABLE lorem (info TEXT)');

        const stmt = db.prepare('INSERT INTO lorem VALUES (?)');
        for (let i = 0; i < 10; i++) {
          stmt.run(`Ipsum ${i}`);
        }
        stmt.finalize();

        db.close();
      });
    },
    ...defaultOpts
  })
  .add('better-sqlite3', {
    fn: () => {
      const db = betterSqlite(':memory:');

      db.exec('CREATE TABLE lorem (info TEXT)');

      const stmt = db.prepare('INSERT INTO lorem VALUES (?)');
      for (let i = 0; i < 10; i++) {
        stmt.run(`Ipsum ${i}`);
      }

      db.close();
    },
    ...defaultOpts
  })
  .add('sqlite/sqlite', {
    fn: () => {
      const conn = new Sqlite();
      conn.open({
        verbose: true,
        database: ':memory:'
      });
      conn.execute('DROP TABLE IF EXISTS contacts;');
      conn.close();
    },
    ...defaultOpts
  })
  .on('complete', function complete() {
    if (suite.aborted) return;
    console.log(`Fastest is ${this.filter('fastest').map('name')}`);
    console.log('Higher is better:');
    suite
      .map(benchmark => ({ name: benchmark.name, score: benchmark.hz }))
      .forEach(benchmark => {
        console.log(benchmark.name, benchmark.score);
      });
  })
  .run();
