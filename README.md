# sqlite

[![Build Status](https://travis-ci.com/sqlite-js/sqlite.svg?branch=master)](https://travis-ci.com/sqlite-js/sqlite)

An experimental SQLite library for Node using Neon

## Goals
* APIs
  * Query binding
  * Connection creation and closing
  * Connection pooling
  * Parallel queries
  * Serialization
  * Traces and profiling
  * Interrupting queries
  * Exporting a database
* Modern infrastructure
* Target latest node and electron versions
* Promise based API
* Blob support
* SQLite extensions support
* Typescript support
* Query caching support
* Extensive documentation and examples using docusarus, guides and examples
* Bundle sqlite if system does not have it installed
* Support for larger subset of SQLite API (compared to [`node-sqlite3`](https://github.com/mapbox/node-sqlite3))
* Better performance  (compared to [`node-sqlite3`](https://github.com/mapbox/node-sqlite3))

## Ideal API
```js
import Sqlite from '@sqlite/sqlite';

const connector = new Sqlite();

// Creating a regular async connection
const conn = await connection.create({
  database: '/path/to/database', // ':memory:'
  verbose: true                  // process.env.NODE_ENV !== 'production'
});

// Parallel queries
await Promise.all([
  conn.run('SELECT * FROM users'),
  conn.run('UPDATE tbl SET name = ? WHERE email = ?', 'bar', 2)
]);

// Statement currying
const updateTables = await db.statement('UPDATE tbl SET name = ? WHERE email = ?');
await updateTables('john', 'john@gmail.com');
```
