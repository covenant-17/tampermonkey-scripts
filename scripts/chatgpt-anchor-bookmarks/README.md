# ChatGPT Anchor Bookmarks 👑 Glass UI & True Lazy Loading

Adds a floating glass-style panel with emoji anchor buttons for each user/assistant message in ChatGPT. Features true lazy loading for optimal performance even with thousands of messages.

https://github.com/user-attachments/assets/9a594378-09c1-4e89-98b7-6b7bde345672

## Features

### 🔖 Smart Bookmarking
- Automatic anchor creation for each message
- Emoji indicators for user (👤) and assistant (🤖) messages
- Instant navigation to any message in the conversation

### ⚡ Performance Optimized
- **True Lazy Loading**: Message text is rendered only for visible items
- Handles thousands of bookmarks without lag
- Efficient scroll handling and memory management

### 🎨 Beautiful Glass UI
- Floating panel with glass morphism design
- Colors match ChatGPT's UI theme
- Smooth animations and transitions
- Responsive and modern interface

### 📱 User Experience
- Auto-scrolls to the newest anchor
- Expandable message previews
- Collapsible panel for more screen space
- Works seamlessly with ChatGPT interface

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Open `ChatGPT Anchor Bookmarks.user.js`
3. Copy contents to Tampermonkey dashboard
4. Save and enable the script

## Usage

### Automatic Operation
- Script activates automatically on `https://chat.openai.com/*` and `https://chatgpt.com/*`
- Bookmark panel appears as a floating sidebar
- New messages are automatically added as anchors

### Navigation
- Click any bookmark to jump to that message
- Expand bookmarks to see message preview
- Panel auto-scrolls to show the latest message

### Performance
- Optimized for conversations with hundreds or thousands of messages
- Lazy loading ensures smooth scrolling
- Minimal memory footprint

## Technical Details

- **Version**: 3.0
- **Author**: covenant-17
- **Namespace**: https://github.com/covenant-17/tampermonkey-scripts
- **Compatibility**: ChatGPT web interface

## Files

- `chatgpt-anchor-bookmarks.user.js` - Main script (25KB)

## Tips

- Use the bookmark panel for quick navigation in long conversations
- Collapse the panel when not needed to maximize chat space
- Bookmarks persist during the session but reset on page reload

## Credits

Created with assistance from OpenAI's ChatGPT for enhanced conversation navigation.
