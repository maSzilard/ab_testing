// Add JavaScript and CSS to footer
add_action('wp_footer', 'custom_atc_script_styles');
function custom_atc_script_styles() {
if (!isset($_GET['devmode'])){ 
?>

<script>
    // Add styles to document
    (function() {
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = `
			.header-middle .woocommerce-notice,.header-navigation .woocommerce-notice{display:none!important}.ATC{display:none}.ATC .clearfix{clear:both;display:block}.ATC .ATC-background{position:fixed;top:0;left:0;right:0;bottom:0;background-color:#fff;opacity:.8;z-index:999998}.ATC .ATC-background--dark{background-color:#000}.ATC .ATC-loading{position:fixed;top:50%;left:20px;right:20px;bottom:0;margin-top:-80px;font-size:26px;width:auto;color:#000;text-align:center;height:120px;z-index:999999;display:none}.ATC .ATC-loading img{display:block;margin:0 auto;width:100px}.ATC .ATC-popup{position:fixed;width:100%;max-width:880px;margin:-150px auto 0;z-index:999999;background-color:#fff;left:0;right:0;top:55%;opacity:0;--webkit-opacity:0;visibility:hidden;display:block;border-radius:5px;-webkit-transition:all .2s linear;-moz-transition:all .2s linear;-o-transition:all .2s linear;-ms-transition:all .2s linear;-khtml-transition:all .2s linear;transition:all .2s linear}@media (max-width:880px){.ATC .ATC-popup{width:96%}}.ATC .ATC-popup.hasCrossSells{padding-bottom:0;margin-top:-320px;overflow:hidden}.ATC .ATC-popup.hasCrossSells .ATC-popup__product_cross_sells{padding:20px;position:relative;width:auto;margin-left:-15px;margin-right:-15px;margin-bottom:-15px}.ATC .ATC-popup.slideUp{top:50%;opacity:1;--webkit-opacity:1;visibility:visible}@media (max-width:340px){.ATC .ATC-popup.slideUp{top:45%}}.ATC .ATC-popup .ATC-popup-close{position:absolute;top:10px;color:#000;cursor:pointer;right:25px;font-size:16px}.ATC .ATC-popup .ATC-popup__inner{width:auto;padding:15px}.ATC .ATC-popup .ATC-popup__product{padding-left:140px;position:relative;max-width:80%;margin:30px auto 0}@media (max-width:880px){.ATC .ATC-popup .ATC-popup__product{max-width:100%}}.ATC .ATC-popup .ATC-popup__product h2{margin-bottom:15px;font-size:22px}.ATC .ATC-popup .ATC-popup__product ul{line-height:16px}.ATC .ATC-popup .ATC-popup__product ul strong{color:#03ba48}.ATC .ATC-popup .ATC-popup__product svg{position:absolute;width:100px;height:100px;left:0;top:0}@media (max-width:680px){.ATC .ATC-popup .ATC-popup__product{padding-left:0}.ATC .ATC-popup .ATC-popup__product h2{padding-left:80px;font-size:18px}.ATC .ATC-popup .ATC-popup__product ul{padding-left:80px}.ATC .ATC-popup .ATC-popup__product svg{width:65px;height:65px}}.ATC .ATC-popup .ATC-popup__breaker{margin-top:25px}.ATC .ATC-popup .ATC-popup__col-left{width:48%;float:left}@media (max-width:340px){.ATC .ATC-popup .ATC-popup__col-left{float:none;width:100%}}.ATC .ATC-popup .ATC-popup__col-right{width:48%;float:right}@media (max-width:340px){.ATC .ATC-popup .ATC-popup__col-right{margin-top:5px;float:none;width:100%}}.ATC .ATC-popup .ATC-popup__btn{text-align:center;padding:15px 0;background-color:#efefef;font-size:16px;font-weight:700;text-decoration:none!important;outline:0;display:block;border-radius:5px;cursor:pointer;position:relative}@media (max-width:680px){.ATC .ATC-popup .ATC-popup__btn{font-size:14px}}.ATC .ATC-popup .ATC-popup__btn--gray{color:#999}.ATC .ATC-popup .ATC-popup__btn--gray:hover{background-color:#333;color:#fff}.ATC .ATC-popup .ATC-popup__btn--orange{color:#fff;background-color:#f78400}.ATC .ATC-popup .ATC-popup__btn--orange:hover{background-color:#0ba2e8}.ATC .ATC-popup__product_cross_sells{display:block;position:relative;background-color:#efefef;margin-top:30px}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sells--h3{font-size:18px}@media (max-width:450px){.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sells--h3{font-size:16px}}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell__inner{padding:0 5px 5px;border:1px solid #efefef;border-radius:10px;background-color:#fff;text-align:center}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--image{display:block;width:100%;margin:0 auto;max-width:120px}@media (max-width:360px){.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--image{max-width:100px}}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--title{font-size:14px;font-weight:400;line-height:19px;height:32px;overflow:hidden;text-overflow:ellipsis;padding:5px 0}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--prices{text-align:center}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--prices .ATC-popup__product_cross_sell--prices-old{text-decoration:line-through;font-size:14px}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--prices .ATC-popup__product_cross_sell--price{color:#03ba48;font-weight:700;font-size:1.25em}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--prices .ATC-popup__product_cross_sell--price span{font-size:1rem}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--cart{margin-top:10px;text-align:center;min-width:190px}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--cart input[type=number]{width:35px;margin-right:5px;min-height:30px;border-radius:0;text-align:center}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--cart a.add_to_cart_button { height: 18px; line-height: 18px; display: inline-block; background: #03ba48; border: 1px solid #000000; color: #fff; padding-left: 30px; text-transform: uppercase; position: relative; font-size: 12px; top: -1px; }.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--cart a.add_to_cart_button i{display:block;font-size:14px;position:absolute;width:20px;height:20px;color:#fff;left:8px;top:9px}.ATC .ATC-popup__product_cross_sells .ATC-popup__product_cross_sell--cart a.add_to_cart_button:hover{background-color:#0ba2e8}.ATC .ATC-popup__product_cross_sells .ATC_carousel-btn{position:absolute;top:10px;background:rgb(3 186 72);color:#fff;border:none;padding:7px 15px;cursor:pointer;z-index:10}.ATC .ATC-popup__product_cross_sells .ATC_carousel-prev{right:55px}.ATC .ATC-popup__product_cross_sells .ATC_carousel-next{right:10px}
        `;
        document.body.appendChild(css);
    })();

// Main functionality
(function () {
    let utils = {};
	
	window.is_cross_sell = true;

    utils.waitForJquery = function (callback) {
        let timeout = setTimeout(function () {
            if (typeof window.jQuery !== 'function') {
                utils.waitForJquery(callback);
            } else {
                $ = window.jQuery;
                clearTimeout(timeout);
                callback();
            }
        }, 100);
    };

    utils.waitForSwiper = function (callback) {
        let timeout = setTimeout(function () {
            if (typeof window.Swiper !== 'function') {
                utils.waitForSwiper(callback);
            } else {
                clearTimeout(timeout);
                callback();
            }
        }, 100);
    };

    utils.waitForElement = function (selector) {
        let timeout;
        return new Promise(function (resolve) {
            if (document.querySelector(selector)) {
                clearTimeout(timeout);
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(function (mutations) {
                if (document.querySelector(selector)) {
                    clearTimeout(timeout);
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            timeout = setTimeout(function () {
                observer.disconnect();
            }, 5000);

            if (typeof document.body === 'object') {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            } else if (document.querySelector(selector)) {
                clearTimeout(timeout);
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
    };

    utils.addSwiper = function () {
        if (typeof window.is_cross_sell != 'undefined') {
            utils.waitForJquery(function () {
                if (typeof window.Swiper !== 'function') {
                    jQuery('<link/>', {
                        rel: 'stylesheet',
                        type: 'text/css',
                        href: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'
                    }).appendTo('head');

                    // Append external JavaScript file
                    jQuery('<script/>', {
                        type: 'text/javascript',
                        src: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
                    }).appendTo('head');
                }
            });
        }
    };

    utils.init = function () {
        utils.waitForJquery(function () {
            jQuery('body').append(`
                <section class="ATC">
                    <div class="ATC-background"></div>
                    <div class="ATC-loading">
                        <img src="https://www.wirefence.co.uk/wp-content/themes/emallshop-child/assets/images/ajax-loader-green.gif" />
                        Please wait whilst we update your selection
                    </div>
                    <div class="ATC-popup">
                        <div class="ATC-popup-close"><i class="fa fa-times"></i></div>
                        <div class="ATC-popup__inner">
                            <div class="ATC-popup__product">
                                <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" class="LEbRcA LSSoWO" aria-hidden="true" focusable="false"><mask id="roundedCheck_svg__a" x="0" y="0" width="88" height="88" style="mask-type: alpha;"><path fill="#000" d="M0 0h88v88H0z"></path></mask><g mask="url(#roundedCheck_svg__a)"><path d="M44 0a44 44 0 1 1 0 88 44 44 0 0 1 0-88Z" fill="#75BD2B"></path><path d="M43.5 28A47.49 47.49 0 0 0 1.15 54a44 44 0 0 0 85.37 1.36A47.51 47.51 0 0 0 43.5 28Z" fill="#3F901C"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M44 1a43 43 0 1 0 .058 86A43 43 0 0 0 44 1Zm0-1a44 44 0 1 1 0 88 44 44 0 0 1 0-88Z" fill="#3F971A"></path><path d="M63.558 22.946a1.7 1.7 0 0 0-2.412 0L39.391 44.9a1.69 1.69 0 0 1-2.414 0L26.939 34.719a1.7 1.7 0 0 0-2.414 0L18.5 40.984a1.71 1.71 0 0 0-.5 1.2c.003.462.184.906.507 1.237 7.743 8.11 16.556 16.5 18.472 18.084a1.708 1.708 0 0 0 2.414 0L69.5 30.978a1.733 1.733 0 0 0 0-2.435l-5.942-5.597Z" fill="#fff"></path></g></svg>
                                <h2>Your product has been added to cart!</h2>
                                <ul>
                                    <li><strong>UK WIDE DELIVERY</strong> - including remote locations</li>
                                    <li><strong>EASY RETURNS</strong> - including shipping costs</li>
                                </ul>
                                <div class="ATC-popup__breaker"></div>
                                <div class="ATC-popup__col-left">
                                    <a href="/cart/" class="ATC-popup__btn ATC-popup__btn--orange">Checkout Now</a>
                                </div>
                                <div class="ATC-popup__col-right">
                                    <span class="ATC-popup__btn ATC-popup__btn--gray">Continue shopping</span>
                                </div>
                                <div class="clearfix"></div>
                            </div>
                            <div class="ATC-popup__product_cross_sells ATC-swiper swiper"></div>
                        </div>
                    </div>
                </section>
            `);

            const formatPrice = function (price) {
                let num = parseFloat(price);
                return num % 1 === 0 ? num.toFixed(2) : num.toString().includes('.') ? num.toString().padEnd(num.toString().indexOf('.') + 3, '0') : num.toFixed(2);
            };

            const getCrossSells = function (productId) {
                jQuery.ajax({
                    url: '/wp-json/custom/v1/cross-sells/' + productId,
                    type: 'GET',
                    success: function (data) {
                        console.log(data);
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
                                crossSells += '<a href="/?add-to-cart=' + product.id + '" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart addToCartCrossSell" data-product_id="' + product.id + '" data-product_sku="" data-product-title="' + product.title + '" aria-label="Add “' + product.title + '” to your basket" rel="nofollow"><i class="fa fa-shopping-cart"></i>ADD TO CART</a>';
                                crossSells += '</div>';

                                crossSells += '</div>';
                                crossSells += '</div>';
                            });

                            crossSells += '</div>';

                            jQuery('.ATC-popup__product_cross_sells').html(crossSells);

                            jQuery('.ATC-popup__product_cross_sell--cart input').on('keyup, change', function(){
                                var qty = jQuery(this).val();
                                console.log(qty);
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

            let loadingTimeout;

            const showLoading = function (that) {
                // Clear notice text
                jQuery('.col-md-2 .header-right .woocommerce-notice').text('');

                if (typeof window.is_cross_sell != 'undefined') {
                    utils.addSwiper();

                    // Clear cross sells
                    jQuery('.ATC-popup__product_cross_sells').html('');
                    jQuery('.ATC-popup').removeClass('hasCrossSells');
                    try {
                        if (that.hasAttribute('data-product_id')) {
                            var productId = that.getAttribute('data-product_id');
                            if (productId && productId != null) {
                                getCrossSells(productId);
                            }
                        } else {
                            if (that.hasAttribute('value')) {
                                var productId = that.getAttribute('value');
                                if (productId && productId != null) {
                                    getCrossSells(productId);
                                }
                            }
                        }
                    } catch (e) {}
                }

                clearTimeout(loadingTimeout);
                jQuery('.ATC-background').removeClass('ATC-background--dark');
                jQuery('.ATC-loading').show();
                jQuery('.ATC-popup').removeClass('slideUp');
                jQuery('.ATC').show();

                loadingTimeout = setTimeout(function () {
                    jQuery('.ATC-loading').hide();
                    jQuery('.ATC').hide();
                }, 20000);
            };

            const showSuccess = function () {
                clearTimeout(loadingTimeout);
                jQuery('#mini-cart-items.mini-cart-items.woocommerce').removeClass('active');
                jQuery('.ATC-background').addClass('ATC-background--dark');
                jQuery('.ATC-popup').addClass('slideUp');
                jQuery('.ATC-loading').hide();

                const noticeText = jQuery('.col-md-2 .header-right .woocommerce-notice').text().trim();
                if (noticeText.length <= 1) {
                    jQuery('.ATC-popup__product h2').html('Your product has been added to cart!');
                } else {
                    jQuery('.ATC-popup__product h2').html(noticeText);
                }
            };

            jQuery(document).ajaxComplete(function (event, xhr, settings) {
                setTimeout(function () {
                    try {
                        if (settings.url.indexOf('wc-ajax=get_refreshed_fragment') > -1 || settings.url.indexOf('wp-admin/admin-ajax.php') > -1 || settings.url.indexOf('wc-ajax=add_to_cart') > -1) {
                            showSuccess();
                        }
                    } catch (e) {
                        showSuccess();
                    }
                }, 500);
            });

            jQuery(document).on('click', '.add_to_cart_button, .single_add_to_cart_button, .add-to-cart', function () {
                if (jQuery(this).hasClass('addToCartCrossSell')) {
                    jQuery(this).addClass('added');
                } else {
                    showLoading(this);
                }
            });

            utils.waitForElement('form.calculate-wf-custom-gabion-form input[type="submit"].btn').then(function () {
                jQuery('form.calculate-wf-custom-gabion-form input[type="submit"].btn').click(function () {
                    showLoading(this);
                });
            });

            jQuery(document).on('click', '.ATC-background, .ATC-popup-close, .ATC-popup__btn', function () {
                jQuery('.ATC-background').removeClass('ATC-background--dark');
                jQuery('.ATC-loading').hide();
                jQuery('.ATC-popup').removeClass('slideUp');
                jQuery('.ATC').hide();
            });
        });
    };

    utils.init();
})();


</script>
<?php
}
}