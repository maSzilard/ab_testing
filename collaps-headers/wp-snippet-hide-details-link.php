/**
 * VWO A/B Test: Hide .product-details-link early to prevent flash
 * before VWO jumplinks script replaces it.
 *
 * Safety: reveals the button after 3 seconds if VWO doesn't run.
 * Remove this snippet when the A/B test is complete.
 */
add_action('wp_head', function () {
    if (!is_product_category()) return;
    ?>
    <style id="vwo-hide-details-link">
        .product-details-link { visibility: hidden; }
    </style>
    <script>
        setTimeout(function () {
            var link = document.querySelector('.product-details-link');
            if (link && !document.querySelector('.vwo-jumplinks')) {
                link.style.visibility = 'visible';
            }
        }, 3000);
    </script>
    <?php
}, 1);
