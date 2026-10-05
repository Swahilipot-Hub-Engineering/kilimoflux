# Contributing to <PROJECT_NAME>

Thank you for your interest — **karibu!** This page covers what is specific to this
project. The organisation-wide guide has the general workflow (forking, branching, commit
style, review, the contributor ladder):

👉 **[Swahilipot Hub Contributing Guide](https://github.com/Swahilipot-Hub-Engineering/.github/blob/main/CONTRIBUTING.md)**

By participating you agree to our
[Code of Conduct](https://github.com/Swahilipot-Hub-Engineering/.github/blob/main/CODE_OF_CONDUCT.md).

---

## Quick reference

| | |
| --- | --- |
| **Branch from** | `staging` |
| **Open PRs against** | `staging` |
| **Branch naming** | `feat/142-short-description`, `fix/…`, `docs/…`, `chore/…` |
| **Commit style** | [Conventional Commits](https://www.conventionalcommits.org) |
| **Before pushing** | `<npm run lint>` and `<npm test>` must pass |
| **Maintainer** | @<handle> |
| **Mentor on duty** | @<handle> |
| **Questions** | [Discussions → Q&A](https://github.com/Swahilipot-Hub-Engineering/start-here/discussions) |

## Your first contribution

1. Set the project up by following [docs/ONBOARDING.md](docs/ONBOARDING.md).
2. Find an issue labelled
   [`good first issue`](https://github.com/Swahilipot-Hub-Engineering/<REPO_NAME>/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).
3. **Comment on it to claim it** and wait to be assigned (usually within 2 working days).
   This stops two people doing the same work.
4. Work on **one issue at a time**.
5. If you go quiet for 7 days the issue may be reassigned — just comment to keep it. Life
   happens, and this is not a judgement on you.

## Development workflow

```bash
# Start from an up-to-date staging branch
git checkout staging
git pull upstream staging

# Create your branch
git checkout -b feat/142-offline-catch-entry

# ... make your changes ...

# Check your work before pushing
<npm run lint>
<npm test>
<npm run build>

# Commit using Conventional Commits
git commit -m "feat(catch): queue entries while offline"

# Push and open a pull request against `staging`
git push origin feat/142-offline-catch-entry
```

## Code standards for this project

<!-- Replace with what is actually true here. Be concrete — vague standards are unenforceable. -->

- **Language:** <TypeScript in strict mode; avoid `any`>
- **Components:** <PascalCase files in `src/components`, one component per file>
- **Imports:** <use the `@/` alias rather than deep relative paths>
- **Styling:** <Tailwind utilities; extend tokens in `tailwind.config.ts`, do not hard-code brand colours>
- **State/data:** <React Query for server state; local state stays in the component>
- **Formatting:** handled by <Prettier/ESLint> — run `<npm run lint -- --fix>` rather than reformatting by hand
- **Accessibility:** every interactive element must be keyboard reachable and labelled
- **Performance:** assume a mid-range Android phone on intermittent 3G — test on throttled network

## Testing

<!-- If there are no tests yet, say so honestly and say what a contributor should do instead. -->

| | |
| --- | --- |
| Framework | <Vitest + React Testing Library> |
| Location | <`tests/`, or `<Component>.test.tsx` next to the component> |
| Run all | `<npm test>` |
| Run one file | `<npm test -- src/components/Button.test.tsx>` |

Add a test whenever you change behaviour. For a bug fix, write a test that fails before
your change and passes after — that is the proof the bug is really gone.

## Pull request expectations

- Target `staging`; keep the change focused on one issue.
- Aim for **under 400 changed lines**. Split larger work into a series of PRs.
- Fill in the PR template, including the AI-assistance box if it applies.
- Add before/after screenshots for any UI change.
- CI must be green before review — a failing PR will not be looked at.
- Respond to review comments (even just "done"), and push fixes to the same branch.

## Reporting bugs and requesting features

Use the issue forms — they prompt for the details that make an issue actionable.
For anything security-related, **do not open a public issue**; follow
[SECURITY.md](SECURITY.md).

## Using AI tools here

Copilot is allowed and encouraged, within three rules: **you are the author**, **never put
secrets or personal data in a prompt**, and **if you cannot explain it, do not submit it**.
See [AGENTS.md](AGENTS.md) for the commands and conventions agents should follow, and the
[full policy](https://github.com/Swahilipot-Hub-Engineering/handbook/blob/main/05-copilot-guidelines.md).

## Getting unstuck

Stuck for more than 30 minutes? **Ask.** Comment on your issue and tag the mentor on duty,
or post in Discussions. Asking early is what good contributors do.

---

**Asante sana** for contributing. 🌊
