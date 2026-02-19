/**
 * VWO A/B Test: Post-Type Column Removal and Product Filtering
 * 
 * This script removes the post-type column from the product table and hides
 * all products except those with "intermediate" post-type values.
 * 
 * Usage: Add this code to VWO custom JavaScript section
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        targetAttribute: 'post-type',
        keepValue: 'intermediate', // Only show products with this post-type value
        tableSelector: 'table.which-mesh-category',
        headerRowSelector: 'thead tr:first-child',
        filterRowSelector: '#aira_ajax_filters',
        productRowsSelector: '#aira_ajax_products .table_string',
        debug: false // Set to true for debugging
    };

    // Utility functions
    const utils = {
        log: function(message, data = null) {
            if (CONFIG.debug) {
                console.log('[VWO Post-Type Filter]', message, data || '');
            }
        },

        // Get all elements matching selector
        getElements: function(selector) {
            return document.querySelectorAll(selector);
        },

        // Get single element matching selector
        getElement: function(selector) {
            return document.querySelector(selector);
        },

        // Hide element by setting display: none
        hideElement: function(element) {
            if (element) {
                element.style.display = 'none';
            }
        },

        // Check if element contains specific text
        containsText: function(element, text) {
            return element && element.textContent && 
                   element.textContent.toLowerCase().includes(text.toLowerCase());
        }
    };

    // Main functionality
    const PostTypeFilter = {
        
        /**
         * Find the column index of the post-type attribute
         */
        findPostTypeColumnIndex: function() {
            utils.log('Looking for post-type column...');
            
            const headerRow = utils.getElement(CONFIG.headerRowSelector);
            if (!headerRow) {
                utils.log('Header row not found');
                return -1;
            }

            const headers = headerRow.querySelectorAll('th');
            let columnIndex = -1;

            headers.forEach((header, index) => {
                const headerText = header.textContent.toLowerCase();
                // Look for "post type", "post-type", or similar variations
                if (headerText.includes('post') && headerText.includes('type')) {
                    columnIndex = index;
                    utils.log('Found post-type column at index:', index);
                }
            });

            if (columnIndex === -1) {
                utils.log('Post-type column not found in headers');
            }

            return columnIndex;
        },

        /**
         * Remove the post-type column header
         */
        removeColumnHeader: function(columnIndex) {
            utils.log('Removing post-type column header...');
            
            const headerRow = utils.getElement(CONFIG.headerRowSelector);
            if (!headerRow) return false;

            const headers = headerRow.querySelectorAll('th');
            if (headers[columnIndex]) {
                utils.hideElement(headers[columnIndex]);
                utils.log('Post-type header hidden');
                return true;
            }
            return false;
        },

        /**
         * Remove the post-type filter dropdown
         */
        removeFilterDropdown: function(columnIndex) {
            utils.log('Removing post-type filter dropdown...');
            
            const filterRow = utils.getElement(CONFIG.filterRowSelector);
            if (!filterRow) return false;

            const filterCells = filterRow.querySelectorAll('td');
            if (filterCells[columnIndex]) {
                utils.hideElement(filterCells[columnIndex]);
                utils.log('Post-type filter dropdown hidden');
                return true;
            }
            return false;
        },

        /**
         * Hide post-type data cells in all product rows
         */
        hidePostTypeDataCells: function(columnIndex) {
            utils.log('Hiding post-type data cells...');
            
            const productRows = utils.getElements(CONFIG.productRowsSelector);
            let hiddenCells = 0;

            productRows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells[columnIndex]) {
                    utils.hideElement(cells[columnIndex]);
                    hiddenCells++;
                }
            });

            utils.log(`Hidden ${hiddenCells} post-type data cells`);
            return hiddenCells > 0;
        },

        /**
         * Check if a product row has the target post-type value
         */
        hasIntermediatePostType: function(row, columnIndex) {
            const cells = row.querySelectorAll('td');
            if (!cells[columnIndex]) return false;

            const cellText = cells[columnIndex].textContent.trim().toLowerCase();
            return cellText === CONFIG.keepValue.toLowerCase();
        },

        /**
         * Hide products that don't have intermediate post-type value
         */
        filterProducts: function(columnIndex) {
            utils.log('Filtering products to show only intermediate post-type...');
            
            const productRows = utils.getElements(CONFIG.productRowsSelector);
            let hiddenProducts = 0;
            let visibleProducts = 0;

            productRows.forEach(row => {
                // Skip banner rows
                if (row.classList.contains('gabion-banner-row')) {
                    return;
                }

                if (!this.hasIntermediatePostType(row, columnIndex)) {
                    row.classList.add('hide');
                    hiddenProducts++;
                } else {
                    // Ensure intermediate products are visible
                    row.classList.remove('hide');
                    visibleProducts++;
                }
            });

            utils.log(`Hidden ${hiddenProducts} non-intermediate products`);
            utils.log(`Visible ${visibleProducts} intermediate products`);
            
            return { hidden: hiddenProducts, visible: visibleProducts };
        },

        /**
         * Update banner colspan to account for removed column
         */
        updateBannerColspan: function() {
            utils.log('Updating banner colspan...');
            
            // Find any existing banner rows and update their colspan
            const bannerCells = utils.getElements('.gabion-banner-row-td');
            bannerCells.forEach(cell => {
                const currentColspan = parseInt(cell.getAttribute('colspan') || '1');
                const newColspan = Math.max(1, currentColspan - 1); // Subtract 1 for removed column
                cell.setAttribute('colspan', newColspan.toString());
                utils.log(`Updated banner colspan from ${currentColspan} to ${newColspan}`);
            });
        },

        /**
         * Update the existing filtering system
         */
        updateFilteringSystem: function() {
            utils.log('Updating filtering system...');
            
            // Wait a bit for DOM to settle, then access the functions from the global scope
            setTimeout(() => {
                try {
                    // Access functions from the existing aira_frontend.js
                    const doc = document;
                    const event = new Event('DOMContentLoaded');
                    
                    // Try to trigger the existing filter update functions
                    // These functions are defined in the main application scope
                    const filterSelects = utils.getElements('select.attr_filters_category');
                    
                    // Manually trigger filter count update
                    this.manuallyUpdateFilterCounts();
                    
                    // Reapply row striping
                    this.manuallyReapplyRowStriping();
                    
                    // Update banner colspan
                    this.updateBannerColspan();
                    
                    utils.log('Filter system updated successfully');
                } catch (error) {
                    utils.log('Error updating filter system:', error);
                }
            }, 100);
        },

        /**
         * Manually update filter counts (fallback if global functions not available)
         */
        manuallyUpdateFilterCounts: function() {
            const filterSelects = utils.getElements('select.attr_filters_category');
            filterSelects.forEach((select) => {
                const attrSlug = select.getAttribute('data-attr_slug');
                
                // Skip post-type attribute
                if (attrSlug === CONFIG.targetAttribute) {
                    return;
                }
                
                const options = select.querySelectorAll('option');
                options.forEach((option) => {
                    const optionValue = option.value;
                    if (optionValue !== '') {
                        // Count visible products with this attribute value
                        const visibleRows = utils.getElements('.table_string:not(.hide):not(.gabion-banner-row)');
                        let count = 0;
                        
                        visibleRows.forEach((row) => {
                            if (row.classList.contains(optionValue)) {
                                count++;
                            }
                        });
                        
                        // Update option text with count
                        const originalName = option.textContent.replace(/\s*\(\d+\)$/, '');
                        option.textContent = `${originalName} (${count})`;
                        option.disabled = count === 0;
                    }
                });
            });
        },

        /**
         * Manually reapply row striping (fallback if global functions not available)
         */
        manuallyReapplyRowStriping: function() {
            // Remove existing striping classes
            const tableRows = utils.getElements('.table_string');
            tableRows.forEach((row) => {
                row.classList.remove('odd-visible', 'even-visible');
            });

            // Apply new striping to visible rows only (excluding banner)
            let visibleIndex = 0;
            const visibleRows = utils.getElements('.table_string:not(.hide):not(.gabion-banner-row)');
            visibleRows.forEach((row) => {
                if (visibleIndex % 2 === 0) {
                    row.classList.add('odd-visible');
                } else {
                    row.classList.add('even-visible');
                }
                visibleIndex++;
            });
        },

        /**
         * Main execution function
         */
        execute: function() {
            utils.log('Starting VWO post-type filter execution...');

            // Wait for table to be present
            const table = utils.getElement(CONFIG.tableSelector);
            if (!table) {
                utils.log('Table not found, retrying in 500ms...');
                setTimeout(() => this.execute(), 500);
                return;
            }

            // Find post-type column
            const columnIndex = this.findPostTypeColumnIndex();
            if (columnIndex === -1) {
                utils.log('Post-type column not found - filter not applied');
                return;
            }

            // Remove column header
            if (!this.removeColumnHeader(columnIndex)) {
                utils.log('Failed to remove column header');
                return;
            }

            // Remove filter dropdown
            this.removeFilterDropdown(columnIndex);

            // Hide post-type data cells
            this.hidePostTypeDataCells(columnIndex);

            // Filter products to show only intermediate
            const filterResult = this.filterProducts(columnIndex);
            
            if (filterResult.visible === 0) {
                utils.log('Warning: No intermediate products found!');
            }

            // Update the filtering system
            this.updateFilteringSystem();

            utils.log('VWO post-type filter execution completed');
        }
    };

    // VWO Integration Helper
    const VWOIntegration = {
        
        /**
         * Check if we're running in VWO environment
         */
        isVWOEnvironment: function() {
            return typeof window._vwo_code !== 'undefined' || 
                   typeof window.VWO !== 'undefined' ||
                   window.location.search.includes('vwo_') ||
                   document.querySelector('script[src*="vwo"]') !== null;
        },

        /**
         * Wait for VWO to be ready before executing
         */
        waitForVWO: function(callback, maxAttempts = 50) {
            let attempts = 0;
            
            const checkVWO = () => {
                attempts++;
                
                if (this.isVWOEnvironment() || attempts >= maxAttempts) {
                    utils.log(`VWO ready after ${attempts} attempts`);
                    callback();
                } else {
                    setTimeout(checkVWO, 100);
                }
            };
            
            checkVWO();
        },

        /**
         * Execute with VWO compatibility
         */
        execute: function() {
            utils.log('Initializing VWO Post-Type Filter...');
            
            // Add VWO tracking
            if (this.isVWOEnvironment()) {
                utils.log('VWO environment detected');
                
                // Track the variation execution
                try {
                    if (window.VWO && window.VWO.push) {
                        window.VWO.push(['track.event', 'post_type_filter_applied']);
                    }
                } catch (e) {
                    utils.log('VWO tracking error:', e);
                }
            }
            
            // Execute the main filter
            PostTypeFilter.execute();
        }
    };

    // Initialize when DOM is ready
    function init() {
        // Add a small delay to ensure all scripts are loaded
        setTimeout(() => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    VWOIntegration.waitForVWO(() => {
                        VWOIntegration.execute();
                    });
                });
            } else {
                // DOM is already ready
                VWOIntegration.waitForVWO(() => {
                    VWOIntegration.execute();
                });
            }
        }, 200); // Small delay to let other scripts initialize
    }

    // Start the process
    init();

    // Expose for debugging in VWO
    if (CONFIG.debug) {
        window.VWOPostTypeFilter = {
            PostTypeFilter: PostTypeFilter,
            VWOIntegration: VWOIntegration,
            utils: utils,
            CONFIG: CONFIG
        };
    }

})();
