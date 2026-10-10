import { expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'

function setup(on: On) {
  const played: string[] = []
  const store = new Map<string, unknown>()
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('store.get', (_$, e) => ({ value: store.get(e.key) }))
  on('store.set', (_$, e) => (store.set(e.key, e.value), { value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('audio.play', (_$, e) => {
    played.push('asset' in e.clip ? e.clip.asset : '?')
    return { value: undefined }
  })
  return played
}

test('plays in any repo, silent at session start, /arcade toggles', async ($, on) => {
  const played = setup(on)
  await $.session.start({ cwd: '/anywhere', surface: 'terminal', isInteractive: true })
  expect(played).toHaveLength(0)

  await $.command.run({ command: 'arcade', args: 'test' })
  expect(played).toContain('sounds/coin.wav')

  expect((await $.command.run({ command: 'arcade', args: 'off' })).text).toBe('Arcade off.')
  played.length = 0
  await $.command.run({ command: 'arcade', args: 'test' })
  expect(played).toHaveLength(0)

  expect((await $.command.run({ command: 'arcade', args: '' })).text).toBe('Arcade on.')
  expect(played).toContain('sounds/blip.wav')
})
