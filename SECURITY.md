# Security Policy

## Reporting a vulnerability

**Please do not open a public issue.**

Report privately via **Security → Advisories → Report a vulnerability** on this repository,
or email **security@swahilipothub.co.ke** with `SECURITY:` and the repository name in the subject.

We acknowledge reports within 3 working days. Full policy:
<https://github.com/Swahilipot-Hub-Engineering/.github/blob/main/SECURITY.md>

## Supported versions

| Branch | Supported |
| --- | --- |
| `main` | ✅ Yes |
| `staging` | ⚠️ Pre-release — report issues, but it is not deployed to users |
| Anything else | ❌ No |

## For contributors

- Never commit secrets, API keys, or `.env` files. Use `.env.example` for documentation.
- Secret scanning with push protection is enabled. If a push is blocked, remove the secret —
  do not work around the block.
- **If you commit a secret: rotate it immediately**, then tell a maintainer. Rotation comes
  first; deleting the commit does not un-leak the key.
- Never paste real user data into an AI prompt, a test fixture, or a bug report.

<!-- If this project handles personal data, keep the section below and complete it. Otherwise delete it. -->
## Personal data in this project

| Question | Answer |
| --- | --- |
| Does this project store personal data? | <yes / no> |
| What data, and why? | <...> |
| Where is it stored? | <...> |
| Who can access production data? | <...> |
| Retention period | <...> |

Kenya's Data Protection Act 2019 applies. Never copy production data into development.
