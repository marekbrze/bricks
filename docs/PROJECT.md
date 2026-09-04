# Bricks

> The project — code, UI, and docs — is written in English. Interviews are
> conducted in the designer's language (Polish); domain terms map to English
> Code Names in `docs/GLOSSARY.md`.

## Core Idea
A personal, local-first tool for deliberate goal achievement, built around the
metaphor of a **Path** (e.g. the sport path, the earnings path). Every completed
Action is a brick that accumulates in a history — and a growing streak of small
wins is the main motivational fuel.

Inspired by Rafał Mazur's courses ("Motywacja bez motywacji", "Uwolnij
zakładnika"): achieving goals = a defined path + a process of daily action + many
small wins that compound over time.

## User Problems

- **Griply is closed**: no API, so you can't build your own tooling to process and
  split tasks across goals. Today the user is tied to whatever the tool offers and
  dislikes it.
- **Hard to move tasks between goals**: Griply won't let you easily drag tasks
  from one goal to another; the structure is rigid.
- **No log of daily action**: Griply doesn't show a history of what you did day by
  day toward a goal. This is the most important gap — without that history there's
  no visible progress, and people naturally (negative bias) look at what's missing
  instead of the distance already covered. Today the user keeps this log by hand
  in a separate GitHub project.
- **No sense of progress and accumulation**: after a streak of wins you want the
  next one — but only if you can see the streak. Without a visualization of "how
  much I've already done" (like a GitHub contribution graph) momentum is hard to
  hold.
- **No prioritization by leverage**: the user wants to know which Actions give the
  biggest return on invested time and energy, and which are "frogs" to get out of
  the way — today that lives only in their head.

## Target Users
Primarily the author. Someone working on several long-term life directions at once
(sport, earnings) who thinks in terms of deliberately building a future rather
than reactively managing a task list. Values open tools (API, own scripts), local
control over data, and item-by-item processes (knows DoItDone, AutoFocus/AutoWork,
runs their own Open Loops). Bounced off closed goal apps.

Personal tool, single-user, data kept locally (Dexie + LocalStorage planned), no
accounts, no sharing.

## Key Actions

1. **Build a Path and its Vision** — create a Path, describe the Vision (markdown
   notes + images + a checklist of "along the way" things that need no hard
   actions, e.g. "I can do a pull-up", "I can touch the floor with my hands").
2. **Capture an idea into the Inbox** — quickly capture an Action idea (e.g. "buy a
   stretching band") without deciding where it belongs yet.
3. **Triage the Inbox** — a dedicated mode, item by item: assign to a Path/Goal or
   mark as a standalone Action, set priority (pairwise comparisons by return on
   time and energy), optionally schedule for a day or discard.
4. **Plan and do the day's Actions** — mostly you pick from the pool of available
   Actions each day (optionally plan a week ahead, but the current week affects
   what you can realistically take on). Clearly marked: what's valuable and what's
   a "frog".
5. **Close a win and review the log** — a completed Action / achieved Goal lands in
   the log; you return to the history and the contribution graph to see cumulative
   progress toward a goal.

## Happy Path

1. The user opens the app in the morning.
2. They see a short summary of their Vision and Goals — what they're working toward
   (a paragraph, not a wall of text).
3. They see the list of Actions for today, with markers for the most valuable ones
   and the "frogs".
4. They pick an Action and do it; they mark it complete.
5. The win lands in the log; the count of Actions toward that goal grows, the
   contribution graph gets another entry.
6. During the day they drop new ideas into the Inbox without stopping work to
   decide where they belong.
7. At a separate moment (Inbox review) they process the collected ideas item by
   item: assign to a Path/Goal or standalone Action + pairwise priority.
8. In the evening / at the end of the week they check the log and the graph to see
   the distance covered — which drives the next day.

## Decisions

- **Name**: Bricks (repo `marekbrze/bricks`).
- **Language**: the whole project (code, UI copy, docs) is English. Interviews run
  in Polish; `docs/GLOSSARY.md` maps Polish terms to English Code Names.
- **Stack**: React + Vite + TypeScript + Tailwind v4 + shadcn/ui (base-nova) +
  Storybook, LocalStorage (Dexie planned later). Scaffolded from `proto-template`
  (proto-devsetup, 2026-09-04).
- **Package manager**: pnpm.
- **Accessibility**: WCAG 2.2 **AAA** (eslint jsx-a11y `strict`).
- **GitHub Pages: yes** — deploy wired via proto-deploy during proto-devsetup
  (`.github/workflows/deploy.yml`, `base: '/bricks/'`, Pages enabled via API).
  Target URL: https://marekbrze.github.io/bricks/. Publishes on `git push origin
  main`.

## Open Questions

- **Openness / API** is an explicit differentiator vs Griply, but the prototype is
  local (Dexie + LocalStorage). How much of "openness" should be visible in the
  prototype (export/import, data shape, hooks) and how much is a later goal?
- **What can an Action belong to?** An execution Goal, directly to a Path (the "buy
  a band" example), or also to a Vision checklist item? Vision checklist items by
  definition "have no hard actions" — how to reconcile that.
- ~~**Vision: one or many per Path?**~~ Resolved (proto-detail, vision,
  2026-09-04): one Vision per Path, confirmed. See ADR 0016.
- ~~**Achieving a Goal** — automatic once all tasks are done, or a manual mark?~~
  Resolved (proto-detail, goals, 2026-09-04): manual mark, matching
  `Achievement`. See ADR 0007.
- **Pairwise prioritization** — full every-with-every comparisons or a lighter
  mechanism? How does it scale with a large Inbox?
- **"Frog"** — a manual flag or derived from something (e.g. high leverage + low
  comfort)?
- **Weekly vs daily planning** — how do they coexist? Is the weekly plan just a
  list of suggestions for days?
- **Action counter** — "against all tasks" vs a purely cumulative graph. We agreed
  the cumulative GitHub-style graph matters more; is an "X of Y" counter needed at
  all?
- **Vision as markdown + images** — what does editing look like and where do images
  land under local storage?
