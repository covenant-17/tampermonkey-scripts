// ==UserScript==
// @name         Dark Mode Toggle
// @namespace    https://github.com/covenant-17/tampermonkey-scripts
// @version      1.0
// @description  Adds a dark mode toggle button to any website
// @author       Maxim Korolev
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    
    // Get the current domain for settings storage
    const domain = window.location.hostname;
    const storageKey = `darkMode_${domain}`;
    
    // Check if dark mode was previously enabled for this site
    let isDarkMode = GM_getValue(storageKey, false);
    
    // Create the toggle button
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = isDarkMode ? '☀️' : '🌙';
    toggleButton.title = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    toggleButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid #333;
        background: ${isDarkMode ? '#333' : '#fff'};
        color: ${isDarkMode ? '#fff' : '#333'};
        font-size: 20px;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    // Dark mode styles
    const darkModeStyles = `
        * {
            background-color: #1a1a1a !important;
            color: #e0e0e0 !important;
            border-color: #444 !important;
        }
        
        img, video, svg, canvas {
            opacity: 0.8 !important;
        }
        
        input, textarea, select {
            background-color: #2a2a2a !important;
            color: #e0e0e0 !important;
        }
        
        a {
            color: #66b3ff !important;
        }
        
        a:visited {
            color: #cc99ff !important;
        }
    `;
    
    // Create style element for dark mode
    const styleElement = document.createElement('style');
    styleElement.id = 'tampermonkey-dark-mode';
    
    // Function to apply dark mode
    function applyDarkMode(enable) {
        if (enable) {
            styleElement.textContent = darkModeStyles;
            document.head.appendChild(styleElement);
            toggleButton.innerHTML = '☀️';
            toggleButton.title = 'Switch to Light Mode';
            toggleButton.style.background = '#333';
            toggleButton.style.color = '#fff';
        } else {
            const existingStyle = document.getElementById('tampermonkey-dark-mode');
            if (existingStyle) {
                existingStyle.remove();
            }
            toggleButton.innerHTML = '🌙';
            toggleButton.title = 'Switch to Dark Mode';
            toggleButton.style.background = '#fff';
            toggleButton.style.color = '#333';
        }
        
        // Save the preference
        GM_setValue(storageKey, enable);
        isDarkMode = enable;
    }
    
    // Toggle function
    function toggleDarkMode() {
        applyDarkMode(!isDarkMode);
    }
    
    // Add click event listener
    toggleButton.addEventListener('click', toggleDarkMode);
    
    // Hover effects
    toggleButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    toggleButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    // Apply initial dark mode state
    if (isDarkMode) {
        applyDarkMode(true);
    }
    
    // Add button to page
    document.body.appendChild(toggleButton);
    
    console.log('Dark Mode Toggle userscript loaded successfully!');
})();