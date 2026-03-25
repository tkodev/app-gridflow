# Git Standards

> This file defines **how we use git** — branch naming, commit conventions, and PR guidelines. For a full overview of the project, see [CONTRIBUTING.md](/CONTRIBUTING.md).

## Branch Naming

Branch names follow the pattern `type/issue-description` where the issue number comes directly after the `/`, separated from the description by a `-`. Always include the issue number — do not omit it.

```txt
feat/123-feature-name     # New features
fix/123-bug-description   # Bug fixes
refactor/123-area-name    # Code refactoring
docs/123-what-changed     # Documentation updates
style/123-component-name  # Styling changes
chore/123-task-name       # Maintenance tasks
```

Examples: `feat/42-post-scheduling`, `fix/17-dialog-overflow`, `refactor/88-auth-flow`

## Conventional Commits

```txt
<type>(<scope>): <description>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Scopes**: `app`, `auth`, `profiles`, `settings`, `admin`, `components`, `ui`, `utils`, `styles`

```txt
feat(app): add drag-and-drop reordering to post grid
fix(components): resolve dialog overflow on desktop
chore(deps): update next.js to latest
```

**Tooling footers**: Do not leave automated lines such as `Made-with: Cursor` in commit messages or PR descriptions. If your editor or a git hook adds them, remove them before pushing (or amend the commit).

## Pull Requests

**Title**: follow the same `type(scope): description` format as commits.

**Description template**:

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Change 1

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Screenshots (if applicable)

## Testing
Describe how you tested these changes.

## Checklist
- [ ] Follows style guidelines
- [ ] Self-reviewed
- [ ] No new warnings
- [ ] Tested on light and dark modes
```

**Review comment prefixes**: `nit:`, `suggestion:`, `question:`, `issue:`

## Documentation

When a ticket or issue introduces new or changed behaviour, scope, stack decisions, visual design, or routing — update the relevant MD files as part of the same PR. Docs and code ship together.
