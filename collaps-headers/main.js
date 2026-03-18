(function () {
    'use strict';

    // Guard against VWO re-execution
    if (window._vwoJumplinks) return;
    window._vwoJumplinks = true;

    // ── Inject CSS (survives VWO re-evaluation) ──
    var style = document.createElement('style');
    style.textContent = '' +
        '.vwo-jumplinks {' +
        '  display: flex;' +
        '  gap: 10px;' +
        '  justify-content: center;' +
        '  margin: 15px 0 20px;' +
        '  flex-wrap: wrap;' +
        '  position: relative;' +
        '}' +
        '.vwo-jumplinks::after {' +
        '  content: "";' +
        '  position: absolute;' +
        '  width: calc(100% - 20px);' +
        '  height: 1px;' +
        '  top: 50%;' +
        '  left: 50%;' +
        '  transform: translateX(-50%);' +
        '  background-color: #c1c1c1;' +
        '  z-index: 0;' +
        '}' +
        '.vwo-jumplinks__btn {' +
        '  display: inline-flex;' +
        '  align-items: center;' +
        '  gap: 6px;' +
        '  background: #ffffff;' +
        '  border: 1px solid #c1c1c1;' +
        '  padding: 5px 25px;' +
        '  color: #035aba;' +
        '  font-size: 14px;' +
        '  font-weight: 600;' +
        '  cursor: pointer;' +
        '  transition: color 0.2s ease;' +
        '  text-decoration: none;' +
        '  font-family: inherit;' +
        '  z-index: 55;' +
        '}' +
        '.vwo-jumplinks__btn:hover {' +
        '  background: #ffffff !important;' +
        '  color: #029a3b !important;' +
        '}' +
        '.vwo-jumplinks__btn:active,' +
        '.vwo-jumplinks__btn:focus,' +
        '.vwo-jumplinks__btn:visited,' +
        '.vwo-jumplinks__btn.active {' +
        '  color: #035aba !important;' +
        '  background: #ffffff !important;' +
        '  outline: none;' +
        '}' +
        '@media (max-width: 768px) {' +
        '  .vwo-jumplinks {' +
        '    gap: 8px;' +
        '    margin: 10px 0 15px;' +
        '  }' +
        '  .vwo-jumplinks__btn {' +
        '    padding: 8px 14px;' +
        '    font-size: 13px;' +
        '    flex: 1 1 auto;' +
        '    justify-content: center;' +
        '    min-width: 0;' +
        '  }' +
        '}' +
        '@media (max-width: 420px) {' +
        '  .vwo-jumplinks {' +
        '    flex-wrap: nowrap;' +
        '  }' +
        '  .vwo-jumplinks__btn {' +
        '    padding: 5px 10px;' +
        '    font-size: 12px;' +
        '    white-space: nowrap;' +
        '  }' +
        '}';
    document.head.appendChild(style);

    // ── SVG icons ──
    var arrowDownSvg = '<i class="fa fa-chevron-down" aria-hidden="true"></i>';

    // ── Button config ──
    var buttons = [
        { label: 'Help', icon: arrowDownSvg, target: 'info' },
        { label: 'Videos', icon: arrowDownSvg, target: 'videos' },
        { label: 'Customer Images', icon: arrowDownSvg, target: 'images' }
    ];

    // ── Find target sections ──
    function findSectionByHeadingText(text) {
        var headings = document.querySelectorAll('h3');
        for (var i = 0; i < headings.length; i++) {
            var h = headings[i];
            // Check text content without the collapse button text
            var clone = h.cloneNode(true);
            var btn = clone.querySelector('.collapse-btn');
            if (btn) btn.remove();
            var headingText = clone.textContent.trim().toLowerCase();
            if (headingText.indexOf(text.toLowerCase()) !== -1) {
                return h;
            }
        }
        return null;
    }

    function findInfoSection() {
        // The info/bottom section — look for page-description-bottom or the last
        // content section after customer images
        var bottomDesc = document.querySelector('.page-description-bottom');
        if (bottomDesc) return bottomDesc;

        // Fallback: find the section after customer images heading
        var imagesH3 = findSectionByHeadingText('customer images');
        if (imagesH3) {
            // Walk siblings to find the next major section
            var sibling = imagesH3.nextElementSibling;
            while (sibling) {
                if (sibling.tagName === 'H3' || sibling.classList.contains('download-block')) {
                    return sibling;
                }
                sibling = sibling.nextElementSibling;
            }
        }

        // Last fallback: download block or footer area
        return document.querySelector('.download-block') ||
            document.querySelector('#full-product-details');
    }

    function getTargetElement(targetKey) {
        switch (targetKey) {
            case 'videos': return findSectionByHeadingText('videos');
            case 'images': return findSectionByHeadingText('customer images');
            case 'info': return findInfoSection();
            default: return null;
        }
    }

    // ── Open collapsed section if needed ──
    function openIfCollapsed(headingEl) {
        if (!headingEl || !headingEl.classList.contains('closed')) return;

        // Simulate a click to open — this works with the existing collapse logic
        headingEl.click();
    }

    // ── Smooth scroll to element ──
    function scrollToElement(el) {
        if (!el) return;

        var headerOffset = 130; // account for sticky header + 50px extra
        var elementTop = el.getBoundingClientRect().top + window.pageYOffset;
        var offsetPosition = elementTop - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // ── Handle button click ──
    function handleJumpClick(targetKey) {
        var target = getTargetElement(targetKey);
        if (!target) {
            console.log('[VWO Jumplinks] Target not found:', targetKey);
            return;
        }

        // For Videos and Customer Images, open the collapsible if closed
        if (targetKey === 'videos' || targetKey === 'images') {
            openIfCollapsed(target);
            // Small delay to let the collapse animation start, then scroll
            setTimeout(function () {
                scrollToElement(target);
            }, 100);
        } else {
            scrollToElement(target);
        }
    }

    // ── Build jumplinks bar ──
    function createJumplinksBar() {
        if (document.querySelector('.vwo-jumplinks')) return;

        var container = document.createElement('div');
        container.className = 'vwo-jumplinks';

        buttons.forEach(function (btnConfig) {
            // Hide button if its target section doesn't exist on the page
            var targetEl = getTargetElement(btnConfig.target);
            if (!targetEl) return;

            var btn = document.createElement('button');
            btn.className = 'vwo-jumplinks__btn';
            btn.innerHTML = btnConfig.label + ' ' + btnConfig.icon;
            btn.setAttribute('data-target', btnConfig.target);

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                handleJumpClick(btnConfig.target);
            });

            container.appendChild(btn);
        });

        // Don't return the bar if no buttons were added
        if (container.children.length === 0) return;

        return container;
    }

    // ── Insert jumplinks into page ──
    function init() {
        // Only proceed if the anchor element exists
        var anchor = document.querySelector('.product-details-link');
        if (!anchor) {
            console.log('[VWO Jumplinks] No .product-details-link found, skipping');
            return;
        }

        var bar = createJumplinksBar();
        if (bar) {
            anchor.parentNode.insertBefore(bar, anchor.nextSibling);
            // Hide the original product-details-link
            anchor.style.display = 'none';
        } else {
            // No jumplinks created — reveal the original button
            anchor.style.visibility = 'visible';
            anchor.style.display = '';
        }
    }

    // ── Wait for DOM elements and initialize ──
    function waitAndInit() {
        var detailsLink = document.querySelector('.product-details-link');

        if (detailsLink) {
            init();
            return;
        }

        // Wait for document.body to exist before observing
        var root = document.body || document.documentElement;
        if (!root) {
            document.addEventListener('DOMContentLoaded', waitAndInit);
            return;
        }

        var observer = new MutationObserver(function () {
            if (document.querySelector('.product-details-link')) {
                observer.disconnect();
                init();
            }
        });

        observer.observe(root, { childList: true, subtree: true });

        // Safety timeout
        setTimeout(function () {
            observer.disconnect();
            init(); // Try anyway
        }, 5000);
    }

    waitAndInit();
})();
