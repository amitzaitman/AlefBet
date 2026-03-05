# AlefBet Framework Development Rules

## CRITICAL: Growing Infrastructure & Centralize Common Code
The framework starts minimal. When you generate a game, component, or any logic that needs a feature that doesn't exist in the framework, you MUST add it as a new, generic reusable module to the framework (`framework/src/`) and export it in `index.js`, instead of hardcoding it in the specific game. 

Always reuse existing framework modules rather than duplicating logic. Every new game should enrich the shared infrastructure. If you find duplicated code across games, extract it to the framework.
