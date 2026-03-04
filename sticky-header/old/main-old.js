function initTableHeaderSticky() {
    const filterWrapper = document.querySelector('.filter-table-wrapper');
    const productsHeader = document.querySelector('.woocommerce-products-header');
    const fullProductDetails = document.querySelector('#full-product-details');
    
    if (!filterWrapper || !productsHeader || !fullProductDetails) return;
    
    let isFilterSticky = false;
    let adminBarHeight = 0;
    
    // Get admin bar height
    const adminBar = document.querySelector('#wpadminbar');
    if (adminBar) {
        // adminBarHeight = adminBar.offsetHeight;
    }
    
    function handleScroll() {
        const windowWidth = window.innerWidth;
        
        // Only work on mobile/tablet (under 1024px)
        if (windowWidth >= 1024) {
            removeFilterSticky();
            showNormalHeader();
            return;
        }
        
        const productsHeaderRect = productsHeader.getBoundingClientRect();
        const fullProductRect = fullProductDetails.getBoundingClientRect();
        
        // Check positions
        const hasLeftProductsHeader = productsHeaderRect.bottom <= adminBarHeight;
        const hasReachedFullProduct = fullProductRect.top <= adminBarHeight;
        
        if (hasReachedFullProduct && isFilterSticky) {
            // Reached full product details - remove filter sticky, show normal header
            removeFilterSticky();
            showNormalHeader();
        } else if (hasLeftProductsHeader && !hasReachedFullProduct && !isFilterSticky) {
            // Left products header but not yet at full product - show filter sticky, hide normal header
            addFilterSticky();
            hideNormalHeader();
        } else if (!hasLeftProductsHeader && isFilterSticky) {
            // Back to products header area - remove filter sticky, show normal header
            removeFilterSticky();
            showNormalHeader();
        }
    }
    
    function addFilterSticky() {
        filterWrapper.style.position = 'fixed';
        filterWrapper.style.top = `${adminBarHeight}px`;
        filterWrapper.style.left = '0';
        filterWrapper.style.zIndex = '9999';
        filterWrapper.style.margin = '0 15px';
        filterWrapper.style.width = 'calc(100% - 30px)';
        isFilterSticky = true;
    }
    
    function removeFilterSticky() {
        filterWrapper.style.position = '';
        filterWrapper.style.top = '';
        filterWrapper.style.left = '';
        filterWrapper.style.zIndex = '';
        filterWrapper.style.margin = '';
        filterWrapper.style.width = '';
        isFilterSticky = false;
    }
    
    function hideNormalHeader() {
        const stickyHeaders = document.querySelectorAll('.es-sticky');
        stickyHeaders.forEach(header => {
            header.style.display = 'none';
        });
    }
    
    function showNormalHeader() {
        const stickyHeaders = document.querySelectorAll('.es-sticky');
        stickyHeaders.forEach(header => {
            header.style.display = '';
        });
    }
    
    // Listen for scroll and resize
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Initial check
    handleScroll();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTableHeaderSticky);