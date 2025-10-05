# YouTube Videos Hiding

Right-click on YouTube video thumbnails to quickly hide or remove them.

## Features

- **Home page**: Right-click to hide videos you don't want to see
- **Subscriptions feed**: Right-click to remove videos from your feed
- **Watch Later playlist**: Right-click to remove videos from Watch Later

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Click [here](https://raw.githubusercontent.com/covenant-17/tampermonkey-scripts/master/scripts/youtube-videos-hiding/youtube-videos-hiding.user.js) to install the script
3. Click "Install" in Tampermonkey
4. Done! Right-click any video thumbnail on YouTube to hide/remove it

## How It Works

The script automatically detects the page you're on and triggers the appropriate action:
- Finds the "More actions" menu button
- Opens the context menu
- Clicks the relevant action ("Hide", "Don't recommend", or "Remove from Watch Later")

All actions are performed silently in the background with minimal console logging.

## Technical Details

- Uses MutationObserver for efficient DOM monitoring (no polling)
- Supports infinite scroll and dynamic content loading
- Compatible with modern YouTube UI (2024-2025)
- Clean, modular code structure for easy maintenance
