// Mobile Card View
(function() {
    'use strict';

	// Gabion slugs (keep in sync with PHP GABION_SLUGS constant)
	const GABION_SLUGS = [
		'all-gabions-in-stock',
		'build-your-own-custom-gabion',
		'stone',
		'stone/calculator',
		'gabion-planters',
		'bench',
		'wall/1m-gabion-wall',
		'wall/2m-gabion-wall',
		'gabion-mattress',
		'sea-defence',
		'next-day-delivery'
	];

	// Do not run this code on any gabion slug page
	const currentPath = window.location.pathname.replace(/\/+$/, '');
	const isGabionCategory = GABION_SLUGS.some(slug => currentPath.endsWith(`/gabion/${slug}`));
	if (isGabionCategory) {
		return;
	} else {
		// apply these CSS changes with jQuery
		$('.mobile-layout').css('display', 'block');
		$('.which-mesh-category').css('display', 'none');
		$('.mobile-scroll').css('display', 'none');
		$('.table-wrapper1').css('display', 'none');
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

                    jQuery('.ATC-popup__product_cross_sell--cart input').on('keyup, change', function(){
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
						counts[column][value] = (counts[column][value] || 0) + 1;
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
					const count = option.count || 0;
					return `<option value="${option.value}" ${count === 0 ? 'disabled' : ''}>${option.text} (${count})</option>`;
				}).join('');
                
                return `<option value="">Filter</option>${optionsHTML}`;
            };
            
            // Generate header columns
            const headerColumns = columnConfig.headers.map((header, index) => {
                let infoIcon = '';
                if (header.trim().toLowerCase() === 'grade') {
                    infoIcon = ' <i style="color: rgb(255, 255, 255); margin-left: 0px; cursor: pointer;" class="fa fa-info-circle chicken-wire-grade pum-trigger" aria-hidden="true"></i>';
                }
                return `<div class="filter-col">${header}${infoIcon} <span class="sort_category"><i class="fa fa-sort" aria-hidden="true"></i></span></div>`;
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
                    </div>
                    <div class="results-count">Showing <span id="results-showing">0</span> out of <span id="results-total">${filters.totalCount || 0}</span> items</div>
                </div>
                <!-- <div class="selected-filters-tags" style="display: none;"></div> -->
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

			// Move this function inside setupFilterFunctionality where filteredProducts exists
			function updateMobileFilterCounts() {
				const counts = countMobileFilterOptions(filteredProducts);
				
				container.querySelectorAll('.filter-select').forEach(select => {
					const filterType = select.getAttribute('data-filter-type');
					const currentValue = select.value;
					
					// Update each option
					Array.from(select.options).forEach(option => {
						if (option.value !== '') {
							const count = counts[filterType][option.value] || 0;
							const originalText = option.textContent.replace(/\s*\(\d+\)$/, '');
							option.textContent = `${originalText} (${count})`;
							option.disabled = count === 0;
						}
					});
				});
			}
            
            function getSelectedFilters() {
                const selected = {};
                
                // Initialize selected filters object based on column configuration
                columnConfig.columns.forEach(column => {
                    selected[column] = [];
                });
                
                container.querySelectorAll('.filter-select').forEach(select => {
                    const filterType = select.getAttribute('data-filter-type');
                    const value = select.value;
                    if (value && selected[filterType]) {
                        selected[filterType].push(value);
                    }
                });
                
                return selected;
            }
			            
            function filterProducts() {
                const selectedFilters = getSelectedFilters();
                
				filteredProducts = allProducts.filter(product => {
					const attrs = product.attributes;
					
					return columnConfig.columns.every(column => {
						const filterValues = selectedFilters[column];
						return filterValues.length === 0 || filterValues.includes(attrs[column]);
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
            
            function updateClearButtonVisibility() {
                const selectedFilters = getSelectedFilters();
                const hasFilters = columnConfig.columns.some(column => selectedFilters[column].length > 0);
                const clearBtn = container.querySelector('.clear-filters-btn');
                // const tagsContainer = container.querySelector('.selected-filters-tags');
                
                if (clearBtn) {
                    clearBtn.style.display = hasFilters ? 'block' : 'none';
                }
                
                /*
                if (tagsContainer) {
                    tagsContainer.style.display = hasFilters ? 'flex' : 'none';
                }
                */
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
                container.querySelectorAll('.filter-select').forEach(select => {
                    select.value = '';
                    select.classList.remove('selected');
                });
                currentSort = { column: null, direction: 'asc' };
                itemsToShow = initialItemsPerLoad; // Reset to initial load
                filteredProducts = [...allProducts];
                updateSortIcons(null, 'asc');
				updateMobileFilterCounts(); // Add this line to reset disabled states
                updateResultsCount();
                showFilteredProducts();
                updateClearButtonVisibility();
                // updateSelectedFilterTags();
            }
            
            // Setup sort functionality
            function setupSortFunctionality() {
                const sortButtons = container.querySelectorAll('.filter-table-header .sort_category');
                
                sortButtons.forEach((sortBtn, index) => {
                    sortBtn.addEventListener('click', function(event) {
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
            
            // Add event listeners
            container.querySelectorAll('.filter-select').forEach(select => {
                // Initial state check
                if (select.value) select.classList.add('selected');
                select.addEventListener('change', function() {
                    if (this.value) {
                        this.classList.add('selected');
                    } else {
                        this.classList.remove('selected');
                    }
                    filterProducts();
                    updateClearButtonVisibility();
                    // updateSelectedFilterTags();
                });
            });
            
            const clearBtn = container.querySelector('.clear-filters-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    clearAllFilters();
                });
            }
            
            // Add event listener for chicken-wire-grade info icon
            const chickenWireGradeIcon = container.querySelector('.chicken-wire-grade');
            if (chickenWireGradeIcon) {
                chickenWireGradeIcon.addEventListener('click', function(event) {
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
                    
                    buttonElement.addEventListener('click', function(e) {
                        // Check if mobile layout (cards) is currently visible
                        const mobileLayout = document.querySelector('.mobile-layout');
                        const isCardsVisible = mobileLayout && mobileLayout.style.display !== 'none' && 
                                             (window.getComputedStyle(mobileLayout).display !== 'none');
                        
                        if (!isCardsVisible) {
                            // DESKTOP: Let original aira-pagination.js handle everything
                            return;
                        }
                        
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
                        
                    });
                }
            }
        }

        // 7. QUANTITY CONTROLS
        function setupQuantityControls(container) {
            // Handle quantity input field interactions
            container.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('click', function(event) {
                    event.stopPropagation();
                });
                
                input.addEventListener('focus', function(event) {
                    event.stopPropagation();
                });
                
                input.addEventListener('change', function(event) {
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
                btn.addEventListener('click', function() {
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
                setupFilterFunctionality(container, mobileLayout.products);
                setupQuantityControls(container);
                setupAddToCartAjax(container);
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

        // RUN THE CONVERSION
        try {
            const result = initializeMobileLayout();
            
            // Setup resize handler after initial layout
            setupResizeHandler();
            
            // console.log('VWO Mobile Layout Test: Success', result);
        } catch (error) {
            console.error('VWO Mobile Layout Test Error:', error);
        }
    }
    
    // Wait for table to load then initialize
    waitForElement('.which-mesh-category tbody tr.table_string', initMobileCards);
    
})();