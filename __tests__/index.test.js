const fs = require('fs')
const os = require('os')
const { join } = require('path')
const createServer = require('../index')
const algoliasearch = require('algoliasearch')

describe('the algolite implementation', () => {
  const port = 3331
  let algoliaServer
  const path = join(os.tmpdir(), 'algolia-mock')
  const ag = algoliasearch('appId', 'apiKey', {
    hosts: [
      {
        protocol: 'http',
        url: `localhost:${port}`
      }
    ]
  })
  const index = ag.initIndex('test')

  beforeAll(async () => {
    return new Promise((resolve) => {
      fs.mkdirSync(path, { recursive: true })
      const agServer = createServer({ path })
      algoliaServer = agServer.listen(port, resolve)
    })
  })

  beforeEach(async () => {
    await index.clearObjects()
  })

  // I tried to make this afterEach, but algolia doesn't want to rebind to the port.
  afterAll(async () => {
    return new Promise((resolve) => {
      algoliaServer.close(() => {
        resolve()
      })
    })
  })

  it('supports a basic save and search', async () => {
    await index.saveObject({
      objectID: 'asdf',
      text: 'test'
    })
    const searchResults = await index.search('test')
    expect(searchResults.hits).toEqual([
      {
        objectID: 'asdf',
        text: 'test'
      }
    ])
  })

  it('supports deleting an object', async () => {
    await index.saveObject({
      objectID: 'asdf',
      text: 'test'
    })
    await index.deleteObject('asdf')
    const searchResults = await index.search('test')
    expect(searchResults.hits).toEqual([])
  })

  it('supports clearing an index', async () => {
    await index.saveObject({
      objectID: 'asdf',
      text: 'test'
    })
    await index.clearObjects()
    const searchResults = await index.search('test')
    expect(searchResults.hits).toEqual([])
  })
})
