(function () {
    'use strict';

    if (!$('body').hasClass('tax-product_cat')) return;

    // Filter settings - set via VWO or defaults (same as table filtering)
    let allowZeroResults = (window.airaFilterConfig && window.airaFilterConfig.allowZeroResults != null) ? window.airaFilterConfig.allowZeroResults : false;
    let showFilterCounts = (window.airaFilterConfig && window.airaFilterConfig.showFilterCounts != null) ? window.airaFilterConfig.showFilterCounts : true;
    let enableMultiSelect = (window.airaFilterConfig && window.airaFilterConfig.enableMultiSelect != null) ? window.airaFilterConfig.enableMultiSelect : false;

    console.log('🔧 MOBILE CARDS - AIRA Filter Config:', {
        allowZeroResults,
        showFilterCounts,
        enableMultiSelect,
        fullConfig: window.airaFilterConfig
    });

    // Function to refresh config values (can be called after VWO updates)
    function refreshMobileCardsFilterConfig() {
        const oldAllowZeroResults = allowZeroResults;
        const oldShowFilterCounts = showFilterCounts;
        const oldEnableMultiSelect = enableMultiSelect;

        allowZeroResults = (window.airaFilterConfig && window.airaFilterConfig.allowZeroResults != null) ? window.airaFilterConfig.allowZeroResults : false;
        showFilterCounts = (window.airaFilterConfig && window.airaFilterConfig.showFilterCounts != null) ? window.airaFilterConfig.showFilterCounts : true;
        enableMultiSelect = (window.airaFilterConfig && window.airaFilterConfig.enableMultiSelect != null) ? window.airaFilterConfig.enableMultiSelect : false;

        console.log('🔄 MOBILE CARDS - Filter Config Refreshed:', {
            allowZeroResults,
            showFilterCounts,
            enableMultiSelect,
            changed: oldAllowZeroResults !== allowZeroResults || oldShowFilterCounts !== showFilterCounts || oldEnableMultiSelect !== enableMultiSelect
        });

        // If enableMultiSelect was just turned on, do a full teardown + re-init
        if (!oldEnableMultiSelect && enableMultiSelect) {
            console.log('🔄 MOBILE CARDS - enableMultiSelect changed to true — full re-init');
            const existingLayout = document.querySelector('.mobile-layout');
            if (existingLayout) {
                existingLayout.remove();
            }
            initMobileCards();
            return;
        }

        // If config changed and mobile layout exists, update the filter counts
        if ((oldAllowZeroResults !== allowZeroResults || oldShowFilterCounts !== showFilterCounts || oldEnableMultiSelect !== enableMultiSelect)) {
            const mobileLayout = document.querySelector('.mobile-layout');
            if (mobileLayout && window.updateMobileFilterCountsGlobal) {
                window.updateMobileFilterCountsGlobal();
            }
        }
    }

    // Expose refresh function globally so VWO can call it
    window.airaRefreshMobileCardsFilterConfig = refreshMobileCardsFilterConfig;

    // Gabion slugs (keep in sync with PHP GABION_SLUGS constant)
    const GABION_SLUGS = [
        'all-gabions-in-stock',
        'build-your-own-custom-gabion',
        'stone',
        'stone/calculator',
        'gabion-planters',
        'bench',
        'accessories/helicals',
        'accessories/panel',
        'accessories/geotextile',
        'accessories/corner-ties',
        'accessories/tying-wire',
        'accessories/clips',
        'wall/1m-gabion-wall',
        'wall/2m-gabion-wall',
        'gabion-mattress',
        'sea-defence',
        'next-day-delivery'
    ];

    // Do not run this code on any gabion slug page
    const currentPath = window.location.pathname.replace(/\/+$/, '');
    const isGabionCategory = GABION_SLUGS.some(slug => currentPath.endsWith(`/gabion/${slug}`));

    // Only hide table / show mobile layout when actually in mobile view (e.g. after resize or initial load).
    // This avoids hiding the desktop table so aira multiselect open works on desktop.
    function applyMobileDesktopVisibility() {
        if (window.innerWidth <= 1024) {
            $('.mobile-layout').css('display', 'block');
            $('.which-mesh-category').css('display', 'none');
            $('.mobile-scroll').css('display', 'none');
            $('.table-wrapper1').css('display', 'none');
        } else {
            $('.which-mesh-category').css('display', '');
            $('.mobile-scroll').css('display', '');
            $('.table-wrapper1').css('display', '');
            $('.mobile-layout').css('display', '');
        }
    }
    if (isGabionCategory) {
        return;
    } else {
        applyMobileDesktopVisibility();
    }

    // Wait for DOM and table to be ready
    function waitForElement(selector, callback) {
        if (document.querySelector(selector)) {
            callback();
        } else {
            setTimeout(() => waitForElement(selector, callback), 100);
        }
    }

    // Check if mobile device or small screen
    function isMobileView() {
        return window.innerWidth <= 1024;
    }

    // Normalize filter value for consistent comparisons
    function normalizeFilterValue(value) {
        if (!value) return value;

        return value
            .toLowerCase()
            .replace(/"/g, '') // Remove quotes
            .replace(/\s*\/\s*/g, '/') // Normalize slashes
            .replace(/\s+/g, ' ') // Single spaces
            .trim();
    }

    // Normalize attribute name to match column keys
    function normalizeAttributeName(attrName) {
        const normalized = attrName
            .toLowerCase()
            .replace(/\s*\(.*?\)/g, '') // Remove (parentheses)
            .replace(/[^a-z0-9]+/g, '_') // Non-alphanum to _
            .replace(/^_+|_+$/g, '') // Trim underscores
            .replace(/_+/g, '_');

        // Apply custom mappings (same as getTableColumnConfig)
        if (normalized.includes('coating') || attrName.toLowerCase().includes('coating')) {
            return 'coating';
        }
        if (normalized.includes('hole') || normalized.includes('aperture') ||
            attrName.toLowerCase().includes('hole size') || attrName.toLowerCase().includes('aperture')) {
            return 'holeSize';
        }
        if (normalized.includes('depth') || attrName.toLowerCase().includes('depth')) {
            return 'depth';
        }
        if (normalized.includes('height') || attrName.toLowerCase().includes('height')) {
            return 'height';
        }
        if (normalized.includes('length') || attrName.toLowerCase().includes('length')) {
            return 'length';
        }
        if (normalized.includes('wire') || normalized.includes('diameter') || normalized.includes('gauge') ||
            attrName.toLowerCase().includes('wire diameter') || attrName.toLowerCase().includes('gauge')) {
            return 'wireDiameter';
        }

        // Convert to camelCase for other attributes
        return normalized.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    }

    // Get column configuration dynamically from table headers
    function getTableColumnConfig() {
        const headerCells = document.querySelectorAll('.which-mesh-category thead th');
        const columns = [];
        const headers = [];
        const cellIndexMap = {};
        headerCells.forEach((th, idx) => {
            let headerText = th.textContent.trim();
            let key = headerText
                .toLowerCase()
                .replace(/\s*\(.*?\)/g, '') // Remove (parentheses)
                .replace(/[^a-z0-9]+/g, '_') // Non-alphanum to _
                .replace(/^_+|_+$/g, '') // Trim underscores
                .replace(/_+/g, '_');
            // Custom mapping for common columns
            if (headerText.toLowerCase().includes('coating')) key = 'coating';
            if (headerText.toLowerCase().includes('hole size') || headerText.toLowerCase().includes('aperture')) key = 'holeSize';
            if (headerText.toLowerCase().includes('depth')) key = 'depth';
            if (headerText.toLowerCase().includes('height')) key = 'height';
            if (headerText.toLowerCase().includes('length')) key = 'length';
            if (headerText.toLowerCase().includes('wire diameter') || headerText.toLowerCase().includes('gauge')) key = 'wireDiameter';
            if (headerText.toLowerCase().includes('quantity in box')) key = 'quantityInBox';
            if (headerText.toLowerCase() === 'quantity') key = 'quantity';
            if (headerText.toLowerCase().includes('price')) key = 'price';

            // Skip non-filterable columns
            const skipKeys = ['quantity', 'price', 'name', 'image', 'add_to_cart', 'product'];
            const shouldSkip = skipKeys.includes(key);

            if (shouldSkip) {
                return;
            }

            columns.push(key);
            headers.push(headerText);
            cellIndexMap[key] = idx;
        });
        return { columns, headers, cellIndexMap };
    }

    // Helper functions for cross-sells
    const formatPrice = function (price) {
        let num = parseFloat(price);
        return num % 1 === 0 ? num.toFixed(2) : num.toString().includes('.') ? num.toString().padEnd(num.toString().indexOf('.') + 3, '0') : num.toFixed(2);
    };

    const utils = {
        waitForSwiper: function (callback) {
            let timeout = setTimeout(function () {
                if (typeof window.Swiper !== 'function') {
                    utils.waitForSwiper(callback);
                } else {
                    clearTimeout(timeout);
                    callback();
                }
            }, 100);
        },
        addSwiper: function () {
            if (typeof window.jQuery !== 'undefined') {
                if (typeof window.Swiper !== 'function') {
                    jQuery('<link/>', {
                        rel: 'stylesheet',
                        type: 'text/css',
                        href: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'
                    }).appendTo('head');

                    jQuery('<script/>', {
                        type: 'text/javascript',
                        src: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
                    }).appendTo('head');
                }
            }
        }
    };

    // ============================================
    // HASH/URL FILTER PARAMETER HANDLING FOR MOBILE CARDS
    // ============================================

    // Parse a raw filter string into params.
    // Format: attribute:value1|value2,attribute2:value3
    // Always returns arrays for consistency.
    function parseMobileFilterString(filterString) {
        const params = {};
        if (!filterString) {
            return params;
        }

        const decodedFilterString = decodeURIComponent(filterString);
        const filters = decodedFilterString.split(',');

        filters.forEach((filter) => {
            const parts = filter.split(':');
            if (parts.length !== 2) {
                return;
            }

            const attr = parts[0].trim();
            const values = parts[1].trim();
            const normalizedAttr = normalizeAttributeName(attr);

            if (!normalizedAttr) {
                return;
            }

            if (values.includes('|')) {
                params[normalizedAttr] = values.split('|').map((v) => v.trim()).filter(Boolean);
            } else if (values) {
                params[normalizedAttr] = [values];
            }
        });

        return params;
    }

    // Parse filter parameters from URL hash
    function parseMobileFilterParams() {
        let filterString = '';

        console.log('🔍 [MOBILE] parseFilterParams - Starting...');
        console.log('Current URL:', window.location.href);
        console.log('Hash:', window.location.hash);

        // Check for hash-based parameters (#?filter=)
        const hash = window.location.hash;
        if (hash && hash.includes('?filter=')) {
            filterString = hash.split('?filter=')[1];
            console.log('✅ [MOBILE] Found hash filter string:', filterString);
        }

        if (filterString) {
            console.log('📝 [MOBILE] Raw filter string:', filterString);
            console.log('📝 [MOBILE] Decoded filter string:', decodeURIComponent(filterString));
        }

        const params = parseMobileFilterString(filterString);
        console.log('✅ [MOBILE] Final parsed params:', params);
        return params;
    }

    // Update URL hash based on active mobile filters
    function updateMobileURLHash(container) {
        if (!isMobileView()) {
            console.log('⚠️ [MOBILE] Not in mobile view, skipping hash update');
            return;
        }

        const currentScrollY = window.pageYOffset;
        const activeFilters = [];

        const filterSelects = container.querySelectorAll('.filter-select');
        filterSelects.forEach((select) => {
            const value = select.value;
            const filterType = select.getAttribute('data-filter-type');

            if (value !== '') {
                activeFilters.push(filterType + ':' + value);
            }
        });

        console.log('🔗 [MOBILE] Active filters for hash:', activeFilters);

        if (activeFilters.length > 0) {
            const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
            const newUrl = baseUrl + '#?filter=' + activeFilters.join(',');
            console.log('🔗 [MOBILE] Updating hash to:', newUrl);
            window.history.replaceState({}, '', newUrl);
        } else {
            // Remove hash if no filters active
            if (window.location.hash.includes('?filter=')) {
                const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`;
                console.log('🔗 [MOBILE] Clearing hash');
                window.history.replaceState({}, '', newUrl);
            }
        }

        // Restore scroll position
        requestAnimationFrame(() => {
            window.scrollTo(0, currentScrollY);
        });
    }

    // Global flag to prevent hash update loops
    let isMobileManualFilterChange = false;

    // Setup click listeners for filter links (mobile cards)
    function setupMobileFilterLinks() {
        // Listen for clicks on links with filter parameters
        document.addEventListener('click', (event) => {
            // Only handle on mobile view
            if (!isMobileView()) {
                return;
            }

            const link = event.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            let filterString = null;
            let shouldPreventDefault = false;

            console.log('🔗 [MOBILE] Link clicked:', href);

            // Check for hash-based filter links (#?filter=...)
            if (href.includes('#?filter=')) {
                filterString = href.split('#?filter=')[1];
                shouldPreventDefault = true;
            }
            // Check for query-based filter links (?filter=...)
            else if (href.includes('?filter=')) {
                // Handle relative query-only URLs (e.g., "?filter=...")
                if (href.startsWith('?filter=')) {
                    filterString = href.split('?filter=')[1];
                    shouldPreventDefault = true;
                }
                // Handle full URLs with query parameters
                else {
                    try {
                        const url = new URL(href, window.location.origin);
                        filterString = url.searchParams.get('filter');

                        // Only handle if it's the same page (same pathname)
                        if (url.pathname === window.location.pathname) {
                            shouldPreventDefault = true;
                        }
                    } catch (e) {
                        // If URL parsing fails, try to extract filter from relative URL
                        if (href.includes('?filter=')) {
                            filterString = href.split('?filter=')[1].split('&')[0];
                            shouldPreventDefault = true;
                        }
                    }
                }
            }

            if (filterString && shouldPreventDefault) {
                event.preventDefault();

                console.log('🔗 [MOBILE] Filter link clicked, processing:', filterString);

                // Parse the filter string into parameters (arrays)
                const filterParams = parseMobileFilterString(filterString);

                // Apply the filters
                if (Object.keys(filterParams).length > 0) {
                    console.log('🔗 [MOBILE] Applying filters from link:', filterParams);

                    // Update the URL hash (normalized keys, supports multi-values)
                    const activeFilters = [];
                    Object.keys(filterParams).forEach((attr) => {
                        const values = Array.isArray(filterParams[attr]) ? filterParams[attr] : [];
                        if (values.length > 0) {
                            activeFilters.push(attr + ':' + values.join('|'));
                        }
                    });

                    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                    const newUrl = baseUrl + '#?filter=' + activeFilters.join(',');
                    window.history.replaceState({}, '', newUrl);

                    // Use the mobile filter API when available (works for both single + multi select)
                    const api = window.airaMobileCardsFilterAPI;
                    if (api && typeof api.applyMobileFilterParams === 'function') {
                        api.applyMobileFilterParams(filterParams);
                    }
                }
            }
        });
    }

    // Initialize Swiper loading
    utils.addSwiper();

    const getCrossSells = function (productId) {
        jQuery.ajax({
            url: '/wp-json/custom/v1/cross-sells/' + productId,
            type: 'GET',
            success: function (data) {
                // console.log(data);
                if (data.length > 0) {
                    jQuery('.ATC-popup__product_cross_sells').html('');
                    jQuery('.ATC-popup').addClass('hasCrossSells');

                    var crossSells = '';
                    crossSells += '<button class="ATC_carousel-btn ATC_carousel-prev">&#10094;</button>';
                    crossSells += '<button class="ATC_carousel-btn ATC_carousel-next">&#10095;</button>';
                    crossSells += '<h3 class="ATC-popup__product_cross_sells--h3">You might also be interested in:</h3>';
                    crossSells += '<div class="ATC-popup__product_cross_sells--container swiper-wrapper">';

                    jQuery(data).each(function (i, product) {
                        crossSells += '<div class="ATC-popup__product_cross_sell swiper-slide">';
                        crossSells += '<div class="ATC-popup__product_cross_sell__inner">';
                        crossSells += '<a href="' + product.url + '">';
                        crossSells += '<img class="ATC-popup__product_cross_sell--image" src="' + product.image + '" />';
                        crossSells += '<h3 class="ATC-popup__product_cross_sell--title">' + product.title + '</h3>';

                        crossSells += '<div class="ATC-popup__product_cross_sell--prices">';
                        if (product.sale_price && product.sale_price > 0) {
                            crossSells += '<div class="ATC-popup__product_cross_sell--price-old">' + product.currency_symbol + '' + formatPrice(product.sale_price) + ' </span>' + product.vat + '</span></div>';
                        }
                        crossSells += '<div class="ATC-popup__product_cross_sell--price">' + product.currency_symbol + '' + formatPrice(product.regular_price) + ' <span>' + product.vat + '</span></div>';
                        crossSells += '</div>';
                        crossSells += '</a>';

                        crossSells += '<div class="ATC-popup__product_cross_sell--cart">';
                        crossSells += '<input type="number" class="input-text qty text" step="1" min="1" max="999" name="quantity" value="1" title="Qty" size="4" pattern="[0-9]*" inputmode="numeric">';
                        crossSells += '<a href="/?add-to-cart=' + product.id + '" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart addToCartCrossSell" data-product_id="' + product.id + '" data-product_sku="" data-product-title="' + product.title + '" aria-label="Add "' + product.title + '" to your basket" rel="nofollow"><i class="fa fa-shopping-cart"></i>ADD TO CART</a>';
                        crossSells += '</div>';

                        crossSells += '</div>';
                        crossSells += '</div>';
                    });

                    crossSells += '</div>';

                    jQuery('.ATC-popup__product_cross_sells').html(crossSells);

                    jQuery('.ATC-popup__product_cross_sell--cart input').on('keyup, change', function () {
                        var qty = jQuery(this).val();
                        // console.log(qty);
                        jQuery(this).closest('.ATC-popup__product_cross_sell--cart').find('a.add_to_cart_button').attr('data-quantity', qty);
                    });

                    utils.waitForSwiper(function () {
                        const swiper = new Swiper('.ATC-swiper', {
                            // Optional parameters
                            slidesPerView: 4,
                            spaceBetween: 5,
                            loop: false,
                            // Navigation arrows
                            navigation: {
                                nextEl: '.ATC_carousel-btn.ATC_carousel-next',
                                prevEl: '.ATC_carousel-btn.ATC_carousel-prev'
                            },
                            breakpoints: {
                                320: {
                                    slidesPerView: 1.2,
                                    spaceBetween: 5
                                },
                                480: {
                                    slidesPerView: 1.5,
                                    spaceBetween: 5
                                },
                                840: {
                                    slidesPerView: 2.5,
                                    spaceBetween: 5
                                },
                                1400: {
                                    slidesPerView: 4,
                                    spaceBetween: 5
                                }
                            }
                        });
                    });
                }
            }
        });
    };

    // Main VWO function
    function initMobileCards() {
        // Always initialize mobile cards regardless of initial screen size
        // Get dynamic column config from table
        const columnConfig = getTableColumnConfig();

        // console.log('Detected product category:', columnConfig);
        // console.log('Column config:', columnConfig);

        // 1. EXTRACT DATA FROM TABLE
        function extractProductData() {
            const products = [];
            const tableRows = document.querySelectorAll('.which-mesh-category tbody tr.table_string');

            // console.log('Found table rows:', tableRows.length);

            tableRows.forEach(row => {
                // Extract product image with fallbacks
                const imageElement = row.querySelector('.product-image-td img');
                let imageUrl = 'https://www.wirefence.co.uk/wp-content/uploads/woocommerce-placeholder.png';
                let imageAlt = '';

                if (imageElement) {
                    // Check regular src
                    if (imageElement.src && !imageElement.src.includes('data:image/svg+xml')) {
                        imageUrl = imageElement.src;
                    }
                    // Check data-lazy-src
                    else if (imageElement.getAttribute('data-lazy-src')) {
                        imageUrl = imageElement.getAttribute('data-lazy-src');
                    }
                    // Check noscript tag
                    else {
                        const noscript = row.querySelector('.product-image-td noscript');
                        if (noscript) {
                            const noscriptImg = noscript.textContent.match(/src="([^"]+)"/);
                            if (noscriptImg && noscriptImg[1]) {
                                imageUrl = noscriptImg[1];
                            }
                        }
                    }
                    imageAlt = imageElement.alt || '';
                }

                // Extract product link
                const linkElement = row.querySelector('.product-image-td a');
                const productUrl = linkElement ? linkElement.href : '';

                // Extract video ID
                const videoElement = row.querySelector('.video-wrapper');
                const videoId = videoElement ? videoElement.getAttribute('data-video-id') : '';

                // Initialize attributes object with all possible attributes
                const attributes = {};
                let quantity = '1', price = '', productId = '', productName = '', shippingClass = '';

                // Get product data from row attributes
                productId = row.getAttribute('data-product-id') || '';
                productName = row.getAttribute('data-name') || '';
                price = row.getAttribute('data-price') || '';
                shippingClass = row.getAttribute('data-shipping-class') || '';

                // Extract data from table cells based on column configuration
                const cells = row.querySelectorAll('td');

                // Map each column to its attribute
                columnConfig.columns.forEach((attrName, index) => {
                    const cellIndex = columnConfig.cellIndexMap[attrName];
                    if (cells[cellIndex]) {
                        const cell = cells[cellIndex];
                        const cellText = cell.textContent.trim();
                        const cellLink = cell.querySelector('a');
                        const linkText = cellLink ? cellLink.textContent.trim() : cellText;
                        attributes[attrName] = linkText;
                    }
                });

                // Handle quantity and price columns (these are typically at the end)
                const quantityCellIndex = columnConfig.columns.length + 1; // After all attribute columns
                const priceCellIndex = columnConfig.columns.length + 2; // After quantity column

                if (cells[quantityCellIndex]) {
                    const qtyInput = cells[quantityCellIndex].querySelector('input[type="number"]');
                    quantity = qtyInput ? qtyInput.value : '1';
                }

                if (cells[priceCellIndex]) {
                    const priceElement = cells[priceCellIndex].querySelector('.woocommerce-Price-amount');
                    if (priceElement) {
                        price = priceElement.textContent.replace('£', '').trim();
                    }
                }

                // Extract add to cart URL
                const addToCartElement = row.querySelector('.add_to_cart_button');
                const addToCartUrl = addToCartElement ? addToCartElement.href : '';

                // Create product object
                const product = {
                    id: productId,
                    name: productName,
                    url: productUrl,
                    shippingClass: shippingClass,
                    image: {
                        url: imageUrl,
                        alt: imageAlt
                    },
                    video: {
                        id: videoId,
                        hasVideo: !!videoId
                    },
                    attributes: attributes,
                    price: price,
                    quantity: quantity,
                    addToCartUrl: addToCartUrl
                };

                products.push(product);
            });

            // console.log('Extracted products:', products);
            return products;
        }

        // 2. CREATE FILTER OPTIONS FROM PRODUCTS
        function extractFilterOptions(products) {
            const filters = {};

            // Initialize filters object based on column configuration
            columnConfig.columns.forEach(column => {
                filters[column] = {};
            });

            // Count occurrences for each filter option
            products.forEach(product => {
                const attrs = product.attributes;

                columnConfig.columns.forEach(column => {
                    if (attrs[column]) {
                        filters[column][attrs[column]] = (filters[column][attrs[column]] || 0) + 1;
                    }
                });
            });

            // Convert to array format
            const result = {};
            columnConfig.columns.forEach(column => {
                result[column] = Object.keys(filters[column]).map(key => ({
                    value: key,
                    text: key,
                    count: filters[column][key]
                }));
            });

            result.totalCount = products.length;
            result.allProducts = products;
            // console.log('Extracted filters:', result);
            return result;
        }

        function countMobileFilterOptions(products) {
            const counts = {};

            // Initialize counts for each column
            columnConfig.columns.forEach(column => {
                counts[column] = {};
            });

            // Count occurrences in products data
            products.forEach(product => {
                columnConfig.columns.forEach(column => {
                    const value = product.attributes[column];
                    if (value) {
                        const normalized = normalizeFilterValue(value);
                        counts[column][normalized] = (counts[column][normalized] || 0) + 1;
                    }
                });
            });

            return counts;
        }

        // 3. GENERATE MOBILE CARDS HTML
        function generateMobileCardsHTML(products) {
            if (!products || products.length === 0) {
                return '<div class="no-products">No results, please try again by trying a new filter combination.</div>';
            }

            const cardsHTML = products.map(product => {
                const videoButton = product.video.hasVideo ? `<div class="video-wrapper" data-video-id="${product.video.id}"> <i class="fa fa-play-circle" aria-hidden="true"></i> <span class="title">Show video</span> </div>` : '<div class="video-wrapper" style="visibility: hidden;"></div>';

                const shippingDeliveryDays = {
                    'gabion-accessories': 'Next day',
                    'stone': 'Next day',
                    'next-day-gabions': 'Next day',
                    'large': '',
                    'small-gabions': '',
                    'moncaster-next-day': 'Next day',
                    'moncaster-nextday-large': 'Next day',
                    'other': ''
                };

                // Generate spec rows dynamically based on column configuration
                const specRows = columnConfig.columns.map((column, index) => {
                    // Use custom headers for specific columns
                    let header = columnConfig.headers[index];
                    if (column === 'wireDiameter') {
                        header = 'Wire Dia';
                    } else if (column === 'holeSize') {
                        header = 'Hole Size';
                    }
                    const value = product.attributes[column] || '';
                    return `<li class="spec-row"><b>${header}:</b> <span>${value}</span></li>`;
                }).join('');

                // Generate data attributes for filtering
                const dataAttributes = columnConfig.columns.map(column =>
                    `data-${column.toLowerCase().replace(/([A-Z])/g, '-$1')}="${product.attributes[column] || ''}"`
                ).join(' ');

                return `
                <div class="product-card" data-product-id="${product.id}" ${dataAttributes}>
                    <div class="card-top">
                        <div class="product-image">
							${shippingDeliveryDays[product.shippingClass] ? `
							<div class="product-shipping-label" style="display: none;">
								<img src="https://www.wirefence.co.uk/wp-content/themes/emallshop-child/assets/images/icons8-delivery-50.png" alt="delivery-icon" width="15" height="15">
								${shippingDeliveryDays[product.shippingClass]}
							</div>` : ''}
                            <a href="${product.url}">
                                <img src="${product.image.url}" alt="${product.image.alt}">
                            </a>
                            ${videoButton}
                        </div>
                        <div class="product-details">
                            <div class="product-name">
                                <a href="${product.url}">${product.name}</a>
                            </div>
                            <div class="product-specs" onclick="window.location.href='${product.url}'">
                                <ul class="spec-list">
                                    ${specRows}
									<li style="display: none;" class="destop-view spec-row"><a href="${product.url}" class="more-info-link">More Info</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

					<div class="card-bottom">
                        <div class="price-section">
                            <div class="price">£${product.price} <span class="price-label">inc. VAT</span></div>
							<small style="display: none;" class="multi-purchase-discount"><a href="${product.url}" class="more-info-link"><i class="fa fa-check" aria-hidden="true"></i> <span class="multi-purchase-discount-text">Multi Purchase Discount</span></a></small>
                        </div>
                        <div class="quantity-cart-section">
                            <input type="number" class="quantity-input" value="${product.quantity}" min="1" data-product-id="${product.id}">
                            <button class="add-to-cart-btn add_to_cart_button" data-product-id="${product.id}" data-product-name="${product.name}">
                                Add to cart
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');

            return cardsHTML;
        }

        // 4. GENERATE TABLE FILTER HTML
        function generateTableFilterHTML(filters) {
            const generateSelectOptions = (options, allProducts = []) => {
                if (!options || options.length === 0) return '<option value="">Filter</option>';

                // Count how many products have each option value
                const counts = countMobileFilterOptions(allProducts);

                const optionsHTML = options.map(option => {
                    const normalized = normalizeFilterValue(option.value);
                    const count = option.count || 0;

                    // Respect showFilterCounts config
                    const displayText = showFilterCounts ? `${option.text} (${count})` : option.text;

                    // Respect allowZeroResults config - only disable if false AND count is 0
                    const disabled = !allowZeroResults && count === 0 ? 'disabled' : '';

                    return `<option value="${option.value}" ${disabled}>${displayText}</option>`;
                }).join('');

                return `<option value="">Filter</option>${optionsHTML}`;
            };

            const current_slug = window.location.pathname.split('/').filter(Boolean).pop();
            const gabion_category_slugs = ['all-gabions-in-stock', 'plastic-coated-mesh'];
            const is_gabion = gabion_category_slugs.includes(current_slug);


            // Generate header columns
            const headerColumns = columnConfig.headers.map((header, index) => {
                let infoIcon = '';
                let spanStyle = 'margin-left: 5px; vertical-align: middle;';
                let iStyle = 'color:#fff; margin-left:0; margin-right:0; cursor: pointer;';
                if (header.trim().toLowerCase() === 'grade') {
                    infoIcon = `<span class="scroll-to-grading" style="${spanStyle}"><i style="${iStyle}" class="fa fa-info-circle" aria-hidden="true"></i></span>`;
                }

                if (header.trim().toLowerCase() === 'wire diameter (gauge)' && is_gabion) {
                    infoIcon = `<span class="scroll-to-wire-thickness" style="${spanStyle}"><i style="${iStyle}" class="fa fa-info-circle" aria-hidden="true"></i></span>`;
                }

                return `<div class="filter-col"><span class="col-header">${header}${infoIcon}</span> <span class="sort_category"><i class="fa fa-sort" aria-hidden="true"></i></span></div>`;
            }).join('');

            // Generate filter select columns
            const filterColumns = columnConfig.columns.map((column, index) =>
                `<div class="filter-col">
                    <select class="filter-select" data-filter-type="${column}">
                        ${generateSelectOptions(filters[column])}
                    </select>
                </div>`
            ).join('');

            return `
            <div class="filter-table-wrapper">
                <div class="filter-table-header">
                    ${headerColumns}
                </div>
                <div class="filter-table-controls">
                    ${filterColumns}
                </div>
                <div class="filter-actions">
                    <div class="filter-actions-left">
                        <button class="clear-filters-btn" style="display: none;">Clear All <span class="clear-filters-btn-x">×</span></button>
					${enableMultiSelect ? '<div class="selected-filters-pills"></div>' : ''}
                    </div>
				${!enableMultiSelect ? `<div class="results-count">Showing <span id="results-showing">0</span> out of <span id="results-total">${filters.totalCount || 0}</span> items</div>` : ''}
                </div>
			${!enableMultiSelect ? '<!-- <div class="selected-filters-tags" style="display: none;"></div> -->' : ''}
            </div>`;
        }

        // 5. MAIN CONVERSION FUNCTION
        function convertToMobileLayout() {
            // Extract data
            const products = extractProductData();
            const filters = extractFilterOptions(products);

            // Limit initial display to 12 products
            const initialItemsPerLoad = 12;
            const initialProducts = products.slice(0, initialItemsPerLoad);

            // Generate mobile layout HTML
            const mobileHTML = `
            <div class="mobile-layout">
                <!-- Table-Style Filter -->
                ${generateTableFilterHTML(filters)}

                <!-- Product Cards -->
                <div class="product-cards">
                    ${generateMobileCardsHTML(initialProducts)}
                </div>
            </div>`;

            return {
                html: mobileHTML,
                products: products,
                filters: filters
            };
        }

        // 6. FILTER FUNCTIONALITY
        function setupFilterFunctionality(container, allProducts) {
            let filteredProducts = [...allProducts];
            let currentSort = { column: null, direction: 'asc' };
            let itemsToShow = 12;
            const initialItemsPerLoad = 12;

            // ============================================
            // Mobile Cards UX: loading spinner + dropdown dim overlay
            // ============================================
            const MOBILE_DROPDOWN_OVERLAY_ID = 'aira-mobile-dropdown-overlay';
            const MOBILE_LOADING_OVERLAY_ID = 'aira-mobile-loading-overlay';
            let currentOpenMobileDropdownFilterType = null;

            function getMobileLayoutElement() {
                return container.querySelector('.mobile-layout');
            }

            function ensureMobileLoadingOverlay() {
                const mobileLayout = getMobileLayoutElement();
                if (!mobileLayout) return null;

                // Ensure the layout can host an absolute overlay
                mobileLayout.style.position = 'relative';

                let overlay = mobileLayout.querySelector(`#${MOBILE_LOADING_OVERLAY_ID}`);
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = MOBILE_LOADING_OVERLAY_ID;
                    overlay.className = 'aira-mobile-loading-overlay';
                    overlay.innerHTML = '<div class="aira-mobile-spinner"></div>';
                    mobileLayout.appendChild(overlay);
                }
                return overlay;
            }

            function showMobileLoadingOverlay() {
                const overlay = ensureMobileLoadingOverlay();
                if (overlay) overlay.classList.add('active');
            }

            function hideMobileLoadingOverlay() {
                const overlay = ensureMobileLoadingOverlay();
                if (overlay) overlay.classList.remove('active');
            }

            function ensureMobileDropdownOverlay() {
                let overlay = document.getElementById(MOBILE_DROPDOWN_OVERLAY_ID);
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = MOBILE_DROPDOWN_OVERLAY_ID;
                    overlay.className = 'aira-mobile-dropdown-overlay';
                    document.body.appendChild(overlay);

                    // Click on overlay closes dropdowns and applies filters
                    overlay.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeAllMobileDropdowns();
                        closeMobileDropdownOverlay();
                        applyMobileFiltersNow({ updateHash: true });
                    });
                }
                return overlay;
            }

            function positionMobileDropdownOverlay() {
                const overlay = document.getElementById(MOBILE_DROPDOWN_OVERLAY_ID);
                if (!overlay) return;

                const filterWrapper = container.querySelector('.filter-table-wrapper');
                if (!filterWrapper) {
                    overlay.style.top = '0px';
                    overlay.style.height = '100vh';
                    return;
                }

                const rect = filterWrapper.getBoundingClientRect();
                const top = Math.max(0, rect.bottom);
                overlay.style.top = `${top}px`;
                overlay.style.height = `calc(100vh - ${top}px)`;
            }

            function openMobileDropdownOverlay() {
                const overlay = ensureMobileDropdownOverlay();
                positionMobileDropdownOverlay();
                overlay.classList.add('active');
            }

            function closeMobileDropdownOverlay() {
                const overlay = document.getElementById(MOBILE_DROPDOWN_OVERLAY_ID);
                if (!overlay) return;
                overlay.classList.remove('active');
                overlay.style.top = '';
                overlay.style.height = '';
            }

            function closeAllMobileDropdowns() {
                container.querySelectorAll('.mobile-multiselect-dropdown.open').forEach(dd => {
                    dd.classList.remove('open');
                    const otherDisplayBtn = dd.parentElement?.querySelector('.mobile-multiselect-display');
                    if (otherDisplayBtn) {
                        otherDisplayBtn.classList.remove('active');
                    }
                });
                currentOpenMobileDropdownFilterType = null;
            }

            function applyMobileFiltersNow(options = {}) {
                const opts = {
                    updateHash: true,
                    afterApply: null,
                    ...options
                };

                showMobileLoadingOverlay();

                // Let the overlay paint before the heavier DOM updates
                requestAnimationFrame(() => {
                    filterProductsSync();
                    updateClearButtonVisibility();
                    if (enableMultiSelect) {
                        updateMobileSelectedFilterPills();
                    }

                    if (opts.updateHash && isMobileView()) {
                        isMobileManualFilterChange = true;
                        updateMobileURLHash(container);
                    }

                    hideMobileLoadingOverlay();

                    if (typeof opts.afterApply === 'function') {
                        opts.afterApply();
                    }
                });
            }

            // Multi-select state storage: { filterType: [value1, value2, ...] }
            const mobileMultiSelectState = {};
            columnConfig.columns.forEach(column => {
                mobileMultiSelectState[column] = [];
            });

            /**
             * Desktop-like hypothetical counts for a single filterType.
             *
             * We compute counts based on products that match all OTHER active filters.
             * Then for each option we show:
             * - if none selected in this filter: count(value)
             * - if some selected: unionCount(selected) + count(value) (if value not already selected)
             *
             * This keeps options addable within the same filter (e.g. Height 1m then add 2m/3m).
             */
            function getHypotheticalCountsForFilterType(filterType) {
                const selectedFilters = getSelectedFilters();

                const selectedForThis = (selectedFilters[filterType] || []).map(normalizeFilterValue);
                const selectedSet = new Set(selectedForThis);

                // Filter products by OTHER active filters only
                const baselineProducts = allProducts.filter(product => {
                    const attrs = product.attributes;

                    return columnConfig.columns.every(col => {
                        if (col === filterType) return true;
                        const filterValues = selectedFilters[col] || [];
                        if (!filterValues || filterValues.length === 0) return true;

                        const normalizedVals = filterValues.map(v => normalizeFilterValue(v));
                        const productValue = normalizeFilterValue(attrs[col]);
                        return normalizedVals.includes(productValue);
                    });
                });

                // Count occurrences of each value for this filterType in baselineProducts
                const countsByValue = {};
                baselineProducts.forEach(product => {
                    const rawVal = product.attributes[filterType];
                    if (!rawVal) return;
                    const normVal = normalizeFilterValue(rawVal);
                    if (!normVal) return;
                    countsByValue[normVal] = (countsByValue[normVal] || 0) + 1;
                });

                // Current union count under selected values in this filterType
                let unionCount = 0;
                if (selectedSet.size > 0) {
                    selectedSet.forEach(v => {
                        unionCount += countsByValue[v] || 0;
                    });
                }

                function getDisplayCountForOption(normalizedOptionValue) {
                    const optCount = countsByValue[normalizedOptionValue] || 0;
                    if (selectedSet.size === 0) {
                        return optCount;
                    }
                    // Selected options show unionCount (current results). Unselected show union + option's count.
                    return selectedSet.has(normalizedOptionValue) ? unionCount : (unionCount + optCount);
                }

                return {
                    countsByValue,
                    unionCount,
                    selectedSet,
                    getDisplayCountForOption
                };
            }

            // Move this function inside setupFilterFunctionality where filteredProducts exists
            function updateMobileFilterCounts() {
                const useHypothetical = !!enableMultiSelect;
                const currentCounts = useHypothetical ? null : countMobileFilterOptions(filteredProducts);
                const hypotheticalCache = {};

                const getHypo = (filterType) => {
                    if (!useHypothetical) return null;
                    if (!hypotheticalCache[filterType]) {
                        hypotheticalCache[filterType] = getHypotheticalCountsForFilterType(filterType);
                    }
                    return hypotheticalCache[filterType];
                };

                container.querySelectorAll('.filter-select').forEach(select => {
                    const filterType = select.getAttribute('data-filter-type');
                    const hypothetical = getHypo(filterType);

                    // Update each option
                    Array.from(select.options).forEach(option => {
                        if (option.value !== '') {
                            const normalized = normalizeFilterValue(option.value);
                            const count = useHypothetical
                                ? hypothetical.getDisplayCountForOption(normalized)
                                : ((currentCounts[filterType]?.[normalized]) || 0);
                            const originalText = option.textContent.replace(/\s*\(\d+\)$/, '');

                            // Respect showFilterCounts config
                            if (showFilterCounts) {
                                option.textContent = `${originalText} (${count})`;
                            } else {
                                option.textContent = originalText;
                            }

                            // Respect allowZeroResults config - only disable if false AND count is 0
                            option.disabled = !allowZeroResults && count === 0;
                        }
                    });
                });

                // Update multi-select checkbox UI if it exists
                container.querySelectorAll('.mobile-multiselect-wrapper').forEach(wrapper => {
                    const filterType = wrapper.getAttribute('data-filter-type');
                    const hypothetical = getHypo(filterType);

                    wrapper.querySelectorAll('.mobile-multiselect-option').forEach(optionDiv => {
                        const value = optionDiv.getAttribute('data-value');
                        const normalized = normalizeFilterValue(value);
                        const count = useHypothetical
                            ? hypothetical.getDisplayCountForOption(normalized)
                            : ((currentCounts[filterType]?.[normalized]) || 0);

                        const countSpan = optionDiv.querySelector('.mobile-multiselect-option-count');
                        const checkbox = optionDiv.querySelector('input[type="checkbox"]');

                        // Respect showFilterCounts config
                        if (countSpan) {
                            if (showFilterCounts) {
                                countSpan.textContent = `(${count})`;
                            } else {
                                countSpan.textContent = '';
                            }
                        }

                        // Respect allowZeroResults config - disable checkbox if false AND count is 0
                        if (checkbox) {
                            checkbox.disabled = !allowZeroResults && count === 0;
                            if (checkbox.disabled && checkbox.checked) {
                                checkbox.checked = false;
                                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }
                    });

                    // Reorder options: enabled at top, disabled at bottom
                    reorderMultiSelectOptions(filterType, wrapper);
                });
            }

            // Store original option order for each filter type
            const originalOptionOrder = {};

            // Initialize mobile multi-select UI
            function initializeMobileMultiSelect() {
                const filterSelects = container.querySelectorAll('.filter-select');

                filterSelects.forEach(select => {
                    const filterType = select.getAttribute('data-filter-type');

                    // Store original order of options (excluding first "Filter" option)
                    originalOptionOrder[filterType] = Array.from(select.options)
                        .slice(1)
                        .map(opt => opt.value);

                    // Create custom multi-select wrapper
                    const wrapper = document.createElement('div');
                    wrapper.className = 'mobile-multiselect-wrapper';
                    wrapper.setAttribute('data-filter-type', filterType);

                    // Create display button
                    const displayBtn = document.createElement('div');
                    displayBtn.className = 'mobile-multiselect-display';
                    displayBtn.textContent = 'Filter';
                    wrapper.appendChild(displayBtn);

                    // Create dropdown list
                    const dropdown = document.createElement('div');
                    dropdown.className = 'mobile-multiselect-dropdown';

                    // Create scrollable options wrapper
                    const optionsWrapper = document.createElement('div');
                    optionsWrapper.className = 'mobile-multiselect-options-wrapper';

                    // Add options as checkboxes
                    Array.from(select.options).forEach((option, index) => {
                        if (index === 0) return; // Skip first "Filter" option

                        const optionDiv = document.createElement('div');
                        optionDiv.className = 'mobile-multiselect-option';
                        optionDiv.setAttribute('data-value', option.value);

                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = `mobile-${filterType}-${option.value}`;
                        checkbox.value = option.value;

                        const label = document.createElement('label');
                        label.htmlFor = checkbox.id;

                        const optionText = option.textContent.trim();
                        const countMatch = optionText.match(/\s*\((\d+)\)\s*$/);
                        const labelText = countMatch ? optionText.replace(/\s*\(\d+\)\s*$/, '').trim() : optionText;
                        const labelCount = countMatch ? countMatch[1] : '';

                        const labelTextSpan = document.createElement('span');
                        labelTextSpan.className = 'mobile-multiselect-option-text';
                        labelTextSpan.textContent = labelText;

                        const labelCountSpan = document.createElement('span');
                        labelCountSpan.className = 'mobile-multiselect-option-count';
                        labelCountSpan.textContent = labelCount ? `(${labelCount})` : '';

                        label.appendChild(labelTextSpan);
                        label.appendChild(labelCountSpan);

                        optionDiv.appendChild(checkbox);
                        optionDiv.appendChild(label);
                        optionsWrapper.appendChild(optionDiv);

                        // Checkbox change handler
                        checkbox.addEventListener('change', () => {
                            handleMobileMultiSelectChange(filterType, option.value, checkbox.checked, wrapper);
                        });

                        // Make whole option div clickable
                        optionDiv.addEventListener('click', (e) => {
                            // Don't toggle if clicking directly on checkbox or label - let browser handle it
                            if (e.target === checkbox || e.target === label || label.contains(e.target)) {
                                return;
                            }
                            e.stopPropagation();
                            checkbox.checked = !checkbox.checked;
                            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                    });

                    dropdown.appendChild(optionsWrapper);

                    // Add "View Items" button at bottom
                    const viewBtn = document.createElement('button');
                    viewBtn.className = 'mobile-multiselect-view-btn';
                    viewBtn.textContent = 'View Items';
                    viewBtn.type = 'button';
                    viewBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Close dropdown
                        dropdown.classList.remove('open');
                        displayBtn.classList.remove('active');
                        currentOpenMobileDropdownFilterType = null;
                        closeMobileDropdownOverlay();
                        applyMobileFiltersNow({ updateHash: true });
                    });
                    dropdown.appendChild(viewBtn);

                    wrapper.appendChild(dropdown);

                    // Toggle dropdown on display button click
                    displayBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const isOpen = dropdown.classList.contains('open');

                        const openDropdowns = container.querySelectorAll('.mobile-multiselect-dropdown.open');
                        const filterType = wrapper.getAttribute('data-filter-type');

                        const openThisDropdown = () => {
                            // Position dropdown below wrapper (fixed so it escapes overflow)
                            const wrapperRect = wrapper.getBoundingClientRect();
                            const viewportWidth = window.innerWidth;
                            const dropdownWidth = Math.max(wrapperRect.width, 180);

                            dropdown.style.top = wrapperRect.bottom + 'px';
                            dropdown.style.width = dropdownWidth + 'px';
                            dropdown.style.maxWidth = '250px';

                            // Check if dropdown would go off-screen to the right
                            let leftPos = wrapperRect.left;
                            const actualWidth = Math.min(dropdownWidth, 250);
                            if (leftPos + actualWidth > viewportWidth - 10) {
                                leftPos = Math.max(10, viewportWidth - actualWidth - 10);
                            }
                            dropdown.style.left = leftPos + 'px';

                            dropdown.classList.add('open');
                            displayBtn.classList.add('active');
                            openMobileDropdownOverlay();
                            currentOpenMobileDropdownFilterType = filterType;
                        };

                        if (!isOpen) {
                            // If switching dropdowns, auto-apply current selections first (desktop-style)
                            if (
                                openDropdowns.length > 0 &&
                                currentOpenMobileDropdownFilterType &&
                                currentOpenMobileDropdownFilterType !== filterType
                            ) {
                                closeAllMobileDropdowns();
                                closeMobileDropdownOverlay();
                                applyMobileFiltersNow({
                                    updateHash: true,
                                    afterApply: () => {
                                        openThisDropdown();
                                    }
                                });
                                return;
                            }

                            // Otherwise just close others without applying
                            closeAllMobileDropdowns();
                            openThisDropdown();
                        } else {
                            // Closing this dropdown -> apply
                            dropdown.classList.remove('open');
                            displayBtn.classList.remove('active');
                            currentOpenMobileDropdownFilterType = null;
                            closeMobileDropdownOverlay();
                            applyMobileFiltersNow({ updateHash: true });
                        }
                    });

                    // Hide original select and insert wrapper
                    select.style.display = 'none';
                    select.parentNode.insertBefore(wrapper, select);
                });

                // Close dropdowns when clicking outside
                document.addEventListener('click', (e) => {
                    // Overlay handles its own click-to-apply
                    if (e.target && e.target.closest && e.target.closest(`#${MOBILE_DROPDOWN_OVERLAY_ID}`)) {
                        return;
                    }
                    if (!e.target.closest('.mobile-multiselect-wrapper')) {
                        const openDropdowns = container.querySelectorAll('.mobile-multiselect-dropdown.open');
                        if (openDropdowns.length > 0) {
                            openDropdowns.forEach(dd => {
                                dd.classList.remove('open');
                                const displayBtn = dd.parentElement.querySelector('.mobile-multiselect-display');
                                if (displayBtn) {
                                    displayBtn.classList.remove('active');
                                }
                            });
                            currentOpenMobileDropdownFilterType = null;
                            closeMobileDropdownOverlay();
                            applyMobileFiltersNow({ updateHash: true });
                        }
                    }
                });

                // Reposition open dropdowns on scroll/resize
                function repositionMobileOpenDropdowns() {
                    container.querySelectorAll('.mobile-multiselect-dropdown.open').forEach(dd => {
                        const wrapper = dd.parentElement;
                        if (wrapper) {
                            const wrapperRect = wrapper.getBoundingClientRect();
                            const viewportWidth = window.innerWidth;
                            const dropdownWidth = dd.offsetWidth || 180;

                            dd.style.top = wrapperRect.bottom + 'px';

                            // Check if dropdown would go off-screen to the right
                            let leftPos = wrapperRect.left;
                            if (leftPos + dropdownWidth > viewportWidth - 10) {
                                leftPos = Math.max(10, viewportWidth - dropdownWidth - 10);
                            }
                            dd.style.left = leftPos + 'px';
                        }
                    });

                    // Keep the dim overlay aligned under the filter bar
                    const overlay = document.getElementById(MOBILE_DROPDOWN_OVERLAY_ID);
                    if (overlay && overlay.classList.contains('active')) {
                        positionMobileDropdownOverlay();
                    }
                }
                window.addEventListener('scroll', repositionMobileOpenDropdowns, true);
                window.addEventListener('resize', repositionMobileOpenDropdowns);
            }

            // Handle multi-select change
            function handleMobileMultiSelectChange(filterType, value, isChecked, wrapper) {
                // Handle "0" value (clear/disable filter)
                if (value === '0') {
                    if (isChecked) {
                        // Setting to "0" clears all other selections
                        mobileMultiSelectState[filterType] = ['0'];

                        // Uncheck all other options
                        wrapper.querySelectorAll('.mobile-multiselect-option').forEach((opt) => {
                            const checkboxVal = opt.getAttribute('data-value');
                            if (checkboxVal !== '0') {
                                const checkbox = opt.querySelector('input[type="checkbox"]');
                                if (checkbox) {
                                    checkbox.checked = false;
                                    opt.classList.remove('selected');
                                }
                            }
                        });
                    } else {
                        // Unchecking "0" removes it from state
                        mobileMultiSelectState[filterType] = mobileMultiSelectState[filterType].filter((v) => v !== '0');
                    }
                } else {
                    // Handle non-zero values
                    if (isChecked) {
                        // Remove "0" if present and add the new selection
                        mobileMultiSelectState[filterType] = mobileMultiSelectState[filterType].filter((v) => v !== '0');
                        if (!mobileMultiSelectState[filterType].includes(value)) {
                            mobileMultiSelectState[filterType].push(value);
                        }

                        // Uncheck "0" if it was checked
                        const zeroOption = wrapper.querySelector('.mobile-multiselect-option[data-value="0"]');
                        if (zeroOption) {
                            const zeroCheckbox = zeroOption.querySelector('input[type="checkbox"]');
                            if (zeroCheckbox && zeroCheckbox.checked) {
                                zeroCheckbox.checked = false;
                                zeroOption.classList.remove('selected');
                            }
                        }
                    } else {
                        // Remove the deselected option
                        mobileMultiSelectState[filterType] = mobileMultiSelectState[filterType].filter((v) => v !== value);
                    }
                }

                // Update visual highlights
                const option = wrapper.querySelector(`.mobile-multiselect-option[data-value="${value}"]`);
                if (option) {
                    if (isChecked) {
                        option.classList.add('selected');
                    } else {
                        option.classList.remove('selected');
                    }
                }

                // Update display button
                updateMobileMultiSelectDisplay(filterType, wrapper);
            }

            // Update display button text
            function updateMobileMultiSelectDisplay(filterType, wrapper) {
                const displayBtn = wrapper.querySelector('.mobile-multiselect-display');
                const selectedCount = mobileMultiSelectState[filterType].length;

                if (selectedCount === 0) {
                    displayBtn.textContent = 'Filter';
                    displayBtn.classList.remove('has-selection');
                } else {
                    // Show first value + "..." if multiple selected
                    const firstValue = mobileMultiSelectState[filterType][0];
                    const firstTextSpan = wrapper.querySelector(`.mobile-multiselect-option[data-value="${firstValue}"] .mobile-multiselect-option-text`);
                    const firstLabel = firstTextSpan ? firstTextSpan.textContent.trim() : '';

                    if (selectedCount === 1) {
                        displayBtn.textContent = firstLabel;
                    } else {
                        displayBtn.textContent = firstLabel + '...';
                    }
                    displayBtn.classList.add('has-selection');
                }
            }

            // Reorder multi-select options: enabled at top (original order), disabled at bottom
            function reorderMultiSelectOptions(filterType, wrapper) {
                const optionsWrapper = wrapper.querySelector('.mobile-multiselect-options-wrapper');
                if (!optionsWrapper) return;

                const options = Array.from(optionsWrapper.querySelectorAll('.mobile-multiselect-option'));
                const originalOrder = originalOptionOrder[filterType] || [];

                // Sort options: enabled first (in original order), disabled at bottom (in original order)
                options.sort((a, b) => {
                    const aValue = a.getAttribute('data-value');
                    const bValue = b.getAttribute('data-value');
                    const aCheckbox = a.querySelector('input[type="checkbox"]');
                    const bCheckbox = b.querySelector('input[type="checkbox"]');
                    const aDisabled = aCheckbox ? aCheckbox.disabled : false;
                    const bDisabled = bCheckbox ? bCheckbox.disabled : false;

                    if (aDisabled && !bDisabled) {
                        // a is disabled, b is enabled: b comes first
                        return 1;
                    } else if (!aDisabled && bDisabled) {
                        // a is enabled, b is disabled: a comes first
                        return -1;
                    } else {
                        // Both enabled or both disabled: maintain original order
                        return originalOrder.indexOf(aValue) - originalOrder.indexOf(bValue);
                    }
                });

                // Re-append options in sorted order
                options.forEach(opt => optionsWrapper.appendChild(opt));
            }

            // Clear all multi-select filters
            function clearMobileMultiSelectFilters() {
                Object.keys(mobileMultiSelectState).forEach(filterType => {
                    mobileMultiSelectState[filterType] = [];
                });

                if (enableMultiSelect) {
                    // Uncheck all checkboxes and remove highlights
                    container.querySelectorAll('.mobile-multiselect-option').forEach(option => {
                        const checkbox = option.querySelector('input[type="checkbox"]');
                        if (checkbox) checkbox.checked = false;
                        option.classList.remove('selected');
                    });

                    // Reset display buttons
                    container.querySelectorAll('.mobile-multiselect-display').forEach(btn => {
                        btn.textContent = 'Filter';
                        btn.classList.remove('has-selection');
                    });

                    // Note: Option order will be restored by updateMobileFilterCounts() 
                    // when it recalculates counts and all options become enabled again
                } else {
                    // Reset select dropdowns to default option
                    container.querySelectorAll('.filter-select').forEach(select => {
                        select.selectedIndex = 0;
                        select.classList.remove('selected');
                    });
                }
            }

            function getSelectedFilters() {
                // Return multi-select state, filtering out "0" values (which represent "no filter")
                const filtered = {};
                Object.keys(mobileMultiSelectState).forEach((key) => {
                    filtered[key] = mobileMultiSelectState[key].filter(v => v !== '0');
                });
                return filtered;
            }

            // Update selected filter pills display (no grouping/labels on mobile)
            function updateMobileSelectedFilterPills() {
                // Only show pills when multi-select is enabled
                if (!enableMultiSelect) return;

                const pillsContainer = container.querySelector('.selected-filters-pills');
                if (!pillsContainer) return;

                pillsContainer.innerHTML = '';
                let hasSelections = false;

                // First, check if there are any selections
                columnConfig.columns.forEach((column) => {
                    const values = mobileMultiSelectState[column];
                    if (values && values.length > 0) {
                        hasSelections = true;
                    }
                });

                // Add "Clear All" pill first if there are selections (when enableMultiSelect is true)
                if (enableMultiSelect && hasSelections) {
                    const clearAllPill = document.createElement('div');
                    clearAllPill.className = 'mobile-filter-pill mobile-filter-pill-clear-all';
                    clearAllPill.innerHTML = 'Clear All <span class="mobile-filter-pill-remove">×</span>';
                    clearAllPill.addEventListener('click', (e) => {
                        e.stopPropagation();
                        clearAllFilters();
                        // Clear hash when clearing filters on mobile
                        if (isMobileView()) {
                            isMobileManualFilterChange = true;
                            if (window.location.hash.includes('?filter=')) {
                                const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`;
                                window.history.replaceState({}, '', newUrl);
                            }
                        }
                    });
                    pillsContainer.appendChild(clearAllPill);
                }

                // Add individual pills for each selected value
                columnConfig.columns.forEach((column, index) => {
                    const values = mobileMultiSelectState[column];
                    if (!values || values.length === 0) return;

                    // Add individual pills for each value (no grouping)
                    values.forEach(value => {
                        const pill = document.createElement('div');
                        pill.className = 'mobile-filter-pill';
                        pill.setAttribute('data-filter-type', column);
                        pill.setAttribute('data-filter-value', value);

                        const pillText = document.createElement('span');
                        pillText.className = 'mobile-filter-pill-text';
                        pillText.textContent = value;

                        const pillRemove = document.createElement('span');
                        pillRemove.className = 'mobile-filter-pill-remove';
                        pillRemove.innerHTML = '×';

                        // Make the whole pill clickable to remove
                        pill.addEventListener('click', (e) => {
                            e.stopPropagation();
                            removeMobilePillFilter(column, value);
                        });

                        pill.appendChild(pillText);
                        pill.appendChild(pillRemove);
                        pillsContainer.appendChild(pill);
                    });
                });

                pillsContainer.style.display = hasSelections ? 'flex' : 'none';
            }

            // Remove a specific filter via pill click
            function removeMobilePillFilter(filterType, value) {
                // Remove from state
                mobileMultiSelectState[filterType] = mobileMultiSelectState[filterType].filter(v => v !== value);

                // Update checkbox
                const wrapper = container.querySelector(`.mobile-multiselect-wrapper[data-filter-type="${filterType}"]`);
                if (wrapper) {
                    const option = wrapper.querySelector(`.mobile-multiselect-option[data-value="${value}"]`);
                    if (option) {
                        const checkbox = option.querySelector('input[type="checkbox"]');
                        if (checkbox) checkbox.checked = false;
                        option.classList.remove('selected');
                    }
                    updateMobileMultiSelectDisplay(filterType, wrapper);
                }

                // Trigger filter update
                applyMobileFiltersNow({ updateHash: true });
            }

            // Override updateMobileURLHash to support multi-select (pipe-separated format)
            updateMobileURLHash = function (container) {
                if (!isMobileView()) {
                    console.log('⚠️ [MOBILE] Not in mobile view, skipping hash update');
                    return;
                }

                const currentScrollY = window.pageYOffset;
                const activeFilters = [];

                // Use multi-select state to generate hash
                Object.keys(mobileMultiSelectState).forEach(filterType => {
                    const values = mobileMultiSelectState[filterType];
                    if (values.length > 0) {
                        // Join multiple values with pipe separator
                        activeFilters.push(filterType + ':' + values.join('|'));
                    }
                });

                console.log('🔗 [MOBILE] Active multi-select filters for hash:', activeFilters);

                if (activeFilters.length > 0) {
                    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                    const newUrl = baseUrl + '#?filter=' + activeFilters.join(',');
                    console.log('🔗 [MOBILE] Updating hash to:', newUrl);
                    window.history.replaceState({}, '', newUrl);
                } else {
                    // Remove hash if no filters active
                    if (window.location.hash.includes('?filter=')) {
                        const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`;
                        console.log('🔗 [MOBILE] Clearing hash');
                        window.history.replaceState({}, '', newUrl);
                    }
                }

                // Restore scroll position
                requestAnimationFrame(() => {
                    window.scrollTo(0, currentScrollY);
                });
            };

            function filterProductsSync() {
                const selectedFilters = getSelectedFilters();

                filteredProducts = allProducts.filter(product => {
                    const attrs = product.attributes;

                    return columnConfig.columns.every(column => {
                        const filterValues = selectedFilters[column];
                        const productValue = normalizeFilterValue(attrs[column]);
                        const normalized = filterValues.map(v => normalizeFilterValue(v));

                        return filterValues.length === 0 || normalized.includes(productValue);
                    });
                });

                // Apply current sort if any
                if (currentSort.column) {
                    filteredProducts = sortProducts(filteredProducts, currentSort.column, currentSort.direction);
                }

                updateMobileFilterCounts();

                // Reset to initial load when filters change
                itemsToShow = initialItemsPerLoad;
                updateResultsCount();
                showFilteredProducts();
            }

            function filterProducts() {
                applyMobileFiltersNow({ updateHash: true });
            }

            function updateClearButtonVisibility() {
                const selectedFilters = getSelectedFilters();
                const hasFilters = columnConfig.columns.some(column => selectedFilters[column].length > 0);
                const clearBtn = container.querySelector('.clear-filters-btn');

                if (enableMultiSelect) {
                    // Hide original clear button - clear functionality is in pills row as "Clear All" pill
                    if (clearBtn) {
                        clearBtn.style.display = 'none';
                    }
                } else {
                    // Live behavior - show/hide based on active filters
                    if (clearBtn) {
                        clearBtn.style.display = hasFilters ? 'inline-block' : 'none';
                    }
                }
            }

            /*
            function updateSelectedFilterTags() {
                const selectedFilters = getSelectedFilters();
                const tagsContainer = container.querySelector('.selected-filters-tags');
                
                if (!tagsContainer) return;
                
                // Clear existing tags
                tagsContainer.innerHTML = '';
                
                // Generate tags for each selected filter
                columnConfig.columns.forEach((column, index) => {
                    const filterValues = selectedFilters[column];
                    const columnHeader = columnConfig.headers[index];
                    
                    filterValues.forEach(value => {
                        const tag = document.createElement('span');
                        tag.className = 'filter-tag';
                        tag.innerHTML = `${value} <button class="remove-filter" data-filter-type="${column}" data-filter-value="${value}">×</button>`;
                        tagsContainer.appendChild(tag);
                    });
                });
                
                // Add click handlers for remove buttons
                tagsContainer.querySelectorAll('.remove-filter').forEach(btn => {
                    btn.addEventListener('click', function(event) {
                        event.preventDefault();
                        event.stopPropagation();
                        
                        const filterType = this.getAttribute('data-filter-type');
                        const filterValue = this.getAttribute('data-filter-value');
                        
                        // Find and clear the corresponding select
                        const selectElement = container.querySelector(`.filter-select[data-filter-type="${filterType}"]`);
                        if (selectElement && selectElement.value === filterValue) {
                            selectElement.value = '';
                            selectElement.classList.remove('selected');
                        }
                        
                        // Update filters and display
                        filterProducts();
                        updateClearButtonVisibility();
                        updateSelectedFilterTags();
                    });
                });
            }
            */

            function sortProducts(products, column, direction) {
                return products.sort((a, b) => {
                    let valueA = a.attributes[column] || '';
                    let valueB = b.attributes[column] || '';

                    // Try to parse as numbers first
                    const numA = parseFloat(valueA);
                    const numB = parseFloat(valueB);

                    // If both are valid numbers, compare numerically
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return direction === 'asc' ? numA - numB : numB - numA;
                    }

                    // Otherwise compare as strings
                    if (direction === 'asc') {
                        return valueA.localeCompare(valueB);
                    } else {
                        return valueB.localeCompare(valueA);
                    }
                });
            }

            function updateSortIcons(activeColumn, direction) {
                // Reset all sort icons
                container.querySelectorAll('.sort_category i').forEach(icon => {
                    icon.className = 'fa fa-sort';
                });

                // Update active column icon
                if (activeColumn) {
                    const columnIndex = columnConfig.columns.indexOf(activeColumn);
                    if (columnIndex !== -1) {
                        const activeIcon = container.querySelectorAll('.sort_category i')[columnIndex];
                        if (activeIcon) {
                            activeIcon.className = direction === 'asc' ? 'fa fa-sort-up' : 'fa fa-sort-down';
                        }
                    }
                }
            }

            function updateResultsCount() {
                const totalCount = filteredProducts.length;
                const showingCount = Math.min(itemsToShow, totalCount);

                const showingElement = container.querySelector('#results-showing');
                const totalElement = container.querySelector('#results-total');

                if (showingElement) {
                    showingElement.textContent = showingCount;
                }
                if (totalElement) {
                    totalElement.textContent = totalCount;
                }
            }

            function showFilteredProducts() {
                const cardsContainer = container.querySelector('.product-cards');
                if (cardsContainer) {
                    // Get products to show (up to itemsToShow)
                    const productsToShow = filteredProducts.slice(0, itemsToShow);

                    cardsContainer.innerHTML = generateMobileCardsHTML(productsToShow);
                    setupQuantityControls(container);
                    setupAddToCartAjax(container);
                    updateExistingShowMoreLess();
                }
            }

            function updateExistingShowMoreLess() {
                const totalCount = filteredProducts.length;
                const showingCount = Math.min(itemsToShow, totalCount);

                // Find existing elements
                const statusElement = document.querySelector('.aira-table-pagination-status');
                const buttonElement = document.querySelector('button.show-more');

                if (statusElement) {
                    // Update status text to match table format: "You've viewed X out of Y products"
                    statusElement.textContent = `You've viewed ${showingCount} out of ${totalCount} products`;
                    statusElement.style.display = totalCount > 0 ? 'block' : 'none';
                }

                if (buttonElement) {
                    if (totalCount > initialItemsPerLoad) {
                        const isShowingAll = showingCount >= totalCount;

                        // Update button text and class
                        buttonElement.textContent = isShowingAll ? 'Show less' : 'Show more';
                        buttonElement.classList.toggle('show-less-active', isShowingAll);
                        buttonElement.style.display = 'block';
                    } else {
                        buttonElement.style.display = 'none';
                    }
                }
            }

            function clearAllFilters() {
                showMobileLoadingOverlay();

                requestAnimationFrame(() => {
                    // Clear multi-select state
                    clearMobileMultiSelectFilters();

                    currentSort = { column: null, direction: 'asc' };
                    itemsToShow = initialItemsPerLoad; // Reset to initial load
                    filteredProducts = [...allProducts];
                    updateSortIcons(null, 'asc');
                    updateMobileFilterCounts(); // Reset disabled states + option ordering
                    updateResultsCount();
                    showFilteredProducts();
                    updateClearButtonVisibility();
                    if (enableMultiSelect) {
                        updateMobileSelectedFilterPills();
                    }

                    hideMobileLoadingOverlay();
                });
            }

            // Apply filters from hash parameters
            function applyMobileFilterParams(filterParams) {
                console.log('🔍 [MOBILE] applyMobileFilterParams - Starting with:', filterParams);

                let filtersApplied = false;

                // Clear multi-select state
                clearMobileMultiSelectFilters();

                // Apply each filter parameter (supports arrays)
                Object.keys(filterParams).forEach((filterType) => {
                    const filterValues = Array.isArray(filterParams[filterType]) ? filterParams[filterType] : [];
                    console.log('🔍 [MOBILE] Processing filter:', filterType, '=', filterValues);

                    if (enableMultiSelect) {
                        const wrapper = container.querySelector(`.mobile-multiselect-wrapper[data-filter-type="${filterType}"]`);
                        if (!wrapper) {
                            console.log('❌ [MOBILE] Multi-select wrapper not found for:', filterType);
                            return;
                        }

                        filterValues.forEach((filterValue) => {
                            // Find matching option (case-insensitive partial match)
                            const options = wrapper.querySelectorAll('.mobile-multiselect-option');

                            Array.from(options).forEach((optionDiv) => {
                                const optionValue = optionDiv.getAttribute('data-value');
                                const optionTextSpan = optionDiv.querySelector('.mobile-multiselect-option-text');
                                const optionText = optionTextSpan ? optionTextSpan.textContent.toLowerCase() : '';
                                const searchValue = String(filterValue || '').toLowerCase();

                                if (optionValue && (optionValue.toLowerCase() === searchValue ||
                                    optionText === searchValue ||
                                    optionValue.toLowerCase().includes(searchValue) ||
                                    optionText.includes(searchValue))) {

                                    console.log('✅ [MOBILE] Applying filter:', filterType, '=', optionValue);

                                    const checkbox = optionDiv.querySelector('input[type="checkbox"]');
                                    if (checkbox) {
                                        checkbox.checked = true;
                                    }
                                    optionDiv.classList.add('selected');

                                    if (!mobileMultiSelectState[filterType].includes(optionValue)) {
                                        mobileMultiSelectState[filterType].push(optionValue);
                                    }

                                    filtersApplied = true;
                                }
                            });
                        });

                        // Update display button
                        updateMobileMultiSelectDisplay(filterType, wrapper);
                    } else {
                        // Single-select mode: apply first value only
                        const filterValue = filterValues[0] || '';
                        const selectElement = container.querySelector(`.filter-select[data-filter-type="${filterType}"]`);

                        if (!selectElement) {
                            console.log('❌ [MOBILE] Select not found for:', filterType);
                            return;
                        }

                        if (!filterValue) {
                            selectElement.value = '';
                            selectElement.classList.remove('selected');
                            mobileMultiSelectState[filterType] = [];
                            return;
                        }

                        const options = Array.from(selectElement.options);
                        const searchValue = String(filterValue).toLowerCase();
                        const matchingOption = options.find((option) => {
                            const optionValue = String(option.value || '').toLowerCase();
                            const optionLabel = String(option.textContent || '').toLowerCase();
                            return optionValue === searchValue ||
                                optionLabel === searchValue ||
                                optionValue.includes(searchValue) ||
                                optionLabel.includes(searchValue);
                        });

                        if (matchingOption && matchingOption.value) {
                            selectElement.value = matchingOption.value;
                            selectElement.classList.add('selected');
                            mobileMultiSelectState[filterType] = [matchingOption.value];
                            filtersApplied = true;
                        }
                    }
                });

                if (filtersApplied) {
                    console.log('✅ [MOBILE] Triggering filter update');
                    applyMobileFiltersNow({
                        updateHash: false,
                        afterApply: () => {
                            // Scroll to mobile cards with delay
                            setTimeout(() => {
                                const mobileLayout = document.querySelector('.mobile-layout');
                                if (mobileLayout) {
                                    console.log('📍 [MOBILE] Scrolling to mobile cards');
                                    const rect = mobileLayout.getBoundingClientRect();
                                    const targetPosition = window.pageYOffset + rect.top - 200;
                                    window.scrollTo({
                                        top: Math.max(0, targetPosition),
                                        behavior: 'smooth'
                                    });
                                }
                            }, 300);
                        }
                    });
                }
            }

            // Setup sort functionality
            function setupSortFunctionality() {
                const sortButtons = container.querySelectorAll('.filter-table-header .sort_category');

                sortButtons.forEach((sortBtn, index) => {
                    sortBtn.addEventListener('click', function (event) {
                        event.preventDefault();
                        event.stopPropagation();

                        const column = columnConfig.columns[index];

                        // Toggle sort direction if same column, otherwise start with ascending
                        if (currentSort.column === column) {
                            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                        } else {
                            currentSort.column = column;
                            currentSort.direction = 'asc';
                        }

                        // Apply sort to current filtered products
                        filteredProducts = sortProducts(filteredProducts, currentSort.column, currentSort.direction);

                        // Reset to initial load when sorting changes
                        itemsToShow = initialItemsPerLoad;

                        // Update icons and display
                        updateSortIcons(currentSort.column, currentSort.direction);
                        updateResultsCount();
                        showFilteredProducts();
                    });
                });
            }

            // Conditionally initialize multi-select or single-select based on config
            if (enableMultiSelect) {
                // Initialize multi-select UI with checkboxes
                initializeMobileMultiSelect();

                // Initialize pills display
                updateMobileSelectedFilterPills();

                // Note: Multi-select UI uses checkboxes instead of select dropdowns
            } else {
                // Use standard single-select dropdowns - keep them visible
                container.querySelectorAll('.filter-select').forEach(select => {
                    select.style.display = 'block';
                    // Match "selected" styling with current value (single-select only)
                    if (select.value && select.value !== '') {
                        select.classList.add('selected');
                    } else {
                        select.classList.remove('selected');
                    }

                    // Add event listener for single-select mode
                    select.addEventListener('change', function () {
                        const filterType = this.getAttribute('data-filter-type');
                        const value = this.value;

                        // Update mobileMultiSelectState for single-select (array with single value or empty)
                        if (value && value !== '') {
                            mobileMultiSelectState[filterType] = [value];
                            this.classList.add('selected');
                        } else {
                            mobileMultiSelectState[filterType] = [];
                            this.classList.remove('selected');
                        }

                        // Trigger filter update
                        applyMobileFiltersNow({ updateHash: true });

                        // Update URL hash if on mobile
                    });
                });
            }

            const clearBtn = container.querySelector('.clear-filters-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    clearAllFilters();

                    // 🔗 UPDATE: Clear hash when clearing filters on mobile
                    if (isMobileView()) {
                        isMobileManualFilterChange = true;
                        if (window.location.hash.includes('?filter=')) {
                            const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`;
                            window.history.replaceState({}, '', newUrl);
                        }
                    }
                });
            }

            // Add event listener for chicken-wire-grade info icon
            const chickenWireGradeIcon = container.querySelector('.chicken-wire-grade');
            if (chickenWireGradeIcon) {
                chickenWireGradeIcon.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (typeof PUM !== 'undefined' && PUM.open) {
                        PUM.open(73871);
                    }
                });
            }

            // Initialize sort functionality
            setupSortFunctionality();

            // Setup show more/less handler inside this scope so variables are accessible
            setupShowMoreLessHandlerInScope();

            updateResultsCount();
            updateClearButtonVisibility();
            // updateSelectedFilterTags();

            function setupShowMoreLessHandlerInScope() {
                const buttonElement = document.querySelector('button.show-more');

                if (buttonElement && !buttonElement.hasAttribute('data-cards-handler')) {
                    console.log('✅ Setting up new button handler');
                    buttonElement.setAttribute('data-cards-handler', 'true');

                    buttonElement.addEventListener('click', function (e) {
                        // Check if mobile layout (cards) is currently visible
                        const mobileLayout = document.querySelector('.mobile-layout');
                        const isCardsVisible = mobileLayout && mobileLayout.style.display !== 'none' &&
                            (window.getComputedStyle(mobileLayout).display !== 'none');

                        if (isCardsVisible) {
                            // MOBILE: Handle cards view with custom behavior
                            console.log('Mobile cards show more clicked - current itemsToShow:', itemsToShow, 'filteredProducts:', filteredProducts.length);

                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();

                            const totalCount = filteredProducts.length;
                            const isShowingAll = itemsToShow >= totalCount;

                            console.log('isShowingAll:', isShowingAll, 'totalCount:', totalCount);

                            if (isShowingAll) {
                                // Show less - reset to initial load with custom mobile scroll
                                itemsToShow = initialItemsPerLoad;
                                console.log('Mobile show less - reset to:', itemsToShow);

                                // Update content first
                                updateResultsCount();
                                showFilteredProducts();

                                // Then scroll to button after DOM updates
                                setTimeout(() => {
                                    const showMoreButton = document.querySelector('button.show-more');
                                    if (showMoreButton) {
                                        const buttonRect = showMoreButton.getBoundingClientRect();
                                        const targetScrollPosition = window.scrollY + buttonRect.top - 200;

                                        console.log('Scrolling to show-more button at position:', targetScrollPosition);
                                        window.scrollTo({
                                            top: targetScrollPosition,
                                            behavior: 'smooth'
                                        });
                                    } else {
                                        console.log('ERROR: Show More Button not found for scroll!');
                                    }
                                }, 400);
                            } else {
                                // Show more - add another batch (no scroll needed)
                                const remainingItems = totalCount - itemsToShow;
                                const nextBatch = Math.min(initialItemsPerLoad, remainingItems);
                                itemsToShow += nextBatch;
                                console.log('Mobile show more - new itemsToShow:', itemsToShow, 'nextBatch:', nextBatch);

                                // Update content for show more
                                updateResultsCount();
                                showFilteredProducts();
                            }
                        }
                        // DESKTOP: Do nothing - let original aira-pagination.js handle everything
                        // (including the table show/hide and scroll behavior)
                    }, true); // Use capture phase to ensure we get the event first
                }
            }

            // Return the API so it can be called from outside
            return {
                applyMobileFilterParams: applyMobileFilterParams
            };
        }

        // 7. QUANTITY CONTROLS
        function setupQuantityControls(container) {
            // Handle quantity input field interactions
            container.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('click', function (event) {
                    event.stopPropagation();
                });

                input.addEventListener('focus', function (event) {
                    event.stopPropagation();
                });

                input.addEventListener('change', function (event) {
                    event.stopPropagation();
                    // Ensure minimum value of 1
                    if (parseInt(this.value) < 1) {
                        this.value = 1;
                    }
                });
            });
        }

        // 8. ADD TO CART FUNCTIONALITY - Updated to use existing ATC popup
        function setupAddToCartAjax(container) {
            container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const productId = this.getAttribute('data-product-id');
                    const productName = this.getAttribute('data-product-name');
                    const quantityInput = container.querySelector(`input.quantity-input[data-product-id="${productId}"]`);
                    const quantity = quantityInput ? quantityInput.value : 1;

                    // Use existing ATC popup loading functionality
                    if (typeof window.jQuery !== 'undefined' && jQuery('.ATC').length > 0) {
                        // Show existing ATC loading popup
                        jQuery('.ATC-background').removeClass('ATC-background--dark');
                        jQuery('.ATC-loading').show();
                        jQuery('.ATC-popup').removeClass('slideUp');
                        jQuery('.ATC').show();
                    }

                    this.disabled = true;
                    this.textContent = 'Adding...';

                    const formData = new FormData();
                    formData.append('action', 'woocommerce_add_to_cart');
                    formData.append('product_id', productId);
                    formData.append('quantity', quantity);

                    const ajaxUrl = (typeof wc_add_to_cart_params !== 'undefined') ? wc_add_to_cart_params.ajax_url : '/wp-admin/admin-ajax.php';

                    fetch(ajaxUrl, {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                // Hide ATC popup on error
                                if (typeof window.jQuery !== 'undefined' && jQuery('.ATC').length > 0) {
                                    jQuery('.ATC-loading').hide();
                                    jQuery('.ATC').hide();
                                }
                                alert('Error adding to cart: ' + data.error);
                                this.textContent = 'Add to cart';
                                this.disabled = false;
                            } else {
                                // Show success with existing ATC popup
                                if (typeof window.jQuery !== 'undefined' && jQuery('.ATC').length > 0) {
                                    jQuery('.ATC-loading').hide();
                                    jQuery('.ATC-background').addClass('ATC-background--dark');
                                    jQuery('.ATC-popup').addClass('slideUp');

                                    // Update popup title with product name
                                    if (productName) {
                                        jQuery('.ATC-popup__product p').html(productName + ' has been added to cart!');
                                    }
                                    // Trigger cross-sell fetch if available
                                    console.log('[DEBUG] About to check for getCrossSells. Product ID:', productId);
                                    console.log('[DEBUG] typeof getCrossSells:', typeof getCrossSells);
                                    console.log('[DEBUG] typeof window.getCrossSells:', typeof window.getCrossSells);
                                    if (typeof getCrossSells === 'function') {
                                        console.log('[DEBUG] Calling getCrossSells(productId)');
                                        getCrossSells(productId);
                                    } else if (window.getCrossSells && typeof window.getCrossSells === 'function') {
                                        console.log('[DEBUG] Calling window.getCrossSells(productId)');
                                        window.getCrossSells(productId);
                                    } else {
                                        console.log('[DEBUG] getCrossSells function not found');
                                    }
                                }

                                this.textContent = 'Added!';
                                setTimeout(() => {
                                    this.textContent = 'Add to cart';
                                    this.disabled = false;
                                }, 2000);

                                // Trigger WooCommerce events
                                if (typeof jQuery !== 'undefined') {
                                    jQuery('body').trigger('added_to_cart', [data.fragments, data.cart_hash, jQuery(this)]);
                                }
                            }
                        })
                        .catch(error => {
                            console.error('Add to cart error:', error);
                            // Hide ATC popup on error
                            if (typeof window.jQuery !== 'undefined' && jQuery('.ATC').length > 0) {
                                jQuery('.ATC-loading').hide();
                                jQuery('.ATC').hide();
                            }
                            this.textContent = 'Error';
                            setTimeout(() => {
                                this.textContent = 'Add to cart';
                                this.disabled = false;
                            }, 2000);
                        });
                });
            });
        }

        // 10. INITIALIZE LAYOUT
        function initializeMobileLayout() {
            const mobileLayout = convertToMobileLayout();

            if (mobileLayout.products.length === 0) {
                console.error('No products found in table');
                return;
            }

            const container = document.createElement('div');
            container.innerHTML = mobileLayout.html;

            const originalTable = document.querySelector('.which-mesh-category');
            if (originalTable) {
                originalTable.parentNode.insertBefore(container, originalTable.nextSibling);

                // Set initial display state based on current screen size
                const mobileLayoutElement = container.querySelector('.mobile-layout');
                if (isMobileView()) {
                    // Show mobile layout, hide table
                    originalTable.style.display = 'none';
                    mobileLayoutElement.style.display = 'block';
                    console.log('Initial load: Showing mobile cards layout');
                } else {
                    // Show table, hide mobile layout
                    originalTable.style.display = 'block';
                    mobileLayoutElement.style.display = 'none';
                    console.log('Initial load: Showing desktop table layout');
                }

                const mediaStyle = document.createElement('style');
                mediaStyle.textContent = `
                    @media (min-width: 1025px) { 
                        .mobile-layout { display: none !important; } 
                        .which-mesh-category { display: block !important; } 
                    }
                `;
                document.head.appendChild(mediaStyle);

                // Setup all functionality
                const filterAPI = setupFilterFunctionality(container, mobileLayout.products);
                // Expose for hashchange + filter-link handlers
                window.airaMobileCardsFilterAPI = filterAPI;
                setupQuantityControls(container);
                setupAddToCartAjax(container);

                // 🔗 NEW: Apply filters from hash on page load (mobile only)
                if (isMobileView()) {
                    const hashFilters = parseMobileFilterParams();
                    if (Object.keys(hashFilters).length > 0) {
                        console.log('🔗 [MOBILE] Found hash filters on page load, applying...');
                        setTimeout(() => {
                            filterAPI.applyMobileFilterParams(hashFilters);
                        }, 500);
                    }
                }
            }

            return mobileLayout;
        }

        // 11. RESPONSIVE RESIZE HANDLER
        function setupResizeHandler() {
            let resizeTimeout;
            let isCurrentlyMobile = isMobileView();

            function handleResize() {
                // Clear previous timeout
                clearTimeout(resizeTimeout);

                // Wait 2 seconds after resize stops
                resizeTimeout = setTimeout(() => {
                    const isNowMobile = isMobileView();

                    // Only act if the view type has actually changed
                    if (isCurrentlyMobile !== isNowMobile) {
                        console.log('Screen size changed. Was mobile:', isCurrentlyMobile, 'Now mobile:', isNowMobile);

                        const originalTable = document.querySelector('.which-mesh-category');
                        const mobileLayout = document.querySelector('.mobile-layout');

                        if (isNowMobile) {
                            // Switch to mobile (cards) layout
                            if (originalTable) originalTable.style.display = 'none';
                            if (mobileLayout) {
                                mobileLayout.style.display = 'block';
                                console.log('Switched to mobile cards layout');
                            } else {
                                console.error('Mobile layout not found when switching to mobile view');
                            }
                        } else {
                            // Switch to desktop (table) layout
                            if (originalTable) originalTable.style.display = 'table';
                            if (mobileLayout) {
                                mobileLayout.style.display = 'none';
                                console.log('Switched to desktop table layout');
                            } else {
                                console.error('Mobile layout not found when switching to desktop view');
                            }
                        }

                        // Update the current state
                        isCurrentlyMobile = isNowMobile;
                    }
                }, 250); // Wait 250ms after resize stops for better responsiveness
            }

            // Add resize event listener
            window.addEventListener('resize', handleResize);

            // Also listen for orientation change on mobile devices
            window.addEventListener('orientationchange', () => {
                // Wait for orientation change to complete
                setTimeout(handleResize, 300);
            });

            console.log('Resize handler setup complete');
        }

        // 12. HASH CHANGE LISTENER FOR MOBILE
        window.addEventListener('hashchange', function (e) {
            console.log('🔗 Hash changed:', window.location.hash);

            // Only handle on mobile view
            if (!isMobileView()) {
                console.log('⚠️ Not mobile view, letting table handler deal with it');
                return;
            }

            // Ignore if this was triggered by our own filter change
            if (isMobileManualFilterChange) {
                console.log('⚠️ Manual filter change, ignoring hash change');
                isMobileManualFilterChange = false;
                return;
            }

            const newHash = location.hash || '';
            const isFilterHash = newHash.startsWith('#?filter=');
            const wasFilterHash = !!(e?.oldURL && e.oldURL.includes('#?filter='));

            // Ignore unrelated hashes
            if (!isFilterHash && !wasFilterHash) {
                console.log('⚠️ Unrelated hash, ignoring');
                return;
            }

            console.log('✅ [MOBILE] Processing hash change for mobile cards');
            const hashFilters = parseMobileFilterParams();

            const api = window.airaMobileCardsFilterAPI;
            if (api && typeof api.applyMobileFilterParams === 'function') {
                api.applyMobileFilterParams(hashFilters);
            }
        }, false);

        // RUN THE CONVERSION
        try {
            const result = initializeMobileLayout();

            // Setup resize handler after initial layout
            setupResizeHandler();

            // Setup filter links for mobile cards
            setupMobileFilterLinks();

            // console.log('VWO Mobile Layout Test: Success', result);
        } catch (error) {
            console.error('VWO Mobile Layout Test Error:', error);
        }
    }

    // VWO refresh function - allows re-initialization when config changes
    window.airaRefreshMobileCardsFilterConfig = function () {
        console.log('🔄 Refreshing mobile cards filter config...');

        // Re-read config from global before re-initializing
        allowZeroResults = (window.airaFilterConfig && window.airaFilterConfig.allowZeroResults != null) ? window.airaFilterConfig.allowZeroResults : false;
        showFilterCounts = (window.airaFilterConfig && window.airaFilterConfig.showFilterCounts != null) ? window.airaFilterConfig.showFilterCounts : true;
        enableMultiSelect = (window.airaFilterConfig && window.airaFilterConfig.enableMultiSelect != null) ? window.airaFilterConfig.enableMultiSelect : false;

        // Clear any existing mobile layout
        const existingLayout = document.querySelector('.mobile-layout');
        if (existingLayout) {
            existingLayout.remove();
        }

        // Re-initialize mobile cards with new config
        initMobileCards();

        console.log('✅ Mobile cards filter config refreshed');
    };

    // Wait for table to load then initialize
    waitForElement('.which-mesh-category tbody tr.table_string', initMobileCards);

    // VWO deferred config detection:
    // If enableMultiSelect was not set at init time, poll for VWO to set it.
    // Checks every 200ms for up to 10 seconds.
    if (!enableMultiSelect) {
        let vwoMobileCheckCount = 0;
        const vwoMobileMaxChecks = 50; // 50 × 200ms = 10 seconds
        const vwoMobileCheckInterval = setInterval(() => {
            vwoMobileCheckCount++;
            if (window.airaFilterConfig?.enableMultiSelect === true) {
                console.log('🔄 MOBILE CARDS - VWO config detected after ' + (vwoMobileCheckCount * 200) + 'ms — refreshing filters');
                clearInterval(vwoMobileCheckInterval);
                // Update closure variables and trigger full re-init
                allowZeroResults = window.airaFilterConfig?.allowZeroResults ?? false;
                showFilterCounts = window.airaFilterConfig?.showFilterCounts ?? true;
                enableMultiSelect = window.airaFilterConfig?.enableMultiSelect ?? false;
                const existingLayout = document.querySelector('.mobile-layout');
                if (existingLayout) {
                    existingLayout.remove();
                }
                initMobileCards();
            } else if (vwoMobileCheckCount >= vwoMobileMaxChecks) {
                console.log('⏱️ MOBILE CARDS - VWO config polling timed out after 10s');
                clearInterval(vwoMobileCheckInterval);
            }
        }, 200);
    }

})();