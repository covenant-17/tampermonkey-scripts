// ==UserScript==
// @name         youtube-videos-hiding
// @namespace    https://github.com/covenant-17/tampermonkey-scripts
// @version      1.1.0
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

    // Configuration
    const DEFAULT_DEBUG = false;
    const DEBUG = localStorage.getItem('ytHiderDebug') === 'true' || 
                  (localStorage.getItem('ytHiderDebug') === null && DEFAULT_DEBUG);
    
    // Timeouts for YouTube UI interactions (in milliseconds)
    const TIMEOUTS = {
        MENU_BUTTON_WAIT: 40,    // Wait for menu button to be ready
        BEFORE_CLICK: 30,         // Wait before analyzing URL and clicking
        POPUP_APPEAR: 10,         // Wait for popup menu to appear
        DEBOUNCE_SCAN: 250        // Debounce time for mutation observer
    };
    
    // YouTube page URLs
    const YOUTUBE_PAGES = {
        HOME: "https://www.youtube.com/",
        SUBSCRIPTIONS: "https://www.youtube.com/feed/subscriptions",
        WATCH_LATER: "playlist?list=WL"
    };
    
    // CSS Selectors
    const SELECTORS = {
        MENU_BUTTON: [
            '[aria-label="More actions"]',
            '[aria-label*="Action"]',
            'ytd-menu-renderer button',
            'button[aria-label*="menu"]',
            'ytd-menu-renderer yt-icon-button',
            'button.yt-spec-button-shape-next',
            '.yt-lockup-metadata-view-model__menu-button button'
        ],
        MENU_POPUP: [
            'yt-sheet-view-model yt-list-view-model',
            'yt-list-view-model[role="listbox"]',
            'yt-list-view-model[role="menu"]',
            '[role="menu"]',
            'tp-yt-paper-listbox'
        ],
        MENU_POPUP_PLAYLIST: [
            'ytd-menu-popup-renderer',
            'tp-yt-paper-listbox'
        ],
        VIDEO_CONTAINERS: 'ytd-rich-item-renderer #content, ytd-playlist-video-renderer #content',
        WATCH_LATER_ITEMS: 'tp-yt-paper-item',
        NEW_MENU_ITEMS: 'yt-list-item-view-model',
        OBSERVER_TARGET: 'ytd-app'
    };
    
    // Utility: sleep function
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    
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
        let btn = trySelectors(contentNode, SELECTORS.MENU_BUTTON, 'findMenuButton');
        
        if (!btn && window.location.href.includes(YOUTUBE_PAGES.WATCH_LATER)) {
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
            ...SELECTORS.MENU_POPUP,
            ...(url.includes(YOUTUBE_PAGES.WATCH_LATER) ? SELECTORS.MENU_POPUP_PLAYLIST : [])
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
            const paperItems = menuPopup.querySelectorAll(SELECTORS.WATCH_LATER_ITEMS);
            const item = findByText(paperItems, ['Remove from Watch Later'], 'Watch Later');
            if (item) {
                item.click();
                console.log('[YouTube Hider] Action: removed from Watch Later');
            } else {
                log('handleMenuAction: Watch Later item not found');
            }
            return;
        }

        // Home page / default: find "Not interested" or "Hide"
        log('handleMenuAction: Home mode');
        const listItems = menuPopup.querySelectorAll(SELECTORS.NEW_MENU_ITEMS);
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
        
        contentNode.addEventListener('auxclick', async (event) => {
            log('auxclick: button', event.button);
            
            await sleep(TIMEOUTS.MENU_BUTTON_WAIT);
            
            const menuButton = findMenuButton(contentNode);
            if (!menuButton) {
                log('auxclick: no menu button, aborting');
                return;
            }
            
            await sleep(TIMEOUTS.BEFORE_CLICK);
            
            const url = window.location.href;
            const isHome = url === YOUTUBE_PAGES.HOME && event.button !== 1;
            const isSubscriptions = url === YOUTUBE_PAGES.SUBSCRIPTIONS;
            const isWatchLater = url.includes(YOUTUBE_PAGES.WATCH_LATER);
            
            log('auxclick:', { isHome, isSubscriptions, isWatchLater });

            if (isHome || isSubscriptions || isWatchLater) {
                menuButton.click();
                
                await sleep(TIMEOUTS.POPUP_APPEAR);
                
                const menuPopup = findMenuPopup(url);
                if (menuPopup) {
                    handleMenuAction(menuPopup, isSubscriptions, isWatchLater);
                } else {
                    log('auxclick: no menu popup found');
                }
            } else {
                log('auxclick: unsupported page');
            }
        });
        contentNode.dataset.hideevent = "true";
    }

    // Scans the page and attaches auxclick listeners to video content containers
    function scanAndAttachListeners() {
        const videoContents = document.querySelectorAll(SELECTORS.VIDEO_CONTAINERS);
        
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
            }, TIMEOUTS.DEBOUNCE_SCAN);
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

        const targetNode = document.querySelector(SELECTORS.OBSERVER_TARGET) || document.body;
        log('MutationObserver: observing', targetNode.tagName);
        observer.observe(targetNode, { childList: true, subtree: true });
    })();

})();
