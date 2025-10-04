// ==UserScript==
// @name         ChatGPT Anchor Bookmarks 👑 Glass UI & True Lazy Loading
// @namespace    https://github.com/covenant-17/tampermonkey-scripts
// @version      3.0
// @description  Adds a floating glass-style panel with emoji anchor buttons for each user/assistant message in ChatGPT. Anchor panel supports true lazy loading: message text is rendered only for visible items (on scroll or expand). Instant navigation to any message, does not lag even with thousands of bookmarks. Colors match ChatGPT UI. Auto-scrolls to the newest anchor.
// @author       covenant-17
// @homepage     https://github.com/covenant-17/tampermonkey-scripts
// @source       https://github.com/covenant-17/tampermonkey-scripts
// @updateURL    https://raw.githubusercontent.com/covenant-17/tampermonkey-scripts/main/scripts/chatgpt-anchor-bookmarks/chatgpt-anchor-bookmarks.user.js
// @downloadURL  https://raw.githubusercontent.com/covenant-17/tampermonkey-scripts/main/scripts/chatgpt-anchor-bookmarks/chatgpt-anchor-bookmarks.user.js
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let uniqueTexts = new Set();
    let bookmarkWrappers = [];
    let observer;
    let isProcessing = false; // Flag to prevent parallel processing

    // Function to get timestamp with milliseconds
    function getTimeStamp() {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    }

    // Show loader in panel
    function showLoader(messageCount = 0, processed = 0) {
        const panel = document.querySelector('#shintra-bookmark-panel');
        if (!panel) return;

        // If loader already exists, update only text
        let loader = document.querySelector('#bookmark-loader');
        if (loader) {
            const text = loader.querySelector('.loader-text');
            if (text) {
                if (processed > 0 && messageCount > 0) {
                    const percent = Math.round((processed / messageCount) * 100);
                    text.textContent = `Processing... ${processed}/${messageCount} (${percent}%)`;
                } else if (messageCount > 0) {
                    text.textContent = `Loading... (${messageCount})`;
                } else {
                    text.textContent = 'Loading...';
                }
            }
            return;
        }

        panel.innerHTML = '';
        loader = document.createElement('div');
        loader.id = 'bookmark-loader';
        loader.style.display = 'flex';
        loader.style.flexDirection = 'column';
        loader.style.alignItems = 'center';
        loader.style.justifyContent = 'center';
        loader.style.padding = '20px';
        loader.style.color = '#fff';
        loader.style.fontSize = '12px';
        loader.style.opacity = '0.8';

        const spinner = document.createElement('div');
        spinner.style.width = '20px';
        spinner.style.height = '20px';
        spinner.style.border = '2px solid rgba(255,255,255,0.3)';
        spinner.style.borderTop = '2px solid #fff';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';
        spinner.style.marginBottom = '10px';

        const text = document.createElement('div');
        text.className = 'loader-text';
        if (processed > 0 && messageCount > 0) {
            const percent = Math.round((processed / messageCount) * 100);
            text.textContent = `Processing... ${processed}/${messageCount} (${percent}%)`;
        } else if (messageCount > 0) {
            text.textContent = `Loading... (${messageCount})`;
        } else {
            text.textContent = 'Loading...';
        }
        text.style.textAlign = 'center';

        loader.appendChild(spinner);
        loader.appendChild(text);
        panel.appendChild(loader);

        // Add CSS for spinner animation
        if (!document.querySelector('#loader-styles')) {
            const style = document.createElement('style');
            style.id = 'loader-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Remove loader
    function hideLoader() {
        const loader = document.querySelector('#bookmark-loader');
        if (loader) {
            loader.remove();
        }
    }

    // Show empty state in panel
    function showEmptyState() {
        const panel = document.querySelector('#shintra-bookmark-panel');
        if (!panel) return;

        // Don't show empty state if loader is already shown
        if (document.querySelector('#bookmark-loader')) return;

        // If empty state already exists, don't create duplicate
        if (document.querySelector('#bookmark-empty-state')) return;

        panel.innerHTML = '';
        const emptyState = document.createElement('div');
        emptyState.id = 'bookmark-empty-state';
        emptyState.style.display = 'flex';
        emptyState.style.flexDirection = 'column';
        emptyState.style.alignItems = 'center';
        emptyState.style.justifyContent = 'center';
        emptyState.style.padding = '20px 10px';
        emptyState.style.color = '#fff';
        emptyState.style.fontSize = '12px';
        emptyState.style.opacity = '0.7';
        emptyState.style.textAlign = 'center';

        const icon = document.createElement('div');
        icon.style.fontSize = '24px';
        icon.style.marginBottom = '8px';
        icon.style.opacity = '0.5';
        icon.textContent = '💭';

        const text = document.createElement('div');
        text.textContent = 'No messages yet';
        text.style.marginBottom = '4px';

        const subtext = document.createElement('div');
        subtext.style.fontSize = '10px';
        subtext.style.opacity = '0.5';
        subtext.textContent = 'Bookmarks will appear soon';

        emptyState.appendChild(icon);
        emptyState.appendChild(text);
        emptyState.appendChild(subtext);
        panel.appendChild(emptyState);
    }

    // Remove empty state
    function hideEmptyState() {
        const emptyState = document.querySelector('#bookmark-empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }

    // Color settings to match ChatGPT's native UI
    const userBg = 'rgba(68,70,84,0.97)';      // user message: #444654
    const shyntraBg = 'rgba(52,53,65,0.97)';   // assistant message: #343541
    const hoverUserBg = 'rgba(80,82,100,1)';
    const hoverShyntraBg = 'rgba(64,66,85,1)';

    // Create the floating glassy anchor panel
    function createBookmarkPanel() {
        if (!document.querySelector('#shintra-bookmark-panel')) {
            const panel = document.createElement('div');
            panel.id = 'shintra-bookmark-panel';
            panel.style.position = 'fixed';
            panel.style.top = '50%';
            panel.style.right = '1.5%';
            panel.style.transform = 'translateY(-50%)';
            panel.style.background = 'rgba(60, 60, 70, 0.18)';
            panel.style.backdropFilter = 'blur(10px)';
            panel.style.webkitBackdropFilter = 'blur(10px)';
            panel.style.padding = '7px';
            panel.style.zIndex = '9999';
            panel.style.borderRadius = '4px';
            panel.style.width = '95px';
            panel.style.maxHeight = '75%';
            panel.style.transition = 'width 0.32s cubic-bezier(.24,.93,.43,.98), box-shadow 0.3s';
            panel.style.boxShadow = '0 2px 24px 4px rgba(0,0,0,0.13)';
            panel.style.scrollbarGutter = 'auto';
            panel.style.overflowY = 'scroll';
            panel.style.overflowX = 'hidden';

            let isPanelExpanded = false;
            let pendingCollapse = null;

            panel.addEventListener('mouseenter', () => {
                isPanelExpanded = true;
                if (pendingCollapse) {
                    clearTimeout(pendingCollapse);
                    pendingCollapse = null;
                }
                panel.style.width = '275px';
                panel.style.scrollbarGutter = 'stable';
                panel.classList.add('expanded');
                toggleButtonPosition(true); // Move buttons to right
                setTimeout(updateLazyText, 200);
            });

            panel.addEventListener('mouseleave', () => {
                isPanelExpanded = false;
                pendingCollapse = setTimeout(() => {
                    // Only if mouse hasn't returned!
                    if (!isPanelExpanded) {
                        panel.style.width = '75px';
                        panel.style.scrollbarGutter = 'auto';
                        panel.classList.remove('expanded');
                        toggleButtonPosition(false); // Move buttons to center
                        removeAllText();
                    }
                }, 70); // 70ms - perfect protection against accidental mouse movements
            });



            panel.addEventListener('scroll', () => {
                if (panel.classList.contains('expanded')) {
                    updateLazyText();
                }
            });

            document.body.appendChild(panel);
        }
    }

    // Switch button position between center (collapsed) and right (expanded)
    function toggleButtonPosition(expanded) {
        bookmarkWrappers.forEach(({ button }) => {
            if (expanded) {
                // Expanded: button on the right
                button.style.left = 'auto';
                button.style.right = '5px';
                button.style.transform = 'translateY(-50%)';
            } else {
                // Collapsed: button centered
                button.style.left = '50%';
                button.style.right = 'auto';
                button.style.transform = 'translate(-50%, -50%)';
            }
        });
    }

    // Render text only for bookmarks visible in the scroll viewport (true lazy loading)
    function updateLazyText() {
        const panel = document.querySelector('#shintra-bookmark-panel');
        const panelRect = panel.getBoundingClientRect();
        bookmarkWrappers.forEach(({ wrapper, textSpan, button }) => {
            const rect = wrapper.getBoundingClientRect();
            // Add a small buffer so text appears before full scroll-in
            const visible = (
                rect.bottom > panelRect.top - 20 &&
                rect.top < panelRect.bottom + 20
            );
            if (visible && !textSpan.isConnected) {
                textSpan.style.opacity = '0';
                wrapper.insertBefore(textSpan, button);
                setTimeout(() => {
                    textSpan.style.transition = 'opacity 0.72s';
                    textSpan.style.opacity = '1';
                }, 50);
            } else if (!visible && textSpan.isConnected) {
                textSpan.style.transition = 'opacity 0.30s';
                textSpan.style.opacity = '0';
                setTimeout(() => {
                    if (textSpan.isConnected)
                        wrapper.removeChild(textSpan);
                }, 50);
            }
        });
    }

    // Instantly remove all text spans from all bookmarks (on panel collapse)
    function removeAllText() {
        bookmarkWrappers.forEach(({ wrapper, textSpan }) => {
            if (textSpan.isConnected) {
                textSpan.style.transition = 'opacity 0.40s';
                textSpan.style.opacity = '0';
                setTimeout(() => {
                    if (textSpan.isConnected)
                        wrapper.removeChild(textSpan);
                }, 210);
            }
        });
    }

    // Create a single anchor (emoji + optional text span, for lazy)
    function addBookmark(text, element, isUser, isShyntra) {
        const panel = document.querySelector('#shintra-bookmark-panel');
        if (!panel) return;

        // Avoid duplicates and system messages
        if (uniqueTexts.has(text) || text.startsWith('window.__')) return;
        uniqueTexts.add(text);

        const addBookmarkStart = performance.now();

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.margin = '5px 0px';
        wrapper.style.width = '100%';
        wrapper.style.cursor = 'pointer';
        wrapper.style.borderRadius = '5px';
        wrapper.style.transition = 'background 0.38s, box-shadow 0.3s';
        wrapper.style.position = 'relative';
        wrapper.style.justifyContent = 'center'; // By default center the button when collapsed
        wrapper.style.minHeight = '50px'; // Ensure consistent height for button spacing

        // The text is not inserted by default, only when visible (lazy)
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        textSpan.style.color = '#fff';
        textSpan.style.fontSize = '13px';
        textSpan.style.opacity = '.92';
        textSpan.style.display = '-webkit-box';
        textSpan.style.webkitBoxOrient = 'vertical';
        textSpan.style.webkitLineClamp = '2';
        textSpan.style.overflow = 'hidden';
        textSpan.style.textOverflow = 'ellipsis';
        textSpan.style.paddingRight = '50px'; // Space for the fixed button
        textSpan.style.flex = '1';
        textSpan.style.minWidth = '0'; // Important for text overflow

        // Emoji button (user/assistant/unknown)
        const button = document.createElement('button');
        // button.title = text.length > 100 ? text.slice(0, 100) + "…" : text;
        button.style.position = 'absolute';
        button.style.left = '50%';
        button.style.top = '50%';
        button.style.transform = 'translate(-50%, -50%)'; // Center the button by default
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.borderRadius = '50%';
        button.style.fontSize = '18px';
        button.style.flexShrink = '0';
        button.style.transition = 'background 0.3s, right 0.32s, left 0.32s, transform 0.32s';
        // Button position will change between center and right based on panel state

        if (isUser) {
            button.textContent = '🗿';
            button.style.background = userBg;
        } else if (isShyntra) {
            button.textContent = '🤖';
            button.style.background = shyntraBg;
        } else {
            button.textContent = '⭐';
            button.style.background = 'rgba(130,130,140,0.11)';
        }

        // Scroll to the chat message when clicking the wrapper or button
        wrapper.addEventListener('click', () => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Hover styles for the whole anchor row
        wrapper.addEventListener('mouseenter', () => {
            wrapper.style.background = 'rgba(255,255,255,0.03)';
            wrapper.style.boxShadow = '0 0 12px 5px rgba(255,255,255,0.04)';
            button.style.background = isUser ? hoverUserBg : isShyntra ? hoverShyntraBg : 'rgba(120,120,130,0.19)';
        });
        wrapper.addEventListener('mouseleave', () => {
            wrapper.style.background = '';
            wrapper.style.boxShadow = '';
            button.style.background = isUser ? userBg : isShyntra ? shyntraBg : 'rgba(130,130,140,0.11)';
        });

        wrapper.appendChild(button);
        // Do NOT add to panel immediately - only after processing completion
        // panel.appendChild(wrapper);

        // Save wrapper/text/button for lazy loading logic
        bookmarkWrappers.push({ wrapper, textSpan, button });

        const addBookmarkTime = performance.now() - addBookmarkStart;
        if (addBookmarkTime > 1) { // Log only if takes longer than 1ms
            console.log(`🐌 addBookmark took ${addBookmarkTime.toFixed(2)}ms for: ${text.slice(0, 50)}...`);
        }
    }

    // Optimized function to determine message type
    function getSRLabels(msg) {
        // Cache queries to avoid querySelector twice
        const h5 = msg.querySelector('h5.sr-only');
        const h6 = msg.querySelector('h6.sr-only');
        return {
            isUser: !!(h5 && h5.textContent && h5.textContent.includes('You said:')),
            isShyntra: !!(h6 && h6.textContent && h6.textContent.includes('ChatGPT said:'))
        };
    }

    // Build and fill all bookmarks for the current chat, and scroll to bottom
    function buildBookmarks() {
        if (isProcessing) {
            console.log(`⚠️ [${getTimeStamp()}] Skipping buildBookmarks - already running`);
            return;
        }

        isProcessing = true;
        console.log(`🚀 [${getTimeStamp()}] Starting buildBookmarks`);
        uniqueTexts.clear();
        bookmarkWrappers = [];
        const panel = document.querySelector('#shintra-bookmark-panel');
        if (panel) panel.innerHTML = '';
        const messages = Array.from(document.querySelectorAll('div.text-base'));
        console.log(`📊 [${getTimeStamp()}] Found messages: ${messages.length}`);
        if (messages.length === 0) {
            hideLoader(); // Hide loader if it was shown
            showEmptyState(); // Show empty state when no messages
            isProcessing = false;
            return;
        }

        hideEmptyState(); // Remove empty state if it was shown before

        // Show processing loader if many messages
        if (messages.length > 50) {
            showLoader(messages.length, 0);
        }

        console.log(`🚀 [${getTimeStamp()}] Starting processing ${messages.length} messages`);
        const currentPath = location.pathname; // Remember current path
        let i = 0;
        const startTime = performance.now();

        function createChunk() {
            // Stop processing if user navigated to another page
            if (location.pathname !== currentPath) {
                console.log(`⚠️ [${getTimeStamp()}] Interrupted: path changed`);
                isProcessing = false;
                return;
            }

            const chunkStartTime = performance.now();
            // Dynamic chunk size: larger for small message count
            const chunk = messages.length < 50 ? 15 : messages.length < 200 ? 10 : 8;
            console.log(`⚡ [${getTimeStamp()}] Processing chunk ${Math.floor(i/chunk) + 1}, elements ${i}-${Math.min(i+chunk-1, messages.length-1)}`);

            for (let k = 0; k < chunk && i < messages.length; ++k, ++i) {
                const msg = messages[i];
                const textContent = msg.textContent.trim();
                let isUser = false, isShyntra = false;

                // First check sibling elements (faster check)
                let sibling = msg.previousElementSibling;
                while (sibling && (!isUser && !isShyntra)) {
                    if (sibling.matches('h5.sr-only') && sibling.textContent.includes('You said:')) isUser = true;
                    if (sibling.matches('h6.sr-only') && sibling.textContent.includes('ChatGPT said:')) isShyntra = true;
                    sibling = sibling.previousElementSibling;
                }

                // Only if not found in siblings, search inside message
                if (!isUser && !isShyntra) {
                    const sr = getSRLabels(msg);
                    isUser = sr.isUser;
                    isShyntra = sr.isShyntra;
                }

                if (textContent.length > 0 && !uniqueTexts.has(textContent) && !textContent.startsWith('window.__')) {
                    addBookmark(textContent, msg, isUser, isShyntra);
                }
            }

            const chunkTime = performance.now() - chunkStartTime;
            console.log(`⏱️ [${getTimeStamp()}] Chunk processed in ${chunkTime.toFixed(2)}ms`);

            // Show processing progress in loader
            if (document.querySelector('#bookmark-loader')) {
                showLoader(messages.length, i);
            }

            if (i < messages.length) {
                // Optimized delays: faster processing for all sizes
                const delay = messages.length < 50 ? 5 : messages.length < 200 ? 10 : 15;
                setTimeout(createChunk, delay);
            } else {
                // Complete processing
                const totalTime = performance.now() - startTime;
                console.log(`✅ [${getTimeStamp()}] Processing completed in ${totalTime.toFixed(2)}ms. Created anchors: ${bookmarkWrappers.length}`);
                console.log(`🔥 ANALYSIS: processed ${messages.length} messages in ${(totalTime/1000).toFixed(1)}s, average ${(totalTime/messages.length).toFixed(2)}ms per message`);

                hideLoader(); // Remove loader only after completion
                hideEmptyState(); // Remove empty state if it was shown

                // Now add ALL anchors to panel at once
                const panelEl = document.querySelector('#shintra-bookmark-panel');
                if (panelEl) {
                    if (bookmarkWrappers.length > 0) {
                        const fragment = document.createDocumentFragment();
                        bookmarkWrappers.forEach(({ wrapper }) => {
                            fragment.appendChild(wrapper);
                        });
                        panelEl.appendChild(fragment);
                        console.log(`🎯 [${getTimeStamp()}] All ${bookmarkWrappers.length} anchors added to panel`);
                    } else {
                        // If no bookmarks were created, show empty state
                        showEmptyState();
                    }
                }

                if (panelEl && panelEl.classList.contains('expanded')) {
                    setTimeout(updateLazyText, 50);
                }
                if (panelEl) {
                    panelEl.scrollTop = panelEl.scrollHeight;
                }

                isProcessing = false; // Remove blocking flag
            }
        }
        createChunk();
    }

    // Main observer: rebuild bookmarks on new/changed messages
    function observeMessages() {
        createBookmarkPanel();

        // Check if there are messages immediately, if not show empty state
        const initialMessages = document.querySelectorAll('div.text-base');
        if (initialMessages.length === 0) {
            showEmptyState();
        } else {
            hideEmptyState(); // Ensure empty state is hidden if there are messages
            showLoader(initialMessages.length, 0); // Show loader on first initialization
        }

        buildBookmarks();

        observer?.disconnect();
        const chatContainer = document.querySelector('main');
        if (chatContainer) {
            let lastMessageCount = 0;
            let debounceTimeout = null;
            let stabilityTimeout = null; // Timer for stability check
            let isFirstLoad = true;
            let isLoadingComplete = false; // Flag for load completion

            observer = new MutationObserver(() => {
                const currentMessages = document.querySelectorAll('div.text-base');

                if (currentMessages.length !== lastMessageCount) {
                    const previousCount = lastMessageCount;
                    lastMessageCount = currentMessages.length;

                    // Show loader when significant increase in message count
                    // This means ChatGPT is loading history
                    if (currentMessages.length > previousCount + 10) {
                        isLoadingComplete = false; // Reset flag on new load
                        showLoader(currentMessages.length, 0);
                        console.log(`⏳ [${getTimeStamp()}] Loader shown - loading ${currentMessages.length} messages (was ${previousCount})`);
                    }

                    isFirstLoad = false;

                    // Reset stability timer on each change
                    if (stabilityTimeout) {
                        clearTimeout(stabilityTimeout);
                    }

                    // Check stability after 300ms - if no more changes, consider loading complete
                    stabilityTimeout = setTimeout(() => {
                        isLoadingComplete = true;
                        console.log(`✅ [${getTimeStamp()}] Loading stabilized at ${currentMessages.length} messages`);
                    }, 300);

                    // Debounce: cancel previous run and schedule new one
                    if (debounceTimeout) {
                        clearTimeout(debounceTimeout);
                    }

                    debounceTimeout = setTimeout(() => {
                        console.log(`🔄 [${getTimeStamp()}] MutationObserver: message count changed to ${currentMessages.length}`);
                        buildBookmarks();
                        debounceTimeout = null;
                    }, 100); // Increase debounce to 100ms to give time to show loader
                }
            });
            observer.observe(chatContainer, { childList: true, subtree: true });
        }
    }

    // Wait for main chat area, then initialize
    const waitForChat = setInterval(() => {
        if (document.querySelector('main')) {
            clearInterval(waitForChat);
            observeMessages();
        }
    }, 1000);

    // Detect chat switch, reinitialize
    let currentPath = location.pathname;
    setInterval(() => {
        if (location.pathname !== currentPath) {
            currentPath = location.pathname;
            uniqueTexts.clear();
            observeMessages();
        }
    }, 500);

})();
