# Migration Guide

This guide was used to migrate scripts from a single folder to organized repositories.

## Completed Migration

Scripts have been organized into:
- Public scripts in `scripts/` directory
- Private scripts in submodule `scripts-private/` (if accessible)

## If you need to migrate scripts:

1. Decide public vs private
2. Copy `.user.js` files to appropriate directories
3. Update metadata with author "covenant-17" and GitHub links
4. Commit and push changes

For submodule setup, see SUBMODULE_GUIDE.md
