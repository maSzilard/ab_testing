!function() {
    "use strict";
    
    var e = window.jQuery,
        t = {
            waitForJquery: function(n) {
                var o = setTimeout((function() {
                    "function" != typeof window.jQuery ? t.waitForJquery(n) : (e = window.jQuery, clearTimeout(o), n())
                }), 100)
            },
            
            gabionCalculator: function() {
                function t() {
                    var e = jQuery(".gabion-cut-to-size .calculate-wf-custom-gabion-form"),
                        t = e.find('[name="wf_finish"]'),
                        n = e.find('[name="wf_diameter"]'),
                        o = t.val();
                    
                    n.empty();
                    
                    if (e.length > 0) {
                        php_vars.diameters.forEach((function(e) {
                            if ("yes" !== e.hide && ("pvc" === o && ["3.2", "4.3"].includes(e.size) || "galfan-coated-steel" === o && ["3", "4", "5"].includes(e.size) || "some-other-value" === o)) {
                                n.append(new Option(e.size + "mm", e.size + "mm"))
                            }
                        }));
                    }
                    
                    return false;
                }
                
                e(window).on("load", (function() {
                    t()
                }));
                
                e(document).ready((function() {
                    var n = wp_ajax_calculate_custom_gabion.ajaxurl;
                    
                    e('select[name="wf_finish"]').on("change", t);
                    
                    e(".itc-add-to-cart-custom-gabion").on("click", (function(t) {
                        t.preventDefault();
                        
                        var o = e(this),
                            a = o.closest("form").serialize(),
                            i = o.parent(),
                            s = e('<div class="loadingio-spinner-spinner-9ejzu2yduw4"><div class="ldio-ag8ad00iq89"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>');
                        
                        i.append(s);
                        
                        var c = {
                            action: wp_ajax_calculate_custom_gabion.action,
                            _ajax_nonce: wp_ajax_calculate_custom_gabion.nonce,
                            type_of_action: "calculate",
                            formData: a
                        };
                        
                        return e.ajax({
                            type: "post",
                            url: n,
                            data: c,
                            beforeSend: function() {},
                            complete: function() {
                                s.remove()
                            },
                            success: function(t) {
                                if (t.fragments) {
                                    e(document.body).trigger("added_to_cart", [t.fragments, t.cart_hash, o]);
                                    jQuery(".woocommerce-notice").text("Custom gabion has been added to your Cart");
                                    jQuery(".woocommerce-notice").fadeIn("slow", (function() {
                                        jQuery(".woocommerce-notice").delay(3e3).fadeOut()
                                    }));
                                }
                            },
                            error: function(e, t, n) {
                                console.log("Status: " + t);
                                console.log("HTTP Error: " + e.status);
                                console.log("Error Thrown: " + n);
                                console.log("Response Text: " + e.responseText);
                            }
                        }), false;
                    }));
                }));
            },
            
            waitForElement: function(e) {
                var t;
                return new Promise((function(n) {
                    if (document.querySelector(e)) {
                        clearTimeout(t);
                        return n(document.querySelector(e));
                    }
                    
                    var o = new MutationObserver((function(a) {
                        if (document.querySelector(e)) {
                            clearTimeout(t);
                            n(document.querySelector(e));
                            o.disconnect();
                        }
                    }));
                    
                    t = setTimeout((function() {
                        o.disconnect()
                    }), 5e3);
                    
                    if ("object" == typeof document.body) {
                        o.observe(document.body, {
                            childList: true,
                            subtree: true
                        });
                    } else if (document.querySelector(e)) {
                        clearTimeout(t);
                        n(document.querySelector(e));
                        o.disconnect();
                    }
                }));
            },
            
            init: function() {
                // Wait for body element and add classes
                t.waitForElement("body").then((function(e) {
                    e.style.display = "block";
                    e.classList.add("GABIONTABBED");
                }));
                
                // Add tabs structure
                t.waitForElement("#main-content .content-area").then((function(e) {
                    e.insertAdjacentHTML("afterbegin", `
                        <ul class="tabs-head new-tabs-head">
                            <li class="active products" showtab="default"><span>Products</span></li>
                            <li class="cuttosize" showtab="new-ajax-content-cuttosize"><span>Cut to Size</span></li>
                            <li class="customerimages" showtab="customerimages"><span>Customer Images</span></li>
                            <li class="learninghub" showtab="learninghub"><span>Learning Hub</span></li>
                        </ul>
                        <div class="new-ajax-contents">
                            <div class="new-ajax-content new-ajax-content-cuttosize">
                                <img class="new-ajax-content-loader" src="https://www.wirefence.co.uk/wp-content/themes/emallshop-child/assets/images/ajax-loader-green.gif" />
                            </div>
                        </div>
                    `);
                }));
                
                // Add signposts and loader
                t.waitForElement(".download-block").then((function(e) {
                    e.insertAdjacentHTML("afterend", `
                        <div class="tabchangeloader">
                            <img class="new-ajax-content-loader" src="https://www.wirefence.co.uk/wp-content/themes/emallshop-child/assets/images/ajax-loader-green.gif" />
                        </div>
                        <div class="signposts">
                            <div class="signpost hidden" showtab="default">
                                Products 
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 4L16 12L8 20" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="signpost" showtab="new-ajax-content-cuttosize">
                                Cut to Size 
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 4L16 12L8 20" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="signpost" showtab="customerimages">
                                Customer Images 
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 4L16 12L8 20" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                            <div class="signpost" showtab="learninghub">
                                Learning Hub 
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 4L16 12L8 20" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </div>
                        </div>
                    `);
                }));
                
                // Handle gallery photo list
                t.waitForElement(".gallery-photo-list .add-more").then((function(t) {
                    document.querySelector(".gallery-photo-list").insertAdjacentHTML("beforebegin", '<h1 class="biggraytitle">Customer Images</h1>');
                    document.querySelector(".gallery-photo-list").insertAdjacentHTML("afterend", '<h1 class="biggraytitle-learninghub">Learning Hub</h1>');
                    
                    for (var n = 0; n < 10; n++) {
                        setTimeout((function() {
                            e(".gallery-photo-list .add-more").click()
                        }), 100 * n);
                    }
                }));
                
                // Add gabion banner
                t.waitForElement("#main-content .content-area .product-items").then((function(e) {
                    e.insertAdjacentHTML("beforeend", `
                        <div class="gabion-banner">
                            <div class="gabion-banner-text">
                                <div class="gabion-banner-title">BBA APPROVED GABION BASKETS</div>
                                <div><strong>BBA Certificate Number: 05/4215 </strong>held by Link Middle East Ltd</div>
                            </div>
                            <div class="gabion-banner-img">
                                <img decoding="async" class="alignnone wp-image-52045" src="https://www.wirefence.co.uk/wp-content/uploads/2023/02/tested-approved-const.png" alt="" height="139">
                                <img decoding="async" class="alignnone wp-image-8612" src="https://www.wirefence.co.uk/wp-content/uploads/2019/12/manufactured-in-the-uk.png" alt="made-in-uk" height="119">
                            </div>
                        </div>
                    `);
                }));
                
                // Wait for jQuery and load content
                t.waitForJquery((function() {
                    // Load cut to size content
                    e.get("https://www.wirefence.co.uk/gabion/build-your-own-custom-gabion/", (function(n) {
                        var o = e(n).find(".woocommerce-products-header"),
                            a = e(n).find(".gabion-cut-to-size"),
                            i = "<script>" + e(n).find("#itc_calculate_custom_gabionwp_ajax_calculate_gabion-js-extra").html() + "</script>";
                        
                        e(".new-ajax-content-cuttosize").html('<header class="woocommerce-products-header new-products-header">' + o.html() + '</header><section class="calculate-rope-section gabion-cut-to-size">' + i + a.html() + "</section>");
                        
                        t.gabionCalculator();
                        
                        // Initialize sliders
                        e(".new-ajax-content-cuttosize").find(".category-slider-main").slick({
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            arrows: true,
                            fade: true,
                            asNavFor: ".new-ajax-content-cuttosize .category-slider-bottom",
                            adaptiveHeight: true
                        });
                        
                        e(".new-ajax-content-cuttosize").find(".category-slider-bottom").slick({
                            slidesToShow: 3,
                            slidesToScroll: 1,
                            asNavFor: ".new-ajax-content-cuttosize .category-slider-main",
                            arrows: false,
                            focusOnSelect: true
                        });
                    }));
                    
                    // Load product items
                    e(".tabchangeloader").fadeIn(100);
                    e.get("https://www.wirefence.co.uk/gabion/all-gabions-in-stock/", (function(t) {
                        var n = e(t).find(".content-area>.product-items");
                        e(".info-holder").append(n);
                        console.log(n);
                        e(".tabchangeloader").fadeOut(100);
                    })).fail((function() {
                        e(".tabchangeloader").fadeOut(100);
                        console.error("Failed to load product items");
                    }));
                    
                    // Tab switching functions
                    var n = function() {
                        e("#main-content .content-area .product-items").show();
                        e("#main-content .content-area .woocommerce-products-header").each((function() {
                            if (!e(this).hasClass("new-products-header")) {
                                e(this).show();
                            }
                        }));
                        e(".woocommerce-products-header .category-slider-main").slick("setPosition");
                        e(".woocommerce-products-header .category-slider-bottom").slick("setPosition");
                    };
                    
                    var o = function() {
                        e(".page-description-bottom").children().each((function(t, n) {
                            if (e(n).hasClass("gallery-photo-list") || e(n).hasClass("biggraytitle")) {
                                e(n).show();
                            } else {
                                e(n).hide();
                            }
                        }));
                        e(".page-description-bottom").show();
                    };
                    
                    var a = function() {
                        e(".page-description-bottom").children().each((function(t, n) {
                            if (e(n).hasClass("gallery-photo-list") || e(n).hasClass("gabion-banner") || "Customer Images" === e(n).text().trim()) {
                                e(n).hide();
                            } else {
                                e(n).show();
                            }
                        }));
                        e(".page-description-bottom").show();
                        e(".download-block").show();
                    };
                    
                    var i = function() {
                        e(".new-ajax-content-cuttosize").show();
                        e(".new-ajax-content-cuttosize .category-slider-main").slick("setPosition");
                        e(".new-ajax-content-cuttosize .category-slider-bottom").slick("setPosition");
                    };
                    
                    var s = function() {
                        e(".new-ajax-content").hide();
                        e(".page-description-bottom").hide();
                        e(".download-block").hide();
                        e("#main-content .content-area .product-items").hide();
                        e("#main-content .content-area .woocommerce-products-header").each((function() {
                            if (!e(this).hasClass("new-products-header")) {
                                e(this).hide();
                            }
                        }));
                        e(".show-related-products").show();
                        e(".show-related-products .product-items").show();
                    };
                    
                    var c = function(t) {
                        e(".new-tabs-head li").each((function() {
                            e(this).removeClass("active");
                        }));
                        e('.new-tabs-head li[showtab="' + t + '"]').addClass("active");
                        e(".signpost").each((function() {
                            e(this).removeClass("hidden");
                        }));
                        e('.signpost[showtab="' + t + '"]').addClass("hidden");
                    };
                    
                    // Event handlers
                    e(document).on("click", ".signpost", (function() {
                        e(".tabchangeloader").fadeIn(100);
                        e("html,body").animate({
                            scrollTop: 0
                        }, 600);
                        
                        var t = e(this).attr("showtab");
                        
                        setTimeout((function() {
                            c(t);
                            s();
                            
                            switch (t) {
                                case "default":
                                    n();
                                    break;
                                case "customerimages":
                                    o();
                                    break;
                                case "learninghub":
                                    a();
                                    break;
                                case "new-ajax-content-cuttosize":
                                    i();
                                    break;
                            }
                            
                            e(".tabchangeloader").fadeOut(100);
                        }), 1000);
                    }));
                    
                    e(document).on("click", ".new-tabs-head li", (function() {
                        var t = e(this).attr("showtab");
                        
                        c(t);
                        s();
                        
                        switch (t) {
                            case "default":
                                n();
                                break;
                            case "customerimages":
                                o();
                                break;
                            case "learninghub":
                                a();
                                break;
                            case "new-ajax-content-cuttosize":
                                i();
                                break;
                        }
                    }));
                }));
            }
        };
    
    // Initialize the application
    t.init();
    
    // Remove product categories
    e(".product-items > .products > .product-category").remove();
}();
