# Development Workflow

## Task Classification (Mandatory)

Every task must start with a prefix. If missing, stop and ask.

| Prefix | Branch Pattern | Use Case |
|--------|---------------|----------|
| BUG FIX | `bugfix/<description>` | Fixing broken behavior |
| NEW FEATURE | `feature/<description>` | Adding new capability |
| UPDATE | `update/<description>` | Enhancing existing functionality |

## Branch Rules

- **kebab-case** names only
- **One concern per branch**
- **No direct commits to main**
- All merges go to **staging** first
- Only **staging** merges to **main**
- Before creating a branch: check existing branches, suggest the best match, ask for approval

## Task Flows

### BUG FIX
1. Reproduce the issue
2. Identify root cause
3. Write a failing test
4. Implement minimal fix
5. Validate resolution

### NEW FEATURE
1. Define scope
2. Write tests where practical
3. Follow existing patterns
4. Avoid overengineering
5. Validate UX and logic

### UPDATE
1. Identify impact
2. Update affected tests
3. Implement safely
4. Validate fully

## Commit Standards

Format: `type(scope): description`

| Type | Use |
|------|-----|
| `fix` | Bug fix |
| `feat` | New feature |
| `refactor` | Code restructuring |
| `test` | Test additions/changes |

Rules:
- Atomic commits — one logical change per commit
- No vague messages ("fix stuff", "update code")
- No mixed concerns in a single commit

## Option Analysis

For meaningful changes, present **at least 3 options** with trade-offs and a clear recommendation.

## Database Change Protocol (Critical)

Before ANY database change:
1. Ask: "Is this project in production?"
2. If **YES** → Create a new migration. Never modify existing migrations.
3. If **NO** → Modify existing migrations if appropriate.
4. Never assume. Always confirm.

## PR Validation Checklist

Before merge:
- [ ] Tests pass
- [ ] No debug code (`dd()`, `console.log()`, `dump()`)
- [ ] No unused imports or dead code
- [ ] Validation messages are user-friendly
- [ ] No unrelated changes included
- [ ] Scope is clear and documented
- [ ] Root cause identified (for bugs)
- [ ] Services/config used appropriately
- [ ] Risks flagged if critical path affected

## Definition of Done

- Code is clean and minimal
- Tests pass
- Validation is human-friendly
- No runtime errors
- Naming is consistent
- Comments explain WHY, not WHAT
- No dead code
- PR checklist satisfied
