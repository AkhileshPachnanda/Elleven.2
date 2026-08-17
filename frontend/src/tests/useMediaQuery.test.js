import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

function mockMatchMedia(matches) {
  const listeners = []
  const mq = {
    matches,
    addEventListener: vi.fn((_, cb) => listeners.push(cb)),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    _fire: (newMatches) => {
      mq.matches = newMatches
      listeners.forEach(cb => cb())
    },
    _listeners: listeners,
  }
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue(mq),
  })
  return mq
}

describe('useMediaQuery()', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when the query initially matches', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('returns false when the query initially does not match', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('attaches a change event listener on mount', () => {
    const mq = mockMatchMedia(false)
    renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(mq.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('removes the listener on unmount', () => {
    const mq = mockMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    unmount()
    expect(mq.removeEventListener).toHaveBeenCalled()
  })

  it('updates state when the media query fires a change event', () => {
    const mq = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'))
    expect(result.current).toBe(false)

    act(() => mq._fire(true))

    expect(result.current).toBe(true)
  })

  it('re-evaluates when the query string prop changes', () => {
    mockMatchMedia(true)
    const { result, rerender } = renderHook(({ q }) => useMediaQuery(q), {
      initialProps: { q: '(max-width: 768px)' },
    })
    expect(result.current).toBe(true)

    mockMatchMedia(false)
    rerender({ q: '(min-width: 1200px)' })
    expect(result.current).toBe(false)
  })
})
