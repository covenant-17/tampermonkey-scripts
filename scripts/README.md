# Scripts Directory

This directory contains organized userscripts for Tampermonkey.

## Script Template

Use this template for new userscripts:

```javascript
// ==UserScript==
// @name         Script Name
// @namespace    https://github.com/covenant-17/tampermonkey-scripts  
// @version      1.0
// @description  Brief description of what the script does
// @author       covenant-17
// @homepage     https://github.com/covenant-17/tampermonkey-scripts
// @source       https://github.com/covenant-17/tampermonkey-scripts
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