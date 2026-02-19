<?php
// Simple Panel Reduce Tabs - Minimal Version

// Add content containers
function add_panel_reduce_content() {
    if (is_product_category(410)) {
        echo '<div id="panel-reduce-content" style="display:none;">';
        echo do_shortcode("[AiraProductsByCategory term='410']");
        echo '</div>';
        echo '<div id="custom-panel-reduce-content" style="display:none;">';
        echo do_shortcode("[itc_build_custom_mesh_panel]");
        echo '</div>';
    }
}
add_action('woocommerce_after_shop_loop', 'add_panel_reduce_content', 15);

// Add simple tab system
function panel_reduce_simple_tabs() {
    if (is_product_category(410)) {
        ?>
        <style>

            .tabs-head ul {
                border-bottom: 1px solid #c4c4c4;
                display: flex;
                list-style: none;
                margin: 0 0 20px
            }

            .tabs-head li {
                font-size: 16px;
                background: #f2f2f2;
                border: 1px solid #c4c4c4;
                margin-bottom: -1px;
                margin-right: 2%;
                text-align: center;
                padding: 18px 30px;
                min-width: 180px;
                cursor: pointer
            }

            @media(max-width: 991px) {
                .tabs-head li {
                    font-size:15px;
                    padding: 14px 15px;
                    min-width: 0
                }
            }

            .tabs-head ul li.active {
                background-color: #fcfcfc;
                border-bottom: 1px solid #fcfcfc
            }

            .tab-content {
                padding: 20px 0;
            }
        </style>

        <script>
            jQuery(document).ready(function($) {
                // Add tabs to page
                $('#main-content .content-area').prepend(`
                    <div class="tabs-head new-tabs-head">
                        <ul>
                            <li><button class="tab-btn active" data-tab="products">Products</button></li>
                            <li><button class="tab-btn" data-tab="cuttosize">Cut to Size</button></li>
                        </ul>
                    </div>
                `);

                // Show products tab by default
                $('#panel-reduce-content').show();

                // Tab click handler
                $('.tab-btn').click(function() {
                    var tab = $(this).data('tab');
                    
                    // Update active button
                    $('.tab-btn').removeClass('active');
                    $(this).addClass('active');
                    
                    // Show/hide content
                    if (tab === 'products') {
                        $('#panel-reduce-content').show();
                        $('#custom-panel-reduce-content').hide();
                    } else {
                        $('#panel-reduce-content').hide();
                        $('#custom-panel-reduce-content').show();
                    }
                });
            });
        </script>
        <?php
    }
}
add_action('wp_head', 'panel_reduce_simple_tabs');