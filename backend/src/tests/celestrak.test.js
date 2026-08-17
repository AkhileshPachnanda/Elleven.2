vi.mock('node-cache', () => {
  const MockNodeCache = vi.fn(function () {
    this.store = {}
    this.get = vi.fn((key) => this.store[key])
    this.set = vi.fn((key, val) => { this.store[key] = val })
    this.getStats = vi.fn(() => ({ hits: 0, misses: 0, keys: 0 }))
  })
  return { default: MockNodeCache }
})

const VALID_TLE_TEXT = [
  'ISS (ZARYA)',
  '1 25544U 98067A   24015.51562500  .00016717  00000-0  30591-3 0  9992',
  '2 25544  51.6416 170.5671 0005771 324.5755  35.4844 15.49819846435908',
].join('\n')

describe('fetchTLEById()', () => {
  let fetchTLEById

  beforeEach(async () => {
    vi.resetModules()
    global.fetch = vi.fn()
    const mod = await import('../services/celestrak.js')
    fetchTLEById = mod.fetchTLEById
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns parsed TLE data when CelesTrak responds OK', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, text: async () => VALID_TLE_TEXT })
    const result = await fetchTLEById(25544)
    expect(result).toHaveProperty('line1')
    expect(result).toHaveProperty('line2')
    expect(result.noradId).toBe(25544)
  })

  it('includes source: live when fetched from CelesTrak', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, text: async () => VALID_TLE_TEXT })
    const result = await fetchTLEById(25544)
    expect(result.source).toBe('live')
  })

  it('throws when CelesTrak returns a non-ok HTTP status', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 503 })
    await expect(fetchTLEById(25544)).rejects.toThrow('503')
  })

  it('throws when body contains "No GP data found"', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, text: async () => 'No GP data found' })
    await expect(fetchTLEById(99999)).rejects.toThrow(/No TLE data found/)
  })

  it('calls the correct CelesTrak URL with the NORAD ID', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, text: async () => VALID_TLE_TEXT })
    await fetchTLEById(25544)
    const url = global.fetch.mock.calls[0][0]
    expect(url).toContain('CATNR=25544')
    expect(url).toContain('FORMAT=TLE')
  })
})

describe('fetchTLEBatch()', () => {
  let fetchTLEBatch

  beforeEach(async () => {
    vi.resetModules()
    global.fetch = vi.fn()
    const mod = await import('../services/celestrak.js')
    fetchTLEBatch = mod.fetchTLEBatch
  })

  it('returns a map keyed by NORAD ID', async () => {
    global.fetch.mockResolvedValue({ ok: true, text: async () => VALID_TLE_TEXT })
    const result = await fetchTLEBatch([25544])
    expect(result).toHaveProperty('25544')
  })

  it('sets null for a failing NORAD ID without aborting other fetches', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: true, text: async () => VALID_TLE_TEXT })
    const result = await fetchTLEBatch([99999, 25544])
    expect(result[99999]).toBeNull()
    expect(result[25544]).not.toBeNull()
  })
})

describe('getCacheStats()', () => {
  it('returns an object with cache statistics', async () => {
    vi.resetModules()
    const { getCacheStats } = await import('../services/celestrak.js')
    const stats = getCacheStats()
    expect(stats).toBeTypeOf('object')
  })
})
