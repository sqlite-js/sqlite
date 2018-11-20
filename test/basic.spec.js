const Sqlite = require('..');

describe('basic', () => {
  it('should get sqlite version', () => {
    expect(Sqlite.version()).toMatchSnapshot();
  })
})
