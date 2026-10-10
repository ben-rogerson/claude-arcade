import type { EngineInterface, Register } from 'claude-code'

// Quiet 8-bit sounds for how Claude Code work ends, in every repo.
// /arcade [on|off|test] toggles, kept across sessions.
//
//   long turn done (>=45s)   coin
//   turn errored             power-down
//   turn interrupted         blip
//   deploy ok / failed       1-up / power-down

const LONG_TURN_MS = 45_000
const DEPLOY = /\b(?:pnpm|npm|yarn|bun)\s+(?:run\s+)?deploy\b|\bwrangler\s+deploy\b|\bvercel\s+(?:--prod|deploy)\b|\bfly\s+deploy\b|scripts\/deploy\.sh/

type Clip = 'coin' | 'powerdown' | 'blip' | 'oneup'

async function enabled($: EngineInterface) {
  return (await $.store.get('enabled')) !== false
}

async function play($: EngineInterface, clip: Clip) {
  if (!(await enabled($))) return
  void $.audio.play({ asset: `sounds/${clip}.wav` }).catch(err => $.ui.log(`arcade: ${err}`, { to: 'debug' }))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'arcade',
      description: 'Toggle 8-bit end-of-turn sounds',
      argumentHint: '[on|off|test]',
      immediate: true,
    })
    return next(e)
  })

  on('command.run', { command: 'arcade' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'test') {
      if (!(await enabled($))) return { text: 'Arcade is off - /arcade on first.' }
      await play($, 'coin')
      return { text: 'Arcade check: coin.' }
    }
    if (arg && arg !== 'on' && arg !== 'off') return { text: 'Usage: /arcade [on|off|test]' }
    const now = arg ? arg === 'on' : !(await enabled($))
    await $.store.set('enabled', now)
    if (now) await play($, 'blip')
    return { text: `Arcade ${now ? 'on' : 'off'}.` }
  })

  on('turn.complete', async ($, e, next) => {
    if (e.reason === 'aborted') await play($, 'blip')
    else if (e.reason === 'error') await play($, 'powerdown')
    else if (e.reason === 'answer' && e.durationMs >= LONG_TURN_MS) await play($, 'coin')
    return next(e)
  })

  // deploys Claude runs through Bash
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (!DEPLOY.test(e.command) || e.run_in_background) return next(e)
    const ran = await next(e)
    if (ran.deny === undefined) await play($, ran.isError ? 'powerdown' : 'oneup')
    return ran
  })

  // deploys other plugins spawn (/ship)
  on('process.spawn', async function* ($, e, next) {
    if (!DEPLOY.test(e.argv.join(' '))) return yield* next(e)
    const result = yield* next(e)
    if (result.deny === undefined) await play($, result.value.code === 0 ? 'oneup' : 'powerdown')
    return result
  })
}
