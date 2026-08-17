import { fetchTLEs, fetchMissionIntel } from '../lib/api.js'

const MOCK_TLE_RESPONSE = {
  data: {
    25544: { line1: 'LINE1', line2: 'LINE2' },
  },
}

const MOCK_INTEL_RESPONSE = {
  intel: 'The ISS orbits Earth. It is a space station. Astronauts live there.',
}

beforeEach(() => {
  global.fetch = vi.fn()
  vi.stubEnv('VITE_API_URL', 'http://localhost:3001')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchTLEs()', () => {
  it('calls the correct endpoint with norad IDs as query params', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_TLE_RESPONSE,
    })

    await fetchTLEs([25544, 44804])

    const calledUrl = global.fetch.mock.calls[0][0]
    expect(calledUrl).toContain('/api/tle')
    expect(calledUrl).toContain('25544')
    expect(calledUrl).toContain('44804')
  })

  it('returns the data map directly from the response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_TLE_RESPONSE,
    })

    const result = await fetchTLEs([25544])
    expect(result).toEqual(MOCK_TLE_RESPONSE.data)
  })

  it('throws when the server responds with a non-ok status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ error: 'Service Unavailable' }),
    })

    await expect(fetchTLEs([25544])).rejects.toThrow('Service Unavailable')
  })

  it('passes an AbortController signal through to fetch', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_TLE_RESPONSE,
    })

    const controller = new AbortController()
    await fetchTLEs([25544], { signal: controller.signal })

    const fetchOptions = global.fetch.mock.calls[0][1]
    expect(fetchOptions.signal).toBe(controller.signal)
  })
})

describe('fetchMissionIntel()', () => {
  it('calls the correct endpoint via POST', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_INTEL_RESPONSE,
    })

    await fetchMissionIntel({ id: 'iss', name: 'ISS' })

    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toContain('/api/groq/intel')
    expect(options.method).toBe('POST')
  })

  it('sends the satellite data as the request body', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_INTEL_RESPONSE,
    })

    const sat = { id: 'iss', name: 'ISS' }
    await fetchMissionIntel(sat)

    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    expect(body).toEqual(sat)
  })

  it('returns the intel string from the response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_INTEL_RESPONSE,
    })

    const intel = await fetchMissionIntel({ id: 'iss', name: 'ISS' })
    expect(intel).toBe(MOCK_INTEL_RESPONSE.intel)
  })

  it('throws on a 401 Unauthorized response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Unauthorized' }),
    })

    await expect(fetchMissionIntel({ id: 'iss' })).rejects.toThrow()
  })
})
