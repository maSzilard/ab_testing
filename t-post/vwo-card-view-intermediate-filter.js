/**
 * VWO A/B Test: Card View Post-Type Filter
 * 
 * This script modifies the existing card-view to:
 * 1. Show ONLY intermediate post-type products
 * 2. Remove post-type filter from the mobile card view
 * 
 * Prerequisites: card-view.js must be running
 * Usage: Add this code to VWO custom JavaScript section AFTER card-view.js loads
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        targetAttribute: 'post-type',
        keepValue: 'intermediate',
        debug: false // Set to true for debugging
    };

    const utils = {
        log: function(message, data = null) {
            if (CONFIG.debug) {
                console.log('[VWO Card View Filter]', message, data || '');
            }
        }
    };

    /**
     * Find the post-type column index from the table
     */
    function findPostTypeColumnIndex() {
        utils.log('Looking for post-type column in table...');
        
        const headerRow = document.querySelector('.which-mesh-category thead tr:first-child');
        if (!headerRow) {
            utils.log('Header row not found');
            return -1;
        }

        const headers = headerRow.querySelectorAll('th');
        let columnIndex = -1;

        headers.forEach((header, index) => {
            const headerText = header.textContent.toLowerCase();
            if (headerText.includes('post') && headerText.includes('type')) {
                columnIndex = index;
                utils.log('Found post-type column at index:', index);
            }
        });

        return columnIndex;
    }

    /**
     * Check if a product row has intermediate post-type
     */
    function hasIntermediatePostType(row, columnIndex) {
        if (columnIndex === -1) return true;

        const cells = row.querySelectorAll('td');
        if (!cells[columnIndex]) return false;

        const cellText = cells[columnIndex].textContent.trim().toLowerCase();
        return cellText === CONFIG.keepValue.toLowerCase();
    }

    /**
     * Filter card view products to show only intermediate
     */
    function filterCardViewProducts() {
        utils.log('Filtering card view to show only intermediate products...');

        const mobileLayout = document.querySelector('.mobile-layout');
        if (!mobileLayout) {
            utils.log('Mobile layout not found, retrying...');
            return false;
        }

        const productCards = mobileLayout.querySelectorAll('.product-card');
        if (productCards.length === 0) {
            utils.log('No product cards found yet, retrying...');
            return false;
        }

        // Get post-type column index from original table
        const postTypeColumnIndex = findPostTypeColumnIndex();
        if (postTypeColumnIndex === -1) {
            utils.log('Post-type column not found, skipping filter');
            return true;
        }

        // Get original table rows to check post-type values
        const tableRows = document.querySelectorAll('.which-mesh-category tbody tr.table_string');
        const intermediateProductIds = new Set();

        tableRows.forEach(row => {
            if (hasIntermediatePostType(row, postTypeColumnIndex)) {
                const productId = row.getAttribute('data-product-id');
                if (productId) {
                    intermediateProductIds.add(productId);
                }
            }
        });

        utils.log('Found intermediate product IDs:', intermediateProductIds);

        // Hide non-intermediate cards
        let hiddenCount = 0;
        let visibleCount = 0;

        productCards.forEach(card => {
            const productId = card.getAttribute('data-product-id');
            
            if (!intermediateProductIds.has(productId)) {
                card.style.display = 'none';
                card.classList.add('filtered-out');
                hiddenCount++;
            } else {
                card.style.display = '';
                card.classList.remove('filtered-out');
                visibleCount++;
            }
        });

        utils.log(`Hidden ${hiddenCount} non-intermediate cards`);
        utils.log(`Visible ${visibleCount} intermediate cards`);

        // Update filter counts based on intermediate products only
        updateFilterCounts();

        // Update results count
        updateResultsCount();

        return true;
    }

    /**
     * Remove post-type filter from mobile card view
     */
    function removePostTypeFilter() {
        utils.log('Removing post-type filter from card view...');

        const mobileLayout = document.querySelector('.mobile-layout');
        if (!mobileLayout) {
            utils.log('Mobile layout not found');
            return false;
        }

        // Find and remove post-type filter header and select
        const filterHeaders = mobileLayout.querySelectorAll('.filter-table-header .filter-col');
        const filterSelects = mobileLayout.querySelectorAll('.filter-table-controls .filter-col');

        // Find the table headers to match with filter columns
        const tableHeaders = document.querySelectorAll('.which-mesh-category thead th');
        let postTypeFilterIndex = -1;

        tableHeaders.forEach((th, index) => {
            const headerText = th.textContent.toLowerCase();
            if (headerText.includes('post') && headerText.includes('type')) {
                postTypeFilterIndex = index;
            }
        });

        if (postTypeFilterIndex === -1) {
            utils.log('Post-type filter column not found');
            return true;
        }

        // Remove from filter headers (accounting for skipped columns like image, name, etc.)
        // We need to find the actual filter index, not the table column index
        let filterIndex = 0;
        let tableIndex = 0;
        
        tableHeaders.forEach((th, idx) => {
            const headerText = th.textContent.toLowerCase();
            const skipKeys = ['quantity', 'price', 'name', 'image', 'add to cart', 'product'];
            const shouldSkip = skipKeys.some(key => headerText.includes(key));
            
            if (!shouldSkip) {
                if (idx === postTypeFilterIndex) {
                    utils.log(`Post-type filter is at filter index: ${filterIndex}`);
                    
                    // Hide the header column
                    if (filterHeaders[filterIndex]) {
                        filterHeaders[filterIndex].style.display = 'none';
                        utils.log('Hidden post-type filter header');
                    }
                    
                    // Hide the filter select
                    if (filterSelects[filterIndex]) {
                        filterSelects[filterIndex].style.display = 'none';
                        utils.log('Hidden post-type filter select');
                    }
                }
                filterIndex++;
            }
            tableIndex++;
        });

        return true;
    }

    /**
     * Update filter option counts based on intermediate products only
     */
    function updateFilterCounts() {
        utils.log('Updating filter counts for intermediate products only...');

        const mobileLayout = document.querySelector('.mobile-layout');
        if (!mobileLayout) return;

        // Get all visible intermediate product cards
        const visibleCards = mobileLayout.querySelectorAll('.product-card:not(.filtered-out)');
        
        // Get all filter selects
        const filterSelects = mobileLayout.querySelectorAll('.filter-select');
        
        filterSelects.forEach(select => {
            const filterType = select.getAttribute('data-filter-type');
            
            // Skip post-type filter (it's hidden anyway)
            if (filterType === CONFIG.targetAttribute || filterType === 'post_type') {
                return;
            }
            
            // Count occurrences of each option value in intermediate products
            const counts = {};
            
            visibleCards.forEach(card => {
                const attrName = `data-${filterType.toLowerCase().replace(/([A-Z])/g, '-$1')}`;
                const value = card.getAttribute(attrName);
                
                if (value && value.trim() !== '') {
                    counts[value] = (counts[value] || 0) + 1;
                }
            });
            
            // Update option text and disabled state
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                if (option.value === '') return; // Skip "Filter" option
                
                const count = counts[option.value] || 0;
                const originalText = option.textContent.replace(/\s*\(\d+\)$/, '');
                option.textContent = `${originalText} (${count})`;
                option.disabled = count === 0;
            });
            
            utils.log(`Updated ${filterType} filter counts:`, counts);
        });
    }

    /**
     * Update the results count after filtering
     */
    function updateResultsCount() {
        const mobileLayout = document.querySelector('.mobile-layout');
        if (!mobileLayout) return;

        const visibleCards = mobileLayout.querySelectorAll('.product-card:not(.filtered-out):not([style*="display: none"])');
        const showingElement = mobileLayout.querySelector('#results-showing');
        const totalElement = mobileLayout.querySelector('#results-total');

        if (showingElement) {
            showingElement.textContent = visibleCards.length;
        }
        
        if (totalElement) {
            totalElement.textContent = visibleCards.length;
        }

        // Also update the show more button status
        const showMoreButton = document.querySelector('button.show-more');
        const statusElement = document.querySelector('.aira-table-pagination-status');
        
        if (statusElement) {
            statusElement.innerHTML = `Showing <span class="showing-value">${visibleCards.length}</span> out of <span class="total-value">${visibleCards.length}</span> items`;
        }

        if (showMoreButton) {
            // Hide show more if all cards are visible
            showMoreButton.style.display = 'none';
        }

        utils.log('Updated results count:', visibleCards.length);
    }

    /**
     * Monitor for new cards being added (from filters/sorting)
     */
    function setupMutationObserver() {
        const productCardsContainer = document.querySelector('.mobile-layout .product-cards');
        if (!productCardsContainer) {
            utils.log('Product cards container not found');
            return;
        }

        const observer = new MutationObserver((mutations) => {
            let shouldRefilter = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList && node.classList.contains('product-card')) {
                            shouldRefilter = true;
                        }
                    });
                }
            });

            if (shouldRefilter) {
                utils.log('New cards detected, reapplying filter...');
                setTimeout(() => {
                    filterCardViewProducts();
                }, 100);
            }
        });

        observer.observe(productCardsContainer, {
            childList: true,
            subtree: false
        });

        utils.log('Mutation observer setup complete');
    }

    /**
     * Override filter functionality to work with our filtered products
     */
    function interceptFilterFunctions() {
        utils.log('Setting up filter interception...');

        const mobileLayout = document.querySelector('.mobile-layout');
        if (!mobileLayout) return;

        // Monitor filter changes
        const filterSelects = mobileLayout.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', function() {
                utils.log('Filter changed, will reapply intermediate filter after original filter completes');
                setTimeout(() => {
                    filterCardViewProducts();
                    updateFilterCounts(); // Recalculate counts after filter
                }, 200);
            });
        });

        // Monitor clear filters button
        const clearBtn = mobileLayout.querySelector('.clear-filters-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                utils.log('Clear filters clicked, will reapply intermediate filter');
                setTimeout(() => {
                    filterCardViewProducts();
                    updateFilterCounts(); // Recalculate counts after clear
                }, 200);
            });
        }

        // Monitor sort buttons
        const sortButtons = mobileLayout.querySelectorAll('.sort_category');
        sortButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                utils.log('Sort clicked, will reapply intermediate filter');
                setTimeout(() => {
                    filterCardViewProducts();
                }, 200);
            });
        });

        utils.log('Filter interception setup complete');
    }

    /**
     * Main execution function
     */
    function execute() {
        utils.log('Starting card view intermediate filter...');

        // Wait for mobile layout to be present
        const mobileLayout = document.querySelector('.mobile-layout');
        if (!mobileLayout) {
            utils.log('Mobile layout not found, retrying in 500ms...');
            setTimeout(() => execute(), 500);
            return;
        }

        // Wait for product cards to be present
        const productCards = mobileLayout.querySelectorAll('.product-card');
        if (productCards.length === 0) {
            utils.log('Product cards not found yet, retrying in 500ms...');
            setTimeout(() => execute(), 500);
            return;
        }

        // Remove post-type filter from UI
        if (!removePostTypeFilter()) {
            utils.log('Failed to remove post-type filter, retrying...');
            setTimeout(() => execute(), 500);
            return;
        }

        // Filter products to show only intermediate
        if (!filterCardViewProducts()) {
            utils.log('Failed to filter products, retrying...');
            setTimeout(() => execute(), 500);
            return;
        }

        // Setup mutation observer to handle dynamic card additions
        setupMutationObserver();

        // Intercept filter functions
        interceptFilterFunctions();

        utils.log('Card view intermediate filter completed successfully');
    }

    /**
     * Initialize when card view is ready
     */
    function init() {
        // Wait a bit to ensure card-view.js has initialized
        setTimeout(() => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    execute();
                });
            } else {
                execute();
            }
        }, 1000); // Wait 1 second for card-view.js to initialize
    }

    // Start the process
    init();

    // Expose for debugging in VWO
    if (CONFIG.debug) {
        window.VWOCardViewFilter = {
            filterCardViewProducts: filterCardViewProducts,
            removePostTypeFilter: removePostTypeFilter,
            updateFilterCounts: updateFilterCounts,
            updateResultsCount: updateResultsCount,
            CONFIG: CONFIG
        };
    }

})();
