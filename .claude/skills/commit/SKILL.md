---
name: commit
description: Create a git commit for this project. Use whenever the user says "commit", "commit this", "save changes", "make a commit", or asks to commit staged or unstaged work, even if they don't mention git.
---

# Commit

## Steps

1. Run in parallel: `git status`, `git diff` (staged and unstaged), `git log -5 --oneline`.
2. Stage specific files by name. Skip `.env*`, credentials, `dist/`, `node_modules/`.
3. Draft the message:
   - Subject: imperative, under 72 chars, `type: summary` (`feat`, `fix`, `refactor`, `docs`, `test`, `chore`).
   - Body (optional): one or two lines on why, not what.
4. Commit with a HEREDOC, ending with the attribution line:

   ```
   git commit -m "$(cat <<'EOF'
   feat: add place mode checkbox state

   Co-Authored-By: Claude Code <noreply@anthropic.com>
   EOF
   )"
   ```

5. Run `git status` to confirm.

## Rules

- Never `--no-verify`. If the pre-commit hook fails (lint, typecheck, tests), fix the cause and create a new commit. Never amend.
- Never push unless asked.
- Never commit unless asked.
- If nothing is staged or changed, say so and stop.
- If changes mix unrelated work, ask whether to split them before committing.
