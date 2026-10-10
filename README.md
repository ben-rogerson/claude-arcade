# Claude Arcade

Quiet 8-bit sounds for [Claude Code](https://claude.com/claude-code), so you can hear how a turn ended without looking.

| When | You hear |
| --- | --- |
| A long turn finishes (45s+) | coin |
| A turn errors | power-down |
| You interrupt a turn | blip |
| A deploy succeeds | 1-up |
| A deploy fails | power-down |

The sounds are short (under half a second), start instantly and play quietly. Nothing plays at session start or while you're working.

A deploy is any command Claude runs that looks like one: `pnpm/npm/yarn/bun run deploy`, `wrangler deploy`, `vercel --prod`, `fly deploy`, `scripts/deploy.sh`.

## Install

In Claude Code:

```
/plugin marketplace add ben-rogerson/claude-arcade
/plugin install arcade@arcade
```

Or from your terminal:

```
claude plugin marketplace add ben-rogerson/claude-arcade
claude plugin install arcade@arcade
```

Function-hook plugins (mods) are early access in Claude Code, so you need a recent build. Playback uses `afplay`, so sounds only play on macOS for now.

## Commands

- `/arcade` - toggle on/off (remembered across sessions)
- `/arcade on` / `/arcade off`
- `/arcade test` - plays the coin

## Sounds

All four wavs are synthesised square waves made by `sounds/generate.py`, so they're free to use. Tweak the notes or `VOL` and regenerate:

```
python3 sounds/generate.py sounds
```

## Develop

```
claude --plugin-dir .          # load it from this checkout
claude plugin validate .
claude plugin test .
```

## License

MIT - code and sounds.
