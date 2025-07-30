!function(){"use strict";
    const t=function(t){
        let e=parseFloat(t);
        return e%1==0?e.toFixed(2):e.toString().includes(".")?e.toString().padEnd(e.toString().indexOf(".")+3,"0"):e.toFixed(2)
    };
    
    const e={
        waitForSwiper:function(t){
            let o=setTimeout(function(){
                "function"!=typeof window.Swiper?e.waitForSwiper(t):(clearTimeout(o),t())
            },100)
        },
        addSwiper:function(){
            void 0!==window.jQuery&&"function"!=typeof window.Swiper&&(jQuery("<link/>",{rel:"stylesheet",type:"text/css",href:"https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"}).appendTo("head"),jQuery("<script/>",{type:"text/javascript",src:"https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"}).appendTo("head"))
        }
    };
    
    e.addSwiper();
    
    const o=function(o){
        jQuery.ajax({
            url:"/wp-json/custom/v1/cross-sells/"+o,
            type:"GET",
            success:function(o){
                if(console.log(o),o.length>0){
                    jQuery(".ATC-popup__product_cross_sells").html(""),jQuery(".ATC-popup").addClass("hasCrossSells");
                    var n="";
                    n+='<button class="ATC_carousel-btn ATC_carousel-prev">&#10094;</button>';
                    n+='<button class="ATC_carousel-btn ATC_carousel-next">&#10095;</button>';
                    n+='<h3 class="ATC-popup__product_cross_sells--h3">You might also be interested in:</h3>';
                    n+='<div class="ATC-popup__product_cross_sells--container swiper-wrapper">';
                    
                    jQuery(o).each(function(e,o){
                        n+='<div class="ATC-popup__product_cross_sell swiper-slide">';
                        n+='<div class="ATC-popup__product_cross_sell__inner">';
                        n+='<a href="'+o.url+'">';
                        n+='<img class="ATC-popup__product_cross_sell--image" src="'+o.image+'" />';
                        n+='<h3 class="ATC-popup__product_cross_sell--title">'+o.title+"</h3>";
                        n+='<div class="ATC-popup__product_cross_sell--prices">';
                        if(o.sale_price&&o.sale_price>0){
                            n+='<div class="ATC-popup__product_cross_sell--price-old">'+o.currency_symbol+t(o.sale_price)+" <span>"+o.vat+"</span></div>";
                        }
                        n+='<div class="ATC-popup__product_cross_sell--price">'+o.currency_symbol+t(o.regular_price)+" <span>"+o.vat+"</span></div>";
                        n+="</div>";
                        n+="</a>";
                        n+='<div class="ATC-popup__product_cross_sell--cart">';
                        n+='<input type="number" class="input-text qty text" step="1" min="1" max="999" name="quantity" value="1" title="Qty" size="4" pattern="[0-9]*" inputmode="numeric">';
                        n+='<a href="/?add-to-cart='+o.id+'" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart addToCartCrossSell" data-product_id="'+o.id+'" data-product_sku="" data-product-title="'+o.title+'" aria-label="Add &quot;'+o.title+'&quot; to your basket" rel="nofollow"><i class="fa fa-shopping-cart"></i>ADD TO CART</a>';
                        n+="</div>";
                        n+="</div>";
                        n+="</div>";
                    });
                    
                    n+="</div>";
                    jQuery(".ATC-popup__product_cross_sells").html(n);
                    
                    jQuery(".ATC-popup__product_cross_sell--cart input").on("keyup change",function(){
                        var t=jQuery(this).val();
                        console.log(t);
                        jQuery(this).closest(".ATC-popup__product_cross_sell--cart").find("a.add_to_cart_button").attr("data-quantity",t);
                    });
                    
                    e.waitForSwiper(function(){
                        new Swiper(".ATC-swiper",{
                            slidesPerView:4,
                            spaceBetween:5,
                            loop:!1,
                            navigation:{
                                nextEl:".ATC_carousel-btn.ATC_carousel-next",
                                prevEl:".ATC_carousel-btn.ATC_carousel-prev"
                            },
                            breakpoints:{
                                320:{slidesPerView:1.2,spaceBetween:5},
                                480:{slidesPerView:1.5,spaceBetween:5},
                                840:{slidesPerView:2.5,spaceBetween:5},
                                1400:{slidesPerView:4,spaceBetween:5}
                            }
                        });
                    });
                }
            }
        });
    };
    
    !function waitForElement(t,e){
        document.querySelector(t)?e():setTimeout(()=>waitForElement(t,e),100);
    }(".which-mesh-category tbody tr.table_string",function(){
        if(!(window.innerWidth<=1024))return;
        
        const t=function(){
            const t=document.querySelectorAll(".which-mesh-category thead th"),e=[],o=[],n={};
            
            t.forEach((t,r)=>{
                let s=t.textContent.trim(),a=s.toLowerCase().replace(/\s*\(.*?\)/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"").replace(/_+/g,"_");
                
                if(s.toLowerCase().includes("coating")){a="coating";}
                if((s.toLowerCase().includes("hole size")||s.toLowerCase().includes("aperture"))){a="holeSize";}
                if(s.toLowerCase().includes("depth")){a="depth";}
                if(s.toLowerCase().includes("height")){a="height";}
                if(s.toLowerCase().includes("length")){a="length";}
                if((s.toLowerCase().includes("wire diameter")||s.toLowerCase().includes("gauge"))){a="wireDiameter";}
                if(s.toLowerCase().includes("quantity")){a="quantity";}
                if(s.toLowerCase().includes("price")){a="price";}
                
                if(!["quantity","price","name","image","add to cart","product"].some(t=>s.toLowerCase().includes(t))&&!["quantity","price","name","image","add_to_cart","product"].some(t=>a.includes(t))){
                    e.push(a);
                    o.push(s);
                    n[a]=r;
                }
            });
            
            return {columns:e,headers:o,cellIndexMap:n};
        }();
        
        console.log("Detected product category:",t);
        console.log("Column config:",t);
        
        const e=document.createElement("style");
        
        function n(e){
            if(!e||0===e.length)return '<div class="no-products">No results, please try again by trying a new filter combination.</div>';
            
            return e.map(e=>{
                const o=e.video.hasVideo?'<div class="video-wrapper" data-video-id="'+e.video.id+'"> <i class="fa fa-play-circle" aria-hidden="true"></i> <span class="title">Show video</span> </div>':'<div class="video-wrapper" style="visibility: hidden;"></div>';
                
                const n=t.columns.map((o,n)=>'<div class="spec-row"><span>'+("wireDiameter"===o?"Wire Dia":t.headers[n])+':</span><span>'+(e.attributes[o]||"")+'</span></div>').join("");
                
                const r=t.columns.map(t=>'data-'+t.toLowerCase().replace(/([A-Z])/g,"-$1")+'="'+(e.attributes[t]||"")+'"').join(" ");
                
                return '<div class="product-card" data-product-id="'+e.id+'" '+r+'>' +
                    '<div class="card-top">' +
                        '<div class="product-image">' +
                            '<a href="'+e.url+'">' +
                                '<img src="'+e.image.url+'" alt="'+e.image.alt+'">' +
                            '</a>' +
                        '</div>' +
                        '<div class="product-details">' +
                            '<div class="product-name">' +
                                '<a href="'+e.url+'">'+e.name+'</a>' +
                            '</div>' +
                            '<div class="product-specs">' +
                                n +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="card-middle">' +
                        o +
                        '<div class="price-section">' +
                            '<div class="price">£'+e.price+'</div>' +
                            '<div class="price-label">inc. VAT</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="card-bottom">' +
                        '<div class="quantity-section">' +
                            '<div class="quantity-controls">' +
                                '<button class="qty-btn qty-minus" data-product-id="'+e.id+'">-</button>' +
                                '<input type="number" class="quantity-input" value="'+e.quantity+'" min="1" data-product-id="'+e.id+'" readonly>' +
                                '<button class="qty-btn qty-plus" data-product-id="'+e.id+'">+</button>' +
                            '</div>' +
                        '</div>' +
                        '<button class="add-to-cart-btn add_to_cart_button" data-product-id="'+e.id+'" data-product-name="'+e.name+'">' +
                            'Add to cart' +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join("");
        }
        
        function r(){
            const e=function(){
                const e=[],o=document.querySelectorAll(".which-mesh-category tbody tr.table_string");
                
                console.log("Found table rows:",o.length);
                
                o.forEach(o=>{
                    const n=o.querySelector(".product-image-td img"),
                          r=n?n.src:"https://www.wirefence.co.uk/wp-content/uploads/woocommerce-placeholder.png",
                          s=n?n.alt:"",
                          a=o.querySelector(".product-image-td a"),
                          i=a?a.href:"",
                          c=o.querySelector(".video-wrapper"),
                          l=c?c.getAttribute("data-video-id"):"",
                          d={};
                    
                    let u="1",p="",h="",y="";
                    
                    h=o.getAttribute("data-product-id")||"";
                    y=o.getAttribute("data-name")||"";
                    p=o.getAttribute("data-price")||"";
                    
                    const m=o.querySelectorAll("td");
                    
                    t.columns.forEach((e,o)=>{
                        const n=t.cellIndexMap[e];
                        if(m[n]){
                            const t=m[n],
                                  o=t.textContent.trim(),
                                  r=t.querySelector("a"),
                                  s=r?r.textContent.trim():o;
                            d[e]=s;
                        }
                    });
                    
                    const v=t.columns.length+1,
                          f=t.columns.length+2;
                    
                    if(m[v]){
                        const t=m[v].querySelector('input[type="number"]');
                        u=t?t.value:"1";
                    }
                    
                    if(m[f]){
                        const t=m[f].querySelector(".woocommerce-Price-amount");
                        if(t){
                            p=t.textContent.replace("£","").trim();
                        }
                    }
                    
                    const _=o.querySelector(".add_to_cart_button"),
                          g=_?_.href:"",
                          w={
                              id:h,
                              name:y,
                              url:i,
                              image:{url:r,alt:s},
                              video:{id:l,hasVideo:!!l},
                              attributes:d,
                              price:p,
                              quantity:u,
                              addToCartUrl:g
                          };
                    
                    e.push(w);
                });
                
                console.log("Extracted products:",e);
                return e;
            }();
            
            const o=function(e){
                const o={};
                
                t.columns.forEach(t=>{
                    o[t]={};
                });
                
                e.forEach(e=>{
                    const n=e.attributes;
                    t.columns.forEach(t=>{
                        if(n[t]){
                            o[t][n[t]]=(o[t][n[t]]||0)+1;
                        }
                    });
                });
                
                const n={};
                
                t.columns.forEach(t=>{
                    n[t]=Object.keys(o[t]).map(e=>({
                        value:e,
                        text:e,
                        count:o[t][e]
                    }));
                });
                
                n.totalCount=e.length;
                console.log("Extracted filters:",n);
                return n;
            }(e);
            
            const r='<div class="mobile-layout">' +
                '<!-- Table-Style Filter -->' +
                (function(e){
                    return '<div class="filter-table-wrapper">' +
                        '<div class="filter-table-header">' +
                            t.headers.map((t,e)=>'<div class="filter-col">'+t+' <span class="sort_category"><i class="fa fa-sort" aria-hidden="true"></i></span></div>').join("") +
                        '</div>' +
                        '<div class="filter-table-controls">' +
                            t.columns.map((t,o)=>{
                                const n=e[t];
                                return '<div class="filter-col">' +
                                    '<select class="filter-select" data-filter-type="'+t+'">' +
                                        (n&&0!==n.length?'<option value="">Filter</option>'+n.map(t=>'<option value="'+t.value+'">'+t.text+'</option>').join(""):'<option value="">Filter</option>') +
                                    '</select>' +
                                '</div>';
                            }).join("") +
                        '</div>' +
                    '</div>';
                })(o) +
                '<!-- Product Cards -->' +
                '<div class="product-cards">' +
                    n(e) +
                '</div>' +
            '</div>';
            
            return {html:r,products:e,filters:o};
        }
        
        function s(e,o){
            let r=[...o],s={column:null,direction:"asc"};
            
            function c(t,e,o){
                return t.sort((t,n)=>{
                    let r=t.attributes[e]||"",s=n.attributes[e]||"";
                    const a=parseFloat(r),i=parseFloat(s);
                    
                    if(isNaN(a)||isNaN(i)){
                        return "asc"===o?r.localeCompare(s):s.localeCompare(r);
                    } else {
                        return "asc"===o?a-i:i-a;
                    }
                });
            }
            
            function l(o,n){
                e.querySelectorAll(".sort_category i").forEach(t=>{
                    t.className="fa fa-sort";
                });
                
                if(o){
                    const r=t.columns.indexOf(o);
                    if(-1!==r){
                        const t=e.querySelectorAll(".sort_category i")[r];
                        if(t){
                            t.className="asc"===n?"fa fa-sort-up":"fa fa-sort-down";
                        }
                    }
                }
            }
            
            function d(){
                const n=function(){
                    const o={};
                    
                    t.columns.forEach(t=>{
                        o[t]=[];
                    });
                    
                    e.querySelectorAll(".filter-select").forEach(t=>{
                        const e=t.getAttribute("data-filter-type"),
                              n=t.value;
                        if(n&&o[e]){
                            o[e].push(n);
                        }
                    });
                    
                    return o;
                }();
                
                r=o.filter(e=>{
                    const o=e.attributes;
                    return t.columns.every(t=>{
                        const e=n[t];
                        return 0===e.length||e.includes(o[t]);
                    });
                });
                
                if(s.column){
                    r=c(r,s.column,s.direction);
                }
                
                u();
                p();
            }
            
            function u(){
                const t=r.length,
                      o=e.querySelector("#results-count");
                if(o){
                    o.textContent=t;
                }
            }
            
            function p(){
                const t=e.querySelector(".product-cards");
                if(t){
                    t.innerHTML=n(r);
                    a(e);
                    i(e);
                }
            }
            
            e.querySelectorAll(".filter-select").forEach(t=>{
                if(t.value){
                    t.classList.add("selected");
                }
                
                t.addEventListener("change",function(){
                    if(this.value){
                        this.classList.add("selected");
                    } else {
                        this.classList.remove("selected");
                    }
                    d();
                });
            });
            
            const h=e.querySelector(".clear-filters-btn");
            if(h){
                h.addEventListener("click",function(){
                    e.querySelectorAll(".filter-select").forEach(t=>{
                        t.value="";
                    });
                    s={column:null,direction:"asc"};
                    r=[...o];
                    l(null,"asc");
                    u();
                    p();
                });
            }
            
            e.querySelectorAll(".filter-table-header .sort_category").forEach((e,o)=>{
                e.addEventListener("click",function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const n=t.columns[o];
                    
                    if(s.column===n){
                        s.direction="asc"===s.direction?"desc":"asc";
                    } else {
                        s.column=n;
                        s.direction="asc";
                    }
                    
                    r=c(r,s.column,s.direction);
                    l(s.column,s.direction);
                    p();
                });
            });
            
            u();
        }
        
        function a(t){
            t.querySelectorAll(".qty-btn").forEach(e=>{
                e.addEventListener("click",function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const o=this.getAttribute("data-product-id"),
                          n=t.querySelector('input.quantity-input[data-product-id="'+o+'"]'),
                          r=this.classList.contains("qty-plus"),
                          s=this.classList.contains("qty-minus");
                    
                    if(n){
                        let t=parseInt(n.value)||1;
                        if(r){
                            t++;
                        } else if(s&&t>1){
                            t--;
                        }
                        n.value=t;
                        n.dispatchEvent(new Event("change",{bubbles:!0}));
                    }
                });
            });
            
            t.querySelectorAll(".quantity-input").forEach(t=>{
                t.addEventListener("click",function(t){
                    t.stopPropagation();
                });
                
                t.addEventListener("focus",function(t){
                    t.stopPropagation();
                });
                
                t.addEventListener("change",function(t){
                    t.stopPropagation();
                    if(parseInt(this.value)<1){
                        this.value=1;
                    }
                });
            });
        }
        
        function i(t){
            t.querySelectorAll(".add-to-cart-btn").forEach(e=>{
                e.addEventListener("click",function(){
                    const e=this.getAttribute("data-product-id"),
                          n=this.getAttribute("data-product-name"),
                          r=t.querySelector('input.quantity-input[data-product-id="'+e+'"]'),
                          s=r?r.value:1;
                    
                    if(void 0!==window.jQuery&&jQuery(".ATC").length>0){
                        jQuery(".ATC-background").removeClass("ATC-background--dark");
                        jQuery(".ATC-loading").show();
                        jQuery(".ATC-popup").removeClass("slideUp");
                        jQuery(".ATC").show();
                    }
                    
                    this.disabled=!0;
                    this.textContent="Adding...";
                    
                    const a=new FormData;
                    a.append("action","woocommerce_add_to_cart");
                    a.append("product_id",e);
                    a.append("quantity",s);
                    
                    const i="undefined"!=typeof wc_add_to_cart_params?wc_add_to_cart_params.ajax_url:"/wp-admin/admin-ajax.php";
                    
                    fetch(i,{method:"POST",body:a})
                        .then(t=>t.json())
                        .then(t=>{
                            if(t.error){
                                if(void 0!==window.jQuery&&jQuery(".ATC").length>0){
                                    jQuery(".ATC-loading").hide();
                                    jQuery(".ATC").hide();
                                }
                                alert("Error adding to cart: "+t.error);
                                this.textContent="Add to cart";
                                this.disabled=!1;
                            } else {
                                if(void 0!==window.jQuery&&jQuery(".ATC").length>0){
                                    jQuery(".ATC-loading").hide();
                                    jQuery(".ATC-background").addClass("ATC-background--dark");
                                    jQuery(".ATC-popup").addClass("slideUp");
                                    if(n){
                                        jQuery(".ATC-popup__product h2").html(n+" has been added to cart!");
                                    }
                                    console.log("[DEBUG] About to check for getCrossSells. Product ID:",e);
                                    console.log("[DEBUG] typeof getCrossSells:",typeof o);
                                    console.log("[DEBUG] typeof window.getCrossSells:",typeof window.getCrossSells);
                                    console.log("[DEBUG] Calling getCrossSells(productId)");
                                    o(e);
                                }
                                
                                this.textContent="Added!";
                                setTimeout(()=>{
                                    this.textContent="Add to cart";
                                    this.disabled=!1;
                                },2e3);
                                
                                if("undefined"!=typeof jQuery){
                                    jQuery("body").trigger("added_to_cart",[t.fragments,t.cart_hash,jQuery(this)]);
                                }
                            }
                        })
                        .catch(t=>{
                            console.error("Add to cart error:",t);
                            if(void 0!==window.jQuery&&jQuery(".ATC").length>0){
                                jQuery(".ATC-loading").hide();
                                jQuery(".ATC").hide();
                            }
                            this.textContent="Error";
                            setTimeout(()=>{
                                this.textContent="Add to cart";
                                this.disabled=!1;
                            },2e3);
                        });
                });
            });
        }
        
        e.textContent=".mobile-layout { display: block !important; } .which-mesh-category { display: none !important; } .mobile-scroll { display: none !important; } .table-wrapper1 { display: none !important; } ";
        document.head.appendChild(e);
        
        try{
            const t=function(){
                const t=r();
                if(0===t.products.length){
                    console.error("No products found in table");
                    return;
                }
                
                const e=document.createElement("div");
                e.innerHTML=t.html;
                
                const o=document.querySelector(".which-mesh-category");
                if(o){
                    o.parentNode.insertBefore(e,o.nextSibling);
                    o.style.display="none";
                    e.querySelector(".mobile-layout").style.display="block";
                    
                    const n=document.createElement("style");
                    n.textContent="@media (min-width: 1025px) { .mobile-layout { display: none !important; } .which-mesh-category { display: table !important; } } ";
                    document.head.appendChild(n);
                    
                    s(e,t.products);
                    a(e);
                    i(e);
                }
                
                return t;
            }();
            
            console.log("VWO Mobile Layout Test: Success",t);
        } catch(t){
            console.error("VWO Mobile Layout Test Error:",t);
        }
    });
}();