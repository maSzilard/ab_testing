jQuery(document).ready(function ($) {
    function initializeMenu(menuSelector, isMobile = false) {
        // Remove any existing click handlers
        $(`${menuSelector} .menu-toggle`).off('click');
        
        const activeClass = isMobile ? 'active' : 'open-item';
        
        if (isMobile) {
            // Mobile menu click handling
            $(`${menuSelector} .menu-item-has-children`).on('click', function (e) {
                const $menuItem = $(this);
                const $link = $menuItem.find('> a');
                
                console.log('Mobile menu clicked:', {
                    menuSelector,
                    hasActiveClass: $menuItem.hasClass(activeClass),
                    href: $link.attr('href')
                });
                
                // If menu is already open and clicked on the link, allow navigation
                if ($menuItem.hasClass(activeClass) && $(e.target).is('a')) {
                    return true;
                }
                
                // Prevent default behavior
                e.preventDefault();
                
                // Trigger the toggle
                $menuItem.find('> .menu-toggle').click();
                return false;
            });
        } else {
            // Desktop menu click handling
            $(`${menuSelector} .menu-item-has-children > a`).on('click', function (e) {
                const $menuItem = $(this).parent();
                
                console.log('Desktop menu clicked:', {
                    menuSelector,
                    hasActiveClass: $menuItem.hasClass(activeClass),
                    href: $(this).attr('href')
                });
                
                // If menu is already open, allow the link to work
                if ($menuItem.hasClass(activeClass)) {
                    return true;
                }
                
                // If menu is closed, prevent navigation and open the menu
                e.preventDefault();
                $menuItem.find('> .sub-menu').slideDown();
                $menuItem.addClass(activeClass);
                
                // Close other menus
                $menuItem.siblings('.menu-item-has-children').removeClass(activeClass)
                    .find('> .sub-menu').slideUp();
                
                return false;
            });
        }

        // Handle toggle button clicks (for mobile only)
        if (isMobile) {
            $(`${menuSelector} .menu-item-has-children > span.menu-toggle`).on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const $menuItem = $(this).parent();
                const $subMenu = $menuItem.find('> .sub-menu');
                
                console.log('Toggle clicked:', {
                    menuSelector,
                    currentlyHasClass: $menuItem.hasClass(activeClass),
                    subMenuVisible: $subMenu.is(':visible')
                });
                
                // Close other menus within the same menu context
                $menuItem.siblings().find('.sub-menu').slideUp();
                $menuItem.siblings('.menu-item-has-children').removeClass(activeClass);
                
                // Toggle current menu
                $subMenu.slideToggle();
                $menuItem.toggleClass(activeClass);
                
                return false;
            });
        }
    }

    // Initialize mobile menu
    initializeMenu('.mobile-main-menu', true);
    
    // Initialize desktop menu
    initializeMenu('.menu-vertical-menu-container', false);

    // For VWO AB Testing
    window.initializeMenu = initializeMenu;
});
