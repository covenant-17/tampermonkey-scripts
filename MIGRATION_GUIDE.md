# Migration Guide: Moving Scripts from tampermonkey to Repositories

This guide helps you organize your Tampermonkey scripts between public and private repositories.

## Current Structure
```
c:\!Dev\tampermonkey\
├── ChatGPT Anchor Bookmarks 👑 Glass UI & True Lazy Loading.*
├── Gmail Alert Blocker.*
├── Google Translate Set Detect Language with More Source Languages.*
├── JoyReactor Posts Hiding v3.*
├── Remove Elements with Class b-list-advert__top.*
├── YouTube Title Modifier.*
└── YouTube Videos Hiding.*
```

## Decide Which Scripts Are Public vs Private

**Public scripts** - Safe to share, useful for community:
- YouTube Videos Hiding
- Google Translate Set Detect Language
- Remove Elements with Class b-list-advert__top
- Dark mode utilities
- General productivity tools

**Private scripts** - Personal/confidential:
- ChatGPT customizations with personal settings
- Gmail-specific scripts with account data
- Scripts with API keys or tokens
- Company/work-related scripts

## Migration Steps

### Step 1: Move Public Scripts

```powershell
# Example: Moving YouTube Videos Hiding to public repo
cd c:\!Dev

# Copy .user.js file to public repo
cp "tampermonkey\YouTube Videos Hiding.user.js" "tampermonkey-scripts\scripts\utilities\"

# Optional: Copy settings (will be gitignored)
cp "tampermonkey\YouTube Videos Hiding.options.json" "tampermonkey-scripts\scripts\utilities\"
cp "tampermonkey\YouTube Videos Hiding.storage.json" "tampermonkey-scripts\scripts\utilities\"
```

### Step 2: Move Private Scripts

```powershell
# Example: Moving ChatGPT script to private repo
cd c:\!Dev

# Copy .user.js file to private repo
cp "tampermonkey\ChatGPT Anchor Bookmarks 👑 Glass UI & True Lazy Loading.user.js" "tampermonkey-private-scripts\scripts\"

# Optional: Copy settings (will be gitignored)
cp "tampermonkey\ChatGPT Anchor Bookmarks 👑 Glass UI & True Lazy Loading.options.json" "tampermonkey-private-scripts\scripts\"
cp "tampermonkey\ChatGPT Anchor Bookmarks 👑 Glass UI & True Lazy Loading.storage.json" "tampermonkey-private-scripts\scripts\"
```

### Step 3: Commit Changes

**Public repository:**
```bash
cd c:\!Dev\tampermonkey-scripts
git add scripts/
git commit -m "Add YouTube Videos Hiding script"
git push
```

**Private repository:**
```bash
cd c:\!Dev\tampermonkey-private-scripts
git add scripts/
git commit -m "Add ChatGPT customization script"
git push
```

### Step 4: Link Private Repo as Submodule (Optional)

```bash
cd c:\!Dev\tampermonkey-scripts
git submodule add https://github.com/YOUR-USERNAME/tampermonkey-private-scripts.git scripts-private
git commit -m "Add private scripts submodule"
git push
```

## Quick Copy Commands

### Public Scripts (examples)
```powershell
# YouTube Videos Hiding
cp "c:\!Dev\tampermonkey\YouTube Videos Hiding.user.js" "c:\!Dev\tampermonkey-scripts\scripts\utilities\"

# Google Translate
cp "c:\!Dev\tampermonkey\Google Translate Set Detect Language with More Source Languages.user.js" "c:\!Dev\tampermonkey-scripts\scripts\utilities\"

# Remove adverts
cp "c:\!Dev\tampermonkey\Remove Elements with Class b-list-advert__top.user.js" "c:\!Dev\tampermonkey-scripts\scripts\utilities\"
```

### Private Scripts (examples)
```powershell
# ChatGPT
cp "c:\!Dev\tampermonkey\ChatGPT Anchor Bookmarks 👑 Glass UI & True Lazy Loading.user.js" "c:\!Dev\tampermonkey-private-scripts\scripts\"

# Gmail
cp "c:\!Dev\tampermonkey\Gmail Alert Blocker.user.js" "c:\!Dev\tampermonkey-private-scripts\scripts\"

# JoyReactor
cp "c:\!Dev\tampermonkey\JoyReactor Posts Hiding v3.user.js" "c:\!Dev\tampermonkey-private-scripts\scripts\"
```

## After Migration

1. Keep original `tampermonkey/` folder as backup
2. Use Git repositories for version control
3. Update scripts in Git repos, not in original folder
4. Set up automatic sync if needed

## Tips

- Review each script before deciding public/private
- Remove any hardcoded credentials before making public
- Add documentation to public scripts
- Keep `.options.json` and `.storage.json` files gitignored
