// ==UserScript==
// @name         youtube-videos-hiding
// @namespace    https://github.com/covenant-17/tampermonkey-scripts
// @version      1.0.2
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

    // Find the menu button for a video content node using several fallbacks
    function findMenuButton(contentNode) {
        let btn = contentNode.querySelector('[aria-label="More actions"]');
        if (!btn) btn = contentNode.querySelector('[aria-label*="Action"]');
        if (!btn) btn = contentNode.querySelector('ytd-menu-renderer button');
        if (!btn) btn = contentNode.querySelector('button[aria-label*="menu"]');
        if (!btn) btn = contentNode.querySelector('ytd-menu-renderer yt-icon-button');
        if (!btn) btn = contentNode.querySelector('button.yt-spec-button-shape-next');
        if (!btn) btn = contentNode.querySelector('.yt-lockup-metadata-view-model__menu-button button');
        if (!btn && window.location.href.includes("playlist")) {
            btn = contentNode.parentElement && contentNode.parentElement.querySelector('ytd-menu-renderer button');
        }
        return btn;
    }

    // Find the menu popup element after clicking the menu button
    function findMenuPopup(url) {
        let popup = null;
        if (url.includes("playlist")) {
            popup = document.querySelector('ytd-menu-popup-renderer') || document.querySelector('tp-yt-paper-listbox');
        }
        if (!popup) popup = document.querySelector('yt-list-view-model[role="menu"]');
        if (!popup) popup = document.querySelector('[role="menu"]');
        if (!popup) popup = document.querySelector('tp-yt-paper-listbox');
        return popup;
    }

    // Execute the appropriate action depending on page type
    function handleMenuAction(menuPopup, isSubscriptions, isWatchLater) {
        if (isSubscriptions) {
            if (menuPopup.children.length > 0) {
                menuPopup.children[menuPopup.children.length - 1].click();
                console.log('[YouTube Hider] Action: subscriptions - last menu item clicked');
            }
            return;
        }

        if (isWatchLater) {
            const paperItems = menuPopup.querySelectorAll('tp-yt-paper-item');
            for (const paperItem of paperItems) {
                if (paperItem.textContent && paperItem.textContent.trim().includes('Remove from Watch Later')) {
                    paperItem.click();
                    console.log('[YouTube Hider] Action: removed from Watch Later');
                    return;
                }
            }
            return;
        }

        // Home page / default: try explicit 'Hide' or fallback to third-last
        let hideMenuItem = null;
        for (const child of menuPopup.children) {
            if (child.textContent && child.textContent.trim() === 'Hide') {
                hideMenuItem = child;
                break;
            }
        }
        if (hideMenuItem) {
            hideMenuItem.click();
            console.log('[YouTube Hider] Action: hid video');
        } else if (menuPopup.children.length >= 3) {
            menuPopup.children[menuPopup.children.length - 3].click();
            console.log('[YouTube Hider] Action: hid video (fallback third last)');
        }
    }

    // Attach the auxclick listener to a single content node
    function attachAuxclickListener(contentNode) {
        if (contentNode.dataset.hideevent) return;
        contentNode.addEventListener('auxclick', (event) => {
            setTimeout(() => {
                const menuButton = findMenuButton(contentNode);
                if (!menuButton) return; // Early exit if button not found

                setTimeout(() => {
                    const url = window.location.href;
                    const isHome = url === "https://www.youtube.com/" && event.button !== 1;
                    const isSubscriptions = url === "https://www.youtube.com/feed/subscriptions";
                    const isWatchLater = url.includes("playlist?list=WL");

                    if (isHome || isSubscriptions || isWatchLater) {
                        menuButton.click();
                        setTimeout(() => {
                            const menuPopup = findMenuPopup(url);
                            if (menuPopup) handleMenuAction(menuPopup, isSubscriptions, isWatchLater);
                        }, 10);
                    }
                }, 30);
            }, 40);
        });
        contentNode.dataset.hideevent = "true";
    }

    // Scans the page and attaches auxclick listeners to video content containers
    function scanAndAttachListeners() {
        const videoContents = document.querySelectorAll('ytd-rich-item-renderer #content, ytd-playlist-video-renderer #content');
        for (const contentNode of videoContents) {
            attachAuxclickListener(contentNode);
        }
    }

    // Run once initially to attach listeners to existing items.
    scanAndAttachListeners();

    // Debounced MutationObserver: run `scanAndAttachListeners` when new nodes are added (e.g., infinite scroll)
    (function() {
        let debounceScheduled = false;
        const scheduleScan = () => {
            if (debounceScheduled) return;
            debounceScheduled = true;
            setTimeout(() => {
                try { scanAndAttachListeners(); } catch (err) { /* silent */ }
                debounceScheduled = false;
            }, 250);
        };

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    scheduleScan();
                    break;
                }
            }
        });

        // Observe ytd-app (main YouTube container) for added nodes, with fallback to body
        const targetNode = document.querySelector('ytd-app') || document.body;
        observer.observe(targetNode, { childList: true, subtree: true });
    })();

})();
