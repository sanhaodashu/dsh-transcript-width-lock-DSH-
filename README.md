# Transcript width lock (`dsh-transcript-width-lock`)

A **DeepSeek Harness desktop** plugin. It targets the two nearly-invisible drag
strips that flank the conversation transcript (the ones that change **only the
reading width of the message column**, not the sidebars).

It does two things:

1. **Always-visible boundary.** Draws a permanent thin edge line beside the
   transcript so the handle position is obvious at a glance (the stock handle
   only shows its line on hover).
2. **Lock switch.** Adds **"Lock transcript width handles"** under
   Settings ▸ General. While on, the two width handles cannot be dragged, so
   **drag-to-select never changes the reading width**. Text selection itself is
   not blocked; the divider dims and the cursor returns to normal while locked.

> The lock is **ON by default**. To resize the reading width manually, turn the
> switch off in Settings ▸ General.

## Compatibility

- For DeepSeek Harness desktop (Electron web front end).
- Relies on the stable `data-width-handle` attribute of the conversation
  `WidthHandle` (`@deepseek-ai/dsh-client-ui-conversation`, currently
  0.2.2-rc.1).
- If a future DSH release drops that attribute, the plugin becomes a safe no-op
  (no errors, nothing else affected).

## Install (for recipients)

`<profile>` is usually `desktop` (the desktop app's default profile; use whatever
`dsh` profile name you run). After installing, **fully quit and reopen** the
desktop app.

### A. From a local folder or tarball
Send the `dsh-transcript-width-lock` folder (or the `.tgz`), then run:

```bash
# folder
dsh plugin --profile desktop add "<abs-path>/dsh-transcript-width-lock"

# tarball
dsh plugin --profile desktop add "<abs-path>/dsh-transcript-width-lock-1.0.0.tgz"
```

### B. GitHub
Push this package to a repo, then:

```bash
dsh plugin --profile desktop add "github:<user>/<repo>"
```

### C. npm
Set your own `name` / `author` / `repository` in `package.json`, then:

```bash
npm publish            # or pnpm publish
# recipients:
dsh plugin --profile desktop add dsh-transcript-width-lock
```

> The install command wraps pnpm: `dsh plugin ... add <name | github:... | local dir | local tgz>`.

## Uninstall

```bash
dsh plugin --profile desktop remove dsh-transcript-width-lock
```

Then restart the app.

## Package contents

```
dsh-transcript-width-lock/
├── package.json          # name/version/dsh metadata
├── cordis.patch.yml      # mounts the plugin into a profile
├── index.js              # Host half (empty)
├── client.js             # all logic: visible boundary + lock switch
├── locale/{en,zh}.json   # plugin meta + settings copy
├── icon.svg              # plugin icon
├── LICENSE               # MIT
├── README.md             # this file
└── README_ZH.md          # Chinese README
```
