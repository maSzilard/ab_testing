function initTableHeaderSticky() {
    console.log('🚀 initTableHeaderSticky called');

    // Common elements
    const productsHeader = document.querySelector('.woocommerce-products-header');
    const fullProductDetails = document.querySelector('#full-product-details');

    // Desktop elements
    const table = document.querySelector('.which-mesh-category');
    const originalThead = table ? table.querySelector('thead') : null;

    // Mobile elements
    const filterWrapper = document.querySelector('.filter-table-wrapper');
    const productCards = document.querySelector('.product-cards');

    console.log('📦 Elements found:', {
        productsHeader,
        fullProductDetails,
        table,
        originalThead,
        filterWrapper,
        productCards
    });

    if (!productsHeader) {
        console.error('❌ Missing productsHeader');
        return;
    }

    let stickyTheadWrapper = null;
    let lastMode = null;
    let adminBarHeight = 0;

    const adminBar = document.querySelector('#wpadminbar');
    if (adminBar) {
        adminBarHeight = adminBar.offsetHeight;
    }

    // ==================== Visibility check ====================
    function isElementVisible(el) {
        if (!el) return false;
        return el.offsetParent !== null && getComputedStyle(el).display !== 'none';
    }

    // ==================== Class-based toggle ====================
    function activateSticky() {
        document.body.classList.add('sticky-table-active');
        console.log('✅ Sticky activated');
    }

    function deactivateSticky() {
        document.body.classList.remove('sticky-table-active');
        console.log('❌ Sticky deactivated');
    }

    function isStickyActive() {
        return document.body.classList.contains('sticky-table-active');
    }

    // ==================== DESKTOP: Clone thead ====================
    function createStickyThead() {
        if (!originalThead || stickyTheadWrapper) return;

        const clonedThead = originalThead.cloneNode(true);

        stickyTheadWrapper = document.createElement('table');
        stickyTheadWrapper.id = 'sticky-thead-wrapper';
        stickyTheadWrapper.className = table.className;
        stickyTheadWrapper.style.cssText = `
            position: fixed;
            top: ${adminBarHeight}px;
            z-index: 9999;
            margin: 0;
            table-layout: fixed;
            border-collapse: collapse;
        `;
        stickyTheadWrapper.appendChild(clonedThead);
        document.body.appendChild(stickyTheadWrapper);

        connectClonedFilters();
        connectClonedClearButton();

        console.log('✅ Desktop: Sticky thead clone created');
    }

    function connectClonedFilters() {
        if (!stickyTheadWrapper || !originalThead) return;

        const clonedSelects = stickyTheadWrapper.querySelectorAll('select');
        const originalSelects = originalThead.querySelectorAll('select');

        clonedSelects.forEach((clonedSelect, index) => {
            const originalSelect = originalSelects[index];
            if (!originalSelect) return;

            clonedSelect.addEventListener('change', (e) => {
                console.log('🔄 Cloned filter changed:', e.target.value);
                originalSelect.value = e.target.value;
                originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
            });

            originalSelect.addEventListener('change', () => {
                clonedSelect.value = originalSelect.value;
            });
        });

        console.log('✅ Cloned filters connected:', clonedSelects.length);
    }

    function connectClonedClearButton() {
        if (!stickyTheadWrapper) return;

        const clonedClearBtn = stickyTheadWrapper.querySelector('#clear_all_filters');
        const originalClearBtn = document.querySelector('.which-mesh-category thead #clear_all_filters');

        if (!clonedClearBtn || !originalClearBtn) {
            console.log('⚠️ Clear button not found');
            return;
        }

        //cloned clear button style 
        clonedClearBtn.style.cssText = `
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 3px 6px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 600;
            transition: all 0.3s ease;
            white-space: nowrap;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 14px;
        `;

        // Give cloned button unique ID to avoid conflicts
        clonedClearBtn.id = 'clear_all_filters_clone';

        // Click clone → trigger original
        clonedClearBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🧹 Cloned clear button clicked');
            originalClearBtn.click();
        });

        // style cloned clear button x icon
        clonedClearBtn.style.cssText = `
            font-size: 12px;
            font-weight: bold;
            line-height: 1.2;
            margin-left: 3px;
        `;

        // Sync visibility
        function syncClearButtonVisibility() {
            clonedClearBtn.style.display = getComputedStyle(originalClearBtn).display;
        }

        // Watch for original button visibility changes
        const observer = new MutationObserver(syncClearButtonVisibility);
        observer.observe(originalClearBtn, { attributes: true, attributeFilter: ['style'] });

        // Initial sync
        syncClearButtonVisibility();

        console.log('✅ Clear button connected');
    }

    function updateDesktopStickyPosition() {
        if (!stickyTheadWrapper || !table) return;

        const tableRect = table.getBoundingClientRect();
        stickyTheadWrapper.style.left = `${tableRect.left}px`;
        stickyTheadWrapper.style.width = `${tableRect.width}px`;

        const originalCells = originalThead.querySelectorAll('th, td');
        const clonedCells = stickyTheadWrapper.querySelectorAll('th, td');
        originalCells.forEach((cell, index) => {
            if (clonedCells[index]) {
                clonedCells[index].style.width = `${cell.offsetWidth}px`;
            }
        });
    }

    // ==================== MOBILE: Fixed filter wrapper ====================
    function updateMobileStickyPosition() {
        if (!filterWrapper) return;

        // Create placeholder to prevent content jump
        if (!document.getElementById('filter-placeholder')) {
            const placeholder = document.createElement('div');
            placeholder.id = 'filter-placeholder';
            placeholder.style.height = filterWrapper.offsetHeight + 'px';
            filterWrapper.parentNode.insertBefore(placeholder, filterWrapper);
        }

        filterWrapper.style.position = 'fixed';
        filterWrapper.style.top = '0';
        filterWrapper.style.left = '0';
        filterWrapper.style.zIndex = '9999';
        filterWrapper.style.margin = '0 15px';
        filterWrapper.style.width = 'calc(100% - 30px)';
        filterWrapper.style.background = '#fff';
    }

    function resetMobileSticky() {
        if (!filterWrapper) return;

        // Remove placeholder
        const placeholder = document.getElementById('filter-placeholder');
        if (placeholder) placeholder.remove();

        filterWrapper.style.position = '';
        filterWrapper.style.top = '';
        filterWrapper.style.left = '';
        filterWrapper.style.width = '';
        filterWrapper.style.zIndex = '';
        filterWrapper.style.margin = '';
        filterWrapper.style.background = '';
    }

    // ==================== Reset ====================
    function resetAll() {
        deactivateSticky();
        resetMobileSticky();
        lastMode = null;
        console.log('🔄 Reset all');
    }

    // ==================== Main scroll handler ====================
    function handleScroll() {
        const windowWidth = window.innerWidth;
        const isMobile = windowWidth < 1024;
        const isDesktop = windowWidth >= 1024;
        const currentMode = isMobile ? 'mobile' : 'desktop';

        if (!currentMode) {
            console.log('⚠️ No visible view');
            return;
        }

        // View changed - reset
        if (lastMode !== null && lastMode !== currentMode) {
            console.log('📱↔️🖥️ View changed:', lastMode, '→', currentMode);
            resetAll();
        }
        lastMode = currentMode;

        // Get trigger elements
        let startElement, endElement;
        if (isMobile) {
            startElement = productCards;
            endElement = fullProductDetails;
        } else {
            startElement = originalThead;
            endElement = fullProductDetails;
        }

        if (!startElement || !endElement) return;

        const startRect = startElement.getBoundingClientRect();
        const endRect = endElement.getBoundingClientRect();

        const hasLeftStart = startRect.top <= adminBarHeight;
        const hasReachedEnd = endRect.top <= adminBarHeight;
        const shouldBeSticky = hasLeftStart && !hasReachedEnd;

        // console.log('📍 Scroll:', { currentMode, hasLeftStart, hasReachedEnd, shouldBeSticky });

        if (shouldBeSticky && !isStickyActive()) {
            activateSticky();
            if (isMobile) {
                updateMobileStickyPosition();
            } else {
                updateDesktopStickyPosition();
            }
        } else if (!shouldBeSticky && isStickyActive()) {
            deactivateSticky();
            if (isMobile) {
                resetMobileSticky();
            }
        } else if (shouldBeSticky) {
            // Update position while sticky
            if (isMobile) {
                updateMobileStickyPosition();
            } else {
                updateDesktopStickyPosition();
            }
        }
    }

    // ==================== Loader ====================
    let loaderOverlay = null;

    function createLoader() {
        if (loaderOverlay) return;
        loaderOverlay = document.createElement('div');
        loaderOverlay.className = 'filter-loader-overlay';
        loaderOverlay.innerHTML = '<div class="filter-loader-spinner"></div>';
        document.body.appendChild(loaderOverlay);
    }

    function showLoader() {
        if (!loaderOverlay) createLoader();
        loaderOverlay.classList.add('active');
        console.log('⏳ Loader shown');
    }

    function hideLoader() {
        if (loaderOverlay) {
            loaderOverlay.classList.remove('active');
        }
        console.log('✅ Loader hidden');
    }

    // ==================== Smooth scroll with custom duration ====================
    function smoothScrollTo(targetY, duration) {
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        if (Math.abs(diff) < 1) return;

        let startTime = null;

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            window.scrollTo(0, startY + diff * easeInOutCubic(progress));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // ==================== Scroll to filter top ====================
    function scrollToFilterTop() {
        // Use productsHeader bottom as the scroll target for both mobile and desktop
        const targetEl = productsHeader;

        if (targetEl) {
            const offset = adminBarHeight;
            const targetTop = targetEl.getBoundingClientRect().bottom + window.pageYOffset - offset;
            smoothScrollTo(targetTop, 800);
            console.log('📍 Scrolled to productsHeader bottom');
        }
    }

    // ==================== Filter change handler ====================
    function onFilterUsed() {
        showLoader();

        let scrollHandled = false;

        function doScroll() {
            if (scrollHandled) return;
            scrollHandled = true;

            // Show loader briefly before scrolling
            setTimeout(() => {
                scrollToFilterTop();
                setTimeout(hideLoader, 900);
            }, 400);
        }

        const productContainer = document.querySelector('.which-mesh-category tbody')
            || document.querySelector('.which-mesh-category-form');

        if (productContainer) {
            const observer = new MutationObserver(() => {
                observer.disconnect();
                doScroll();
            });
            observer.observe(productContainer, { childList: true, subtree: true });

            // Fallback timeout in case mutation never fires
            setTimeout(() => {
                observer.disconnect();
                doScroll();
            }, 500);
        } else {
            doScroll();
        }
    }

    function connectFilterScrolling() {
        // Listen on all original filter selects (both desktop thead and mobile filterWrapper)
        const allFilterSelects = document.querySelectorAll(
            '.which-mesh-category thead select, .filter-table-wrapper select'
        );

        allFilterSelects.forEach((select) => {
            select.addEventListener('change', () => {
                console.log('🔄 Filter used, showing loader and preparing scroll');
                onFilterUsed();
            });
        });

        // Also listen on the clear button
        const clearBtn = document.querySelector('#clear_all_filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                console.log('🧹 Clear filters used, showing loader and preparing scroll');
                onFilterUsed();
            });
        }

        console.log('✅ Filter scroll listeners connected:', allFilterSelects.length, 'selects');
    }

    // ==================== Initialize ====================
    createStickyThead();
    createLoader();
    connectFilterScrolling();

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    handleScroll();
}

// Prevent double init
let initialized = false;

document.addEventListener('DOMContentLoaded', () => {
    if (!initialized) {
        initialized = true;
        initTableHeaderSticky();
    }
});

window.addEventListener('load', () => {
    if (!initialized) {
        initialized = true;
        setTimeout(initTableHeaderSticky, 100);
    }
});