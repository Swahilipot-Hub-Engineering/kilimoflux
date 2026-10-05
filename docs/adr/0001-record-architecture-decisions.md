# ADR-0001: Record architecture decisions

- **Status:** Accepted
- **Date:** <YYYY-MM-DD>
- **Deciders:** @<handle>

## Context

This project will be built and maintained by a rotating group of volunteers, interns and
community contributors. People join and leave. Without a written record of *why* the
system is the way it is, every significant decision gets re-argued from scratch, and new
contributors cannot tell the difference between a deliberate choice and an accident.

Long design documents go stale and nobody reads them. We need something lightweight enough
that it actually gets written.

## Decision

We record significant architectural decisions as **Architecture Decision Records** (ADRs)
in `docs/adr/`, using the format of this file.

- One file per decision: `NNNN-short-title.md`, numbered sequentially.
- Written when the decision is made, as part of the pull request that implements it.
- **ADRs are immutable.** If a decision changes, write a new ADR that supersedes the old
  one, and update the old one's status to `Superseded by ADR-NNNN`.

Record a decision when it is hard to reverse, affects multiple parts of the system,
involves a real trade-off, or when a future contributor would reasonably ask "why on earth
is it done this way?"

Do not record routine choices — naming a variable, adding a small utility.

## Consequences

**Good**
- New contributors can read the history of the design in an hour.
- Decisions are made deliberately, because writing one down forces you to state the trade-off.
- Reviews can point at an ADR instead of repeating the argument.

**Costs**
- Each significant decision costs 15–30 minutes of writing.
- ADRs need to be written at the time; retrofitting them later rarely happens.

## Template for new ADRs

```markdown
# ADR-NNNN: <Short title>

- **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNNN
- **Date:** YYYY-MM-DD
- **Deciders:** @handle, @handle

## Context
What is the situation, and what forces are at play? What constraints apply
(offline use, low-end devices, volunteer maintenance, cost)?

## Decision
What we decided, stated plainly in the active voice: "We will …"

## Alternatives considered
What else we looked at, and why we did not choose it. This is the most valuable
section for a future reader.

## Consequences
What becomes easier, what becomes harder, and what we accept as a cost.
```
