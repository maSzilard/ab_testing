(function() {

    var menuItems = [
        { title: 'Wire Mesh & Netting', url: '/types/', image: '/wp-content/uploads/2025/06/wire-mesh-roll-category-450x450.jpg' },
        { title: 'Chain Link', url: '/fencing/chain-link/', image: '/wp-content/uploads/2019/08/grey-chain-450x450.jpg' },
        { title: 'Animal & Pet Fencing', url: '/animal-control/', image: '/wp-content/uploads/2023/03/wild-animals2-450x450.jpg' },
        { title: 'Wire Panels', url: '/types/panels/', image: '/wp-content/uploads/2023/04/all-panels-in-stock-450x450.jpg' },
        { title: 'Stock Fencing', url: '/fencing/stock/', image: '/wp-content/uploads/2025/03/Stock-Fence-C88015-50m.jpg' },
        { title: 'Security Fencing', url: '/fencing/security/', image: '/wp-content/uploads/2022/01/38mm-x-38mm-Premium-Black-PVC-Mesh-H57cm-xL30m-%E2%80%93-109g_Top-Front-450x450.jpg' },
        { title: 'Posts', url: '/posts/', image: '/wp-content/uploads/2023/07/t-posts-thumbnail-450x450.jpg' },
        { title: 'Gabion Baskets', url: '/gabion/', image: '/wp-content/uploads/2023/03/gabion3-450x450.jpg' },
        { title: 'Accessories & Tools', url: '/accessories-tools/', image: '/wp-content/uploads/2018/08/IMG_20191113_134434-450x450.jpg' }
    ];

    function createCardItem(item) {
        var itemId = item.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        return `<div class="wp-block-columns card-item is-layout-flex wp-container-core-columns-is-layout-9d6595d7 wp-block-columns-is-layout-flex">
            <div class="wp-block-column has-smb-white-background-color has-background is-layout-flow wp-block-column-is-layout-flow" style="flex-basis:100%">
                <div class="wp-block-group"><div class="wp-block-group__inner-container is-layout-constrained wp-block-group-is-layout-constrained">
                    <h2 class="wp-block-heading has-text-align-center card-head has-smb-white-color has-smb-green-background-color has-text-color has-background has-link-color" id="h-${itemId}">
                        <a href="${item.url}">${item.title}</a></h2>
                        <figure class="wp-block-image size-full">
                            <a href="${item.url}">
                            <img fetchpriority="high" decoding="async" width="350" height="350" src="${item.image}" alt="${item.title}" class="wp-image-22972"><button class="card-button">View Products</button>
                            </a>
                        </figure>
                        <p class="has-text-align-center has-smb-green-color has-text-color has-link-color"> <a href="${item.url}"> <strong>View All</strong> </a> </p>
                    </div>
                </div>
            </div>
        </div>`;
    }

    var cardsHtml = menuItems.map(createCardItem).join('');
    var cardRow = document.querySelector('.card-row');
    if (cardRow) {
        cardRow.innerHTML = cardsHtml;
    }

    var menu = document.querySelector('#menu-vertical-menu-1');
    if (menu) {
        var item28971 = menu.querySelector('.menu-item-28971');
        if (item28971) {
            item28971.insertAdjacentHTML('afterend', '<li class="menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-7890"><a href="/fencing/chain-link/">Chain Link</a></li>');
        }

        var item2529 = menu.querySelector('.menu-item-2529');
        if (item2529) {
            item2529.insertAdjacentHTML('afterend', 
                '<li class="menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-7891"><a href="/fencing/stock/">Stock Fencing</a></li>' +
                '<li class="menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-41553"><a href="/fencing/security/">Security Fencing</a></li>' +
                '<li class="menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-4852"><a href="/posts/">Posts</a></li>'
            );
        }

        var item7889 = menu.querySelector('.menu-item-7889');
        if (item7889) item7889.remove();

        var item7762 = menu.querySelector('.menu-item-7762');
        if (item7762) {
            item7762.classList.remove('emallshop-dropdown-menu');
            item7762.classList.add('emallshop-dropdown-submenu');
            var subMenu = menu.querySelector('.menu-item-23113 .sub-menu');
            if (subMenu) subMenu.appendChild(item7762);
            var caretArrow = item7762.querySelector('a .caret-arrow');
            if (caretArrow) caretArrow.remove();
        }
    }

    document.querySelectorAll('.card-item .wp-block-list').forEach(el => el.style.display = 'none');
})();
