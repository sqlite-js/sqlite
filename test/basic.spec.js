const { version, Sqlite } = require('..');
const path = require('path');

describe('basic', () => {
  it('should get sqlite version', () => {
    // Ideally we could snapshot test this but we can't do this until
    // we test against a fixed version of SQLite
    expect(version()).toContain('.');
  });

  it('should execute query statements', async () => {
    const conn = new Sqlite();

    await conn.open({
      verbose: true,
      database: path.join(__dirname, 'test.db')
    });

    conn.execute('DROP TABLE IF EXISTS contacts;');

    conn.execute('CREATE TABLE contacts (t VARCHAR PRIMARY KEY);');

    conn.execute(`
      INSERT INTO contacts (t)
      VALUES ("john");
    `);

    expect(
      await conn.execute(`
      SELECT *
      FROM contacts;
    `)
    ).toMatchSnapshot();

    conn.execute('DROP TABLE contacts;');
  });

  it('should format errors', async () => {
    const conn = new Sqlite();

    await conn.open({
      verbose: true,
      database: path.join(__dirname, 'test.db')
    });

    conn.execute('DROP TABLE IF EXISTS contacts;');

    conn.execute('CREATE TABLE contacts (t VARCHAR PRIMARY KEY);');

    expect(() => {
      conn.execute(`
        INSERT INTO contacts (t)
        VALUES (asdfasdf);
      `);
    }).toThrowErrorMatchingSnapshot();
  });
});
