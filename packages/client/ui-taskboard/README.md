# @deepseek-ai/dsh-client-ui-taskboard

English | [中文](README.zh.md)

Web taskboard surface plugin: its browser half registers the `taskboard` entry in the sidebar's `sidebar.footer.action` list slot and, on click, opens a full main-area takeover panel (everything right of the sidebar) embedding the locally running [Codex Taskboard](https://github.com/chuspeeism/dashi-taskboard) service (`http://127.0.0.1:47823`) in an iframe. Its host half is empty on purpose — the taskboard service stays its own process; this plugin is pure browser surface.

The entry renders like the Settings trigger: a compact row with a checklist glyph in the wide sidebar column, a 36px rail circle when collapsed, with a tooltip providing the rail's accessible name.

While the panel is open it probes the service with a `no-cors` fetch (resolves on any HTTP response, rejects only on a network failure) on open, on Refresh, and every 5 seconds. A reachable service mounts the iframe; an unreachable one degrades to a centered offline state with a start hint and a Retry button instead of a dead frame. Escape, the mask click, and the header Close all dismiss the panel; Refresh re-probes and remounts the iframe.

Panel copy is bilingual: the plugin registers zh/en dictionaries under the `taskboard` namespace of `dsh-client-locale` and rides the standard locale seat.

## Model Experience

No direct model surface: this plugin is browser chrome only. The taskboard's own model-facing surface is its `taskctl` CLI / Codex Skill.

#### KV Cache effect

No direct invalidation; the plugin reads no session state.

## Known Limitations and Deferred Work

- **The embedded service must be running** — the plugin does not start it; run `npm start` in the taskboard checkout (the panel's offline state says so).
- **The service origin is a constant** — `http://127.0.0.1:47823/`; a taskboard bound elsewhere (e.g. a LAN host) needs a code change.
