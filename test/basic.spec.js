const { version, Sqlite } = require('..');

describe('basic', () => {
  it('should get sqlite version', () => {
    expect(version()).toMatchSnapshot();
  })

  it('should get ', async () => {
    const conn = new Sqlite();
    await conn.create({
      verbose: true
    });
  })
})
