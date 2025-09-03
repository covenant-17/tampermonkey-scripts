// ==UserScript==
// @name         Hello World Example
// @namespace    https://github.com/covenant-17/tampermonkey-scripts
// @version      1.0
// @description  A simple example userscript that demonstrates basic Tampermonkey functionality
// @author       Maxim Korolev
// @match        *://*/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    // Create a greeting message
    const greeting = document.createElement('div');
    greeting.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        cursor: pointer;
    `;
    
    greeting.textContent = `Hello from Tampermonkey! 👋`;
    greeting.title = 'Click to dismiss';
    
    // Add click to dismiss functionality
    greeting.addEventListener('click', function() {
        greeting.remove();
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(function() {
        if (greeting.parentNode) {
            greeting.remove();
        }
    }, 5000);
    
    // Add to page
    document.body.appendChild(greeting);
    
    console.log('Hello World Tampermonkey script loaded successfully!');
})();