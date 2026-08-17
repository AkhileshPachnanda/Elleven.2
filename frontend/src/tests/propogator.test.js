import { getCurrentPosition, getGroundTrack } from '../lib/propogator.js'

const ISS_TLE = [
  '1 25544U 98067A   24015.51562500  .00016717  00000-0  30591-3 0  9992',
  '2 25544  51.6416 170.5671 0005771 324.5755  35.4844 15.49819846435908',
]
const INVALID_TLE = ['not a valid TLE line 1', 'not a valid TLE line 2']
const FIXED_TIME = new Date('2024-01-15T12:22:30Z')

describe('getCurrentPosition()', () => {
  it('returns an object with lat, lng, alt, velocity for a valid TLE', () => {
    const pos = getCurrentPosition(ISS_TLE, FIXED_TIME)
    expect(pos).not.toBeNull()
    expect(pos).toHaveProperty('lat')
    expect(pos).toHaveProperty('lng')
    expect(pos).toHaveProperty('alt')
    expect(pos).toHaveProperty('velocity')
  })

  it('returns lat in valid range [-90, 90]', () => {
    const pos = getCurrentPosition(ISS_TLE, FIXED_TIME)
    expect(pos.lat).toBeGreaterThanOrEqual(-90)
    expect(pos.lat).toBeLessThanOrEqual(90)
  })

  it('returns lng in valid range [-180, 180]', () => {
    const pos = getCurrentPosition(ISS_TLE, FIXED_TIME)
    expect(pos.lng).toBeGreaterThanOrEqual(-180)
    expect(pos.lng).toBeLessThanOrEqual(180)
  })

  it('returns altitude between 300-600 km (plausible for ISS)', () => {
    const pos = getCurrentPosition(ISS_TLE, FIXED_TIME)
    expect(pos.alt).toBeGreaterThan(300)
    expect(pos.alt).toBeLessThan(600)
  })

  it('returns orbital velocity between 6.5-9.0 km/s (ISS ~7.7)', () => {
    const pos = getCurrentPosition(ISS_TLE, FIXED_TIME)
    expect(pos.velocity).toBeGreaterThan(6.5)
    expect(pos.velocity).toBeLessThan(9.0)
  })

  it('returns all numeric values (not NaN)', () => {
    const pos = getCurrentPosition(ISS_TLE, FIXED_TIME)
    expect(Number.isNaN(pos.lat)).toBe(false)
    expect(Number.isNaN(pos.lng)).toBe(false)
    expect(Number.isNaN(pos.alt)).toBe(false)
    expect(Number.isNaN(pos.velocity)).toBe(false)
  })

  it('returns a different position 30 minutes later (satellite moves)', () => {
    const pos1 = getCurrentPosition(ISS_TLE, FIXED_TIME)
    const laterTime = new Date(FIXED_TIME.getTime() + 30 * 60 * 1000)
    const pos2 = getCurrentPosition(ISS_TLE, laterTime)
    expect(pos1).not.toBeNull()
    expect(pos2).not.toBeNull()
    expect(pos1.lat).not.toBeCloseTo(pos2.lat, 0)
  })

  it('uses current time when no time argument is passed', () => {
    const pos = getCurrentPosition(ISS_TLE)
    expect(pos).not.toBeNull()
    expect(pos).toHaveProperty('lat')
  })

  it('returns null for a corrupt TLE instead of throwing', () => {
    const pos = getCurrentPosition(INVALID_TLE, FIXED_TIME)
    expect(pos).toBeNull()
  })

  it('returns null for an empty TLE array', () => {
    const pos = getCurrentPosition([], FIXED_TIME)
    expect(pos).toBeNull()
  })

  it('returns null for pathological TLE values (eccentricity > 1)', () => {
    const garbage = [
      '1 00000U 00000A   00000.00000000  .00000000  00000-0  00000-0 0  0000',
      '2 00000   0.0000   0.0000 9999999   0.0000   0.0000  0.00000000000000',
    ]
    expect(getCurrentPosition(garbage, FIXED_TIME)).toBeNull()
  })
})

describe('getGroundTrack()', () => {
  it('returns an array for valid TLE input', () => {
    const track = getGroundTrack(ISS_TLE, 90, 1, FIXED_TIME)
    expect(Array.isArray(track)).toBe(true)
  })

  it('returns ~91 points for 90-min window at 1-min steps', () => {
    const track = getGroundTrack(ISS_TLE, 90, 1, FIXED_TIME)
    expect(track.length).toBeGreaterThanOrEqual(89)
    expect(track.length).toBeLessThanOrEqual(93)
  })

  it('each point is a [lat, lng, altFraction] tuple', () => {
    const track = getGroundTrack(ISS_TLE, 10, 1, FIXED_TIME)
    for (const point of track.slice(0, 5)) {
      expect(Array.isArray(point)).toBe(true)
      expect(point).toHaveLength(3)
    }
  })

  it('all lat values stay within [-90, 90]', () => {
    const track = getGroundTrack(ISS_TLE, 90, 1, FIXED_TIME)
    for (const [lat] of track) {
      expect(lat).toBeGreaterThanOrEqual(-90)
      expect(lat).toBeLessThanOrEqual(90)
    }
  })

  it('all lng values stay within [-180, 180]', () => {
    const track = getGroundTrack(ISS_TLE, 90, 1, FIXED_TIME)
    for (const [, lng] of track) {
      expect(lng).toBeGreaterThanOrEqual(-180)
      expect(lng).toBeLessThanOrEqual(180)
    }
  })

  it('altitude fraction (km / 6378) is in plausible ISS range', () => {
    const track = getGroundTrack(ISS_TLE, 10, 1, FIXED_TIME)
    for (const [, , altFraction] of track) {
      expect(altFraction).toBeGreaterThan(0.04)
      expect(altFraction).toBeLessThan(0.12)
    }
  })

  it('coarser step produces fewer points than finer step', () => {
    const fine = getGroundTrack(ISS_TLE, 60, 1, FIXED_TIME)
    const coarse = getGroundTrack(ISS_TLE, 60, 5, FIXED_TIME)
    expect(fine.length).toBeGreaterThan(coarse.length)
  })

  it('returns an empty array for an invalid TLE (no throw)', () => {
    const track = getGroundTrack(INVALID_TLE, 90, 1, FIXED_TIME)
    expect(Array.isArray(track)).toBe(true)
    expect(track).toHaveLength(0)
  })

  it('returns an empty array for an empty TLE array', () => {
    const track = getGroundTrack([], 90, 1, FIXED_TIME)
    expect(Array.isArray(track)).toBe(true)
    expect(track).toHaveLength(0)
  })
})
