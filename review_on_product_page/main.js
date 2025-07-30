// Product title insertion - Horizontal layout with FontAwesome stars
(function insertReviewBanner() {
  // Helper: Wait for element
  function waitForElement(selector, callback, interval = 50, timeout = 5000) {
    const startTime = Date.now();
    (function check() {
      const el = document.querySelector(selector);
      if (el) return callback(el);
      if (Date.now() - startTime > timeout) return;
      setTimeout(check, interval);
    })();
  }

  // Check if the current page is a single product page
  if (!document.body.classList.contains('single-product')) return;

  // Prevent duplicate banners
  if (document.querySelector('.vwo-review-banner')) return;

  waitForElement('.single-product-title', function(productTitle) {
    if (document.querySelector('.vwo-review-banner')) return;
    const reviewElement = document.createElement('div');
    reviewElement.className = 'vwo-review-banner';
    reviewElement.innerHTML = `
      <div class="review-banner" style="
        display: flex;
        align-items: center;
        margin: 0 0 0;
      ">
        <a href="https://www.wirefence.co.uk/customer-reviews/" target="_blank" rel="noopener noreferrer" style="
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        ">
          <div style="
            color: #ffd000;
            font-size: 16px;
            margin-right: 10px;
          ">
            <i class="fa fa-star" aria-hidden="true"></i>
            <i class="fa fa-star" aria-hidden="true"></i>
            <i class="fa fa-star" aria-hidden="true"></i>
            <i class="fa fa-star" aria-hidden="true"></i>
            <i class="fa fa-star" aria-hidden="true"></i>
          </div>
          <div style="
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          ">
            <span style="
              color: #035aba;
              text-decoration: underline;
              font-weight: 600;
              font-size: 14px;
            ">1005 Reviews</span>
          </div>
        </a>
      </div>
    `;
    productTitle.parentNode.insertBefore(reviewElement, productTitle.nextSibling);
  });
})();
