(function () {
    let resizeTimeout;
    let isInitialized = false;

    function shouldRunOnMobile() {
        return window.innerWidth <= 768;
    }

    function initCollapse() {
        if (isInitialized || document.querySelector('.header-toggle-arrow')) {
            return;
        }

        if (!shouldRunOnMobile()) {
            return;
        }

        // Add toggle arrow to page-header-top
        const headerTop = document.querySelector('.page-header-top');
        if (!headerTop) return;

        headerTop.style.cssText += 'cursor:pointer;display:flex;align-items:center;justify-content:center;';
        headerTop.insertAdjacentHTML('beforeend', '<i class="header-toggle-arrow fa fa-chevron-down" aria-hidden="true" style="font-size: 18px; transition: transform 0.3s ease; margin-left: 5px;"></i>');

        // Wrap and hide containers
        const slider = document.querySelector('.slider-holder');
        const desc = document.querySelector('.description-holder');
        if (!desc) return;

        // Move product-details-link out of description-holder so it stays visible
        const productDetailsLink = desc.querySelector('.product-details-link');
        if (productDetailsLink) {
            desc.parentNode.insertBefore(productDetailsLink, desc.nextSibling);
            productDetailsLink.style.marginBottom = '2em';
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'header-toggle-container';
        wrapper.style.display = 'none';

        desc.parentNode.insertBefore(wrapper, desc);
        if (slider) wrapper.append(slider);
        wrapper.append(desc);

        isInitialized = true;

        const arrow = headerTop.querySelector('.header-toggle-arrow');

        // Toggle functionality - clicking on page-header-top
        headerTop.onclick = e => {
            e.preventDefault();

            // Rotate arrow immediately at click so it animates with the slider
            if (arrow) {
                const isOpen = $(wrapper).is(':visible');
                arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }

            $(wrapper).slideToggle('slow', function () {
                // Refresh Slick slider after animation completes
                if (slider && window.$ && window.$.fn.slick) {
                    const mainSlider = document.querySelector('.info-holder .category-slider-main');
                    const bottomSlider = document.querySelector('.info-holder .category-slider-bottom');
                    if (mainSlider && window.$(mainSlider).hasClass('slick-initialized')) {
                        window.$(mainSlider).slick('refresh');
                    }
                    if (bottomSlider && window.$(bottomSlider).hasClass('slick-initialized')) {
                        window.$(bottomSlider).slick('refresh');
                    }
                }
            });
        };

        // Reveal the header now that collapse is set up — no more jumping
        const productsHeader = document.querySelector('.woocommerce-products-header');
        if (productsHeader) {
            productsHeader.style.visibility = 'visible';
        }
    }

    function cleanup() {
        const arrow = document.querySelector('.header-toggle-arrow');
        const wrapper = document.querySelector('.header-toggle-container');
        const headerTop = document.querySelector('.page-header-top');

        if (arrow) arrow.remove();
        if (headerTop) {
            headerTop.style.cssText = '';
            headerTop.onclick = null;
        }
        if (wrapper) {
            const slider = wrapper.querySelector('.slider-holder');
            const desc = wrapper.querySelector('.description-holder');
            // Move product-details-link back into description-holder
            const productDetailsLink = wrapper.parentNode.querySelector(':scope > .product-details-link');
            if (desc) {
                wrapper.parentNode.insertBefore(desc, wrapper);
                desc.style.cssText = '';
                if (productDetailsLink) {
                    productDetailsLink.style.marginBottom = '';
                    desc.appendChild(productDetailsLink);
                }
            }
            if (slider) {
                wrapper.parentNode.insertBefore(slider, wrapper);
                slider.style.cssText = '';
            }
            wrapper.remove();
        }

        isInitialized = false;
    }

    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (!shouldRunOnMobile() && isInitialized) {
                // Desktop size - cleanup mobile changes
                cleanup();
            } else if (shouldRunOnMobile() && !isInitialized) {
                // Mobile size - initialize
                initCollapse();
            }
        }, 250); // Faster debounce (was 2500ms)
    }

    // Hide header immediately on mobile to prevent layout jump before VWO runs
    if (shouldRunOnMobile()) {
        const productsHeader = document.querySelector('.woocommerce-products-header');
        if (productsHeader) {
            productsHeader.style.visibility = 'hidden';
        }
    }

    initCollapse();

    // Handle resize events
    window.addEventListener('resize', handleResize);
})();
