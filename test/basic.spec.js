const { version, Sqlite } = require('..');
const path = require('path');

describe('basic', () => {
  it('should get sqlite version', () => {
    expect(version()).toMatchSnapshot();
  })

  it('should get ', async () => {
    const conn = new Sqlite();

    await conn.create({
      verbose: true,
      database: path.join(__dirname, 'test.db')
    });

    conn.execute('DROP TABLE IF EXISTS contacts;');

    conn.execute('CREATE TABLE contacts (t VARCHAR PRIMARY KEY);');

    conn.execute(`
      INSERT INTO contacts (t)
      VALUES ("john");
    `);

    conn.execute(`
      SELECT *
      FROM contacts;
    `);

    conn.execute('DROP TABLE contacts;');
  })
})
