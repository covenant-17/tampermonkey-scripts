# Scripts Directory

This directory contains organized userscripts for Tampermonkey.

## Directory Structure

### 📁 `examples/`
Simple example scripts that demonstrate basic Tampermonkey functionality:
- `hello-world.js` - Basic greeting script showing DOM manipulation and styling

### 📁 `utilities/`
General utility scripts that enhance browsing experience:
- Scripts for improving website functionality
- Performance enhancements
- Accessibility improvements

### 📁 `social-media/`
Scripts specifically for social media platforms:
- Twitter/X enhancements
- Facebook improvements  
- Instagram utilities
- LinkedIn tools

## Installation Instructions

1. **Install Tampermonkey**
   - [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Safari Extensions](https://apps.apple.com/us/app/tampermonkey/id1482490089)

2. **Add a Script**
   - Open the Tampermonkey dashboard
   - Click "Create a new script"
   - Copy and paste the script code
   - Save (Ctrl+S or Cmd+S)

3. **Enable the Script**
   - Ensure the script is enabled in the dashboard
   - Visit a matching website to see it in action

## Script Template

Use this template for new userscripts:

```javascript
// ==UserScript==
// @name         Script Name
// @namespace    https://github.com/covenant-17/tampermonkey-scripts  
// @version      1.0
// @description  Brief description of what the script does
// @author       Your Name
// @match        https://example.com/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    // Your code here
    
})();
```

## Contributing

When adding new scripts:
1. Place them in the appropriate category directory
2. Use descriptive filenames
3. Include proper metadata headers
4. Add comments explaining functionality
5. Test thoroughly before committing