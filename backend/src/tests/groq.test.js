vi.mock('node-cache', () => {
  const MockNodeCache = vi.fn(function () {
    const store = {}
    this.get = vi.fn((key) => store[key])
    this.set = vi.fn((key, val) => { store[key] = val })
    this.getStats = vi.fn(() => ({}))
  })
  return { default: MockNodeCache }
})

const MOCK_SAT = {
  id: 'iss',
  name: 'International Space Station',
  mission: 'Space Station',
  orbitType: 'LEO',
  launched: '20 Nov 1998',
  mass: 450000,
  description: 'Orbiting laboratory.',
}

const GROQ_SUCCESS_BODY = {
  choices: [{
    message: {
      content: 'The ISS is a crewed orbital station. It hosts experiments. It advances human spaceflight.',
    },
  }],
}

describe('getMissionIntel()', () => {
  let getMissionIntel

  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv('GROQ_API_KEY', 'test-key-123')
    global.fetch = vi.fn()
    const mod = await import('../services/groq.js')
    getMissionIntel = mod.getMissionIntel
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('returns intel string and source: live on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => GROQ_SUCCESS_BODY,
      text: async () => '',
    })
    const result = await getMissionIntel(MOCK_SAT)
    expect(result.intel).toBeTypeOf('string')
    expect(result.intel.length).toBeGreaterThan(0)
    expect(result.source).toBe('live')
  })

  it('throws with status 500 when GROQ_API_KEY is missing', async () => {
    vi.unstubAllEnvs()
    vi.stubEnv('GROQ_API_KEY', '')
    vi.resetModules()
    const mod = await import('../services/groq.js')
    try {
      await mod.getMissionIntel(MOCK_SAT)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err.status).toBe(500)
      expect(err.message).toContain('GROQ_API_KEY')
    }
  })

  it('throws with status 401 on Groq auth failure', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401, text: async () => 'Unauthorized' })
    try {
      await getMissionIntel(MOCK_SAT)
      expect.fail('should have thrown')
    } catch (err) {
      expect(err.status).toBe(401)
    }
  })

  it('calls Groq endpoint with Authorization Bearer header', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => GROQ_SUCCESS_BODY,
      text: async () => '',
    })
    await getMissionIntel(MOCK_SAT)
    const headers = global.fetch.mock.calls[0][1].headers
    expect(headers['Authorization']).toContain('Bearer')
  })

  it('includes satellite name and mission in the prompt', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => GROQ_SUCCESS_BODY,
      text: async () => '',
    })
    await getMissionIntel(MOCK_SAT)
    const body = JSON.parse(global.fetch.mock.calls[0][1].body)
    const prompt = body.messages[0].content
    expect(prompt).toContain(MOCK_SAT.name)
    expect(prompt).toContain(MOCK_SAT.mission)
  })

  it('strips <think>...</think> blocks from model output', async () => {
    const dirtyBody = {
      choices: [{
        message: {
          content: '<think>internal reasoning</think>The ISS is a station. It orbits Earth. It is crewed.',
        },
      }],
    }
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => dirtyBody,
      text: async () => '',
    })
    const result = await getMissionIntel(MOCK_SAT)
    expect(result.intel).not.toContain('<think>')
    expect(result.intel).not.toContain('internal reasoning')
  })
})
