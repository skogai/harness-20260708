#!/usr/bin/env bash
# Append context to session start (SessionStart)
# stdout is injected as additionalContext at the beginning of every session
# Edit this script to add whatever you want Claude to see when a session starts

# Add context here — stdout gets injected once at session start
# Example: echo "Git status: $(git status --short 2>/dev/null | head -5)"
echo "Git status: $(git status --short 2>/dev/null | head -5)"
