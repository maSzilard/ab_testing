(function () {
    // Inject CSS from JS so it survives VWO re-execution
    // (external CSS file gets removed on re-run — see old-stiky.js comment)
    if (!document.getElementById('vwo-sticky-header-style')) {
        var s = document.createElement('style');
        s.id = 'vwo-sticky-header-style';
        s.textContent = '@media (max-width: 768px) {'
            + '.woocommerce-products-header{visibility:hidden}'
            + '.vwo-initialized .woocommerce-products-header{visibility:visible}'
            + '#main-content header.woocommerce-products-header h1{margin-bottom:0}'
            + '.header-toggle-container{overflow:hidden;max-height:0;transition:max-height 0.4s ease-out}'
            + '.header-toggle-container.is-open{max-height:2000px}'
            + '.header-toggle-arrow{display:inline-block;font-size:18px;margin-left:5px;transition:transform 0.3s ease}'
            + '}';
        document.head.appendChild(s);
    }

    if (window._vwoStickyHeader) return;
    window._vwoStickyHeader = true;

    var isInitialized = false;

    function shouldRunOnMobile() {
        return window.innerWidth <= 768;
    }

    // Helper: Wait for multiple elements before running logic
    function waitForElements(selectors, callback) {
        var observer = new MutationObserver(function () {
            var allFound = selectors.every(function (sel) { return document.querySelector(sel); });
            if (allFound) {
                observer.disconnect();
                callback();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Fallback for elements already in DOM
        if (selectors.every(function (sel) { return document.querySelector(sel); })) {
            observer.disconnect();
            callback();
        }

        // Safety timeout (5s)
        setTimeout(function () {
            observer.disconnect();
            document.body.classList.add('vwo-initialized');
        }, 5000);
    }

    function initCollapse() {
        if (isInitialized || document.querySelector('.header-toggle-arrow')) {
            document.body.classList.add('vwo-initialized');
            return;
        }

        var headerTop = document.querySelector('.page-header-top');
        var desc = document.querySelector('.description-holder');
        var slider = document.querySelector('.slider-holder');

        if (!headerTop || !desc) {
            document.body.classList.add('vwo-initialized');
            return;
        }

        // Setup chevron arrow
        headerTop.style.cssText += 'cursor:pointer;display:flex;align-items:center;justify-content:center;';
        if (!document.querySelector('.header-toggle-arrow')) {
            headerTop.insertAdjacentHTML('beforeend', '<i class="header-toggle-arrow fa fa-chevron-down" aria-hidden="true" style="font-size:18px;margin-left:5px;"></i>');
        }

        var productDetailsLink = desc.querySelector('.product-details-link');
        if (productDetailsLink) {
            desc.parentNode.insertBefore(productDetailsLink, desc.nextSibling);
            productDetailsLink.style.marginBottom = '2em';
        }

        // Wrap contents
        var wrapper = document.createElement('div');
        wrapper.className = 'header-toggle-container';
        desc.parentNode.insertBefore(wrapper, desc);
        if (slider) wrapper.appendChild(slider);
        wrapper.appendChild(desc);

        isInitialized = true;
        document.body.classList.add('vwo-initialized');

        // Pin visibility inline so VWO re-execution (which temporarily removes vwo-initialized)
        // can't cause a 1-second invisible flash
        var productsHeader = document.querySelector('.woocommerce-products-header');
        if (productsHeader) productsHeader.style.visibility = 'visible';

        var arrow = headerTop.querySelector('.header-toggle-arrow');
        headerTop.addEventListener('click', function (e) {
            e.preventDefault();
            var isOpen = wrapper.classList.contains('is-open');

            if (isOpen) {
                wrapper.classList.remove('is-open');
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            } else {
                wrapper.classList.add('is-open');
                if (arrow) arrow.style.transform = 'rotate(180deg)';

                // Refresh Slick sliders once open
                setTimeout(function () {
                    if (window.jQuery && window.jQuery.fn.slick) {
                        var $ = window.jQuery;
                        $('.info-holder .category-slider-main, .info-holder .category-slider-bottom').each(function () {
                            if ($(this).hasClass('slick-initialized')) $(this).slick('refresh');
                        });
                    }
                }, 400); // Wait for CSS transition
            }
        });
    }

    function cleanup() {
        var arrow = document.querySelector('.header-toggle-arrow');
        var wrapper = document.querySelector('.header-toggle-container');
        var headerTop = document.querySelector('.page-header-top');

        if (arrow) arrow.remove();
        if (headerTop) {
            headerTop.style.cssText = '';
            // Note: In modern JS, removing the element or its parent usually cleans listeners, 
            // but if we were strictly using `onclick`, setting it to null would be needed.
        }

        if (wrapper) {
            var slider = wrapper.querySelector('.slider-holder');
            var desc = wrapper.querySelector('.description-holder');
            var productDetailsLink = wrapper.parentNode.querySelector(':scope > .product-details-link');

            if (desc) {
                wrapper.parentNode.insertBefore(desc, wrapper);
                desc.style.cssText = '';
                if (productDetailsLink) {
                    productDetailsLink.style.marginBottom = '';
                    desc.appendChild(productDetailsLink);
                }
            }
            if (slider) wrapper.parentNode.insertBefore(slider, wrapper);
            wrapper.remove();
        }

        document.body.classList.remove('vwo-initialized');
        isInitialized = false;
    }

    // Bootstrap
    if (shouldRunOnMobile()) {
        waitForElements(['.page-header-top', '.description-holder'], initCollapse);
    }

    var resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            if (!shouldRunOnMobile() && isInitialized) cleanup();
            else if (shouldRunOnMobile() && !isInitialized) waitForElements(['.page-header-top', '.description-holder'], initCollapse);
        }, 250);
    });
})();