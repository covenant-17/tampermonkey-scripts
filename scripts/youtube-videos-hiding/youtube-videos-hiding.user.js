// ==UserScript==
// @name         youtube-videos-hiding
// @namespace    https://github.com/covenant-17/tampermonkey-scripts
// @version      1.0.5
// @description  Hides YouTube videos via right-click on Home, Subscriptions, and Watch Later pages
// @author       covenant-17
// @homepage     https://github.com/covenant-17/tampermonkey-scripts
// @source       https://github.com/covenant-17/tampermonkey-scripts
// @updateURL    https://raw.githubusercontent.com/covenant-17/tampermonkey-scripts/master/scripts/youtube-videos-hiding/youtube-videos-hiding.user.js
// @downloadURL  https://raw.githubusercontent.com/covenant-17/tampermonkey-scripts/master/scripts/youtube-videos-hiding/youtube-videos-hiding.user.js
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Debug mode configuration
    // Enable debug: localStorage.setItem('ytHiderDebug', 'true')
    // Disable debug: localStorage.removeItem('ytHiderDebug')
    const DEFAULT_DEBUG = false;
    const DEBUG = localStorage.getItem('ytHiderDebug') === 'true' || 
                  (localStorage.getItem('ytHiderDebug') === null && DEFAULT_DEBUG);
    
    function log(...args) {
        if (DEBUG) {
            console.log('[YouTube Hider DEBUG]', ...args);
        }
    }
    
    // Show debug status on script load
    if (DEBUG) {
        console.log('[YouTube Hider] Debug mode ENABLED. Disable via: localStorage.removeItem("ytHiderDebug")');
    }

    // Utility function to try multiple selectors
    function trySelectors(context, selectors, logPrefix = '') {
        for (const selector of selectors) {
            const result = context.querySelector(selector);
            if (result) {
                log(`${logPrefix}: found via ${selector}`);
                return result;
            }
        }
        return null;
    }

    // Utility to find element by text content
    function findByText(elements, texts, logPrefix = '') {
        for (const element of elements) {
            const text = element.textContent?.trim();
            if (texts.some(t => text === t || text.includes(t))) {
                log(`${logPrefix}: found "${text}"`);
                return element;
            }
        }
        log(`${logPrefix}: not found`);
        return null;
    }

    // Find the menu button for a video content node using several fallbacks
    function findMenuButton(contentNode) {
        const selectors = [
            '[aria-label="More actions"]',
            '[aria-label*="Action"]',
            'ytd-menu-renderer button',
            'button[aria-label*="menu"]',
            'ytd-menu-renderer yt-icon-button',
            'button.yt-spec-button-shape-next',
            '.yt-lockup-metadata-view-model__menu-button button'
        ];
        
        let btn = trySelectors(contentNode, selectors, 'findMenuButton');
        
        if (!btn && window.location.href.includes("playlist")) {
            log('findMenuButton: trying playlist parent');
            btn = contentNode.parentElement?.querySelector('ytd-menu-renderer button');
            if (btn) log('findMenuButton: found via playlist parent');
        }
        
        if (!btn) log('findMenuButton: NOT FOUND');
        return btn;
    }

    // Find the menu popup element after clicking the menu button
    function findMenuPopup(url) {
        const selectors = [
            'yt-sheet-view-model yt-list-view-model',
            ...(url.includes("playlist") ? [
                'ytd-menu-popup-renderer',
                'tp-yt-paper-listbox'
            ] : []),
            'yt-list-view-model[role="listbox"]',
            'yt-list-view-model[role="menu"]',
            '[role="menu"]',
            'tp-yt-paper-listbox'
        ];
        
        const popup = trySelectors(document, selectors, 'findMenuPopup');
        
        if (!popup) log('findMenuPopup: NOT FOUND');
        return popup;
    }

    // Execute the appropriate action depending on page type
    function handleMenuAction(menuPopup, isSubscriptions, isWatchLater) {
        log('handleMenuAction:', { isSubscriptions, isWatchLater });
        
        if (isSubscriptions) {
            if (menuPopup.children.length > 0) {
                log('handleMenuAction: clicking last item (subscriptions)');
                menuPopup.children[menuPopup.children.length - 1].click();
                console.log('[YouTube Hider] Action: subscriptions - last menu item clicked');
            } else {
                log('handleMenuAction: no children in menu');
            }
            return;
        }

        if (isWatchLater) {
            const paperItems = menuPopup.querySelectorAll('tp-yt-paper-item');
            const item = findByText(paperItems, ['Remove from Watch Later'], 'Watch Later');
            if (item) {
                item.click();
                console.log('[YouTube Hider] Action: removed from Watch Later');
            }
            return;
        }

        // Home page / default: find "Not interested" or "Hide"
        log('handleMenuAction: Home mode');
        const listItems = menuPopup.querySelectorAll('yt-list-item-view-model');
        let hideMenuItem = findByText(listItems, ['Not interested', 'Hide'], 'new structure');
        
        if (!hideMenuItem) {
            hideMenuItem = findByText(menuPopup.children, ['Not interested', 'Hide'], 'old structure');
        }
        
        if (hideMenuItem) {
            hideMenuItem.click();
            console.log('[YouTube Hider] Action: clicked "Not interested" or "Hide"');
        } else if (menuPopup.children.length >= 3) {
            log('handleMenuAction: using fallback (3rd from last)');
            menuPopup.children[menuPopup.children.length - 3].click();
            console.log('[YouTube Hider] Action: hid video (fallback third last)');
        } else {
            log('handleMenuAction: no action possible');
        }
    }

    // Attach the auxclick listener to a single content node
    function attachAuxclickListener(contentNode) {
        if (contentNode.dataset.hideevent) return;
        
        contentNode.addEventListener('auxclick', (event) => {
            log('auxclick: button', event.button);
            
            setTimeout(() => {
                const menuButton = findMenuButton(contentNode);
                if (!menuButton) {
                    log('auxclick: no menu button, aborting');
                    return;
                }
                
                setTimeout(() => {
                    const url = window.location.href;
                    const isHome = url === "https://www.youtube.com/" && event.button !== 1;
                    const isSubscriptions = url === "https://www.youtube.com/feed/subscriptions";
                    const isWatchLater = url.includes("playlist?list=WL");
                    
                    log('auxclick:', { isHome, isSubscriptions, isWatchLater });

                    if (isHome || isSubscriptions || isWatchLater) {
                        menuButton.click();
                        
                        setTimeout(() => {
                            const menuPopup = findMenuPopup(url);
                            if (menuPopup) {
                                handleMenuAction(menuPopup, isSubscriptions, isWatchLater);
                            } else {
                                log('auxclick: no menu popup found');
                            }
                        }, 10);
                    } else {
                        log('auxclick: unsupported page');
                    }
                }, 30);
            }, 40);
        });
        contentNode.dataset.hideevent = "true";
    }

    // Scans the page and attaches auxclick listeners to video content containers
    function scanAndAttachListeners() {
        const videoContents = document.querySelectorAll('ytd-rich-item-renderer #content, ytd-playlist-video-renderer #content');
        
        let attached = 0;
        for (const contentNode of videoContents) {
            if (!contentNode.dataset.hideevent) {
                attachAuxclickListener(contentNode);
                attached++;
            }
        }
        if (attached > 0) log('scanAndAttachListeners: attached', attached, 'listeners');
    }

    // Run once initially to attach listeners to existing items.
    log('Initial scan...');
    scanAndAttachListeners();

    // Debounced MutationObserver: run `scanAndAttachListeners` when new nodes are added (e.g., infinite scroll)
    (function() {
        log('Setting up MutationObserver...');
        let debounceScheduled = false;
        const scheduleScan = () => {
            if (debounceScheduled) return;
            debounceScheduled = true;
            setTimeout(() => {
                try { 
                    scanAndAttachListeners(); 
                } catch (err) { 
                    log('scheduleScan: error', err);
                }
                debounceScheduled = false;
            }, 250);
        };

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes?.length > 0) {
                    log('MutationObserver: new nodes, scheduling scan');
                    scheduleScan();
                    break;
                }
            }
        });

        const targetNode = document.querySelector('ytd-app') || document.body;
        log('MutationObserver: observing', targetNode.tagName);
        observer.observe(targetNode, { childList: true, subtree: true });
    })();

})();
