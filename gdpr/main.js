// Removed jQuery dependency and loading
document.addEventListener("DOMContentLoaded", initCookieConsent);

function initCookieConsent() {
    function cookieAutoBg() {
        let elementCheckCount = 0;
        const maxChecks = 20; // 2 seconds worth of checks

        const checkElement = setInterval(() => {
            elementCheckCount++;
            const consentContainer = document.querySelector('.cky-consent-container');
            const overlay = document.querySelector('.cky-overlay');
            
            if (overlay) {
                clearInterval(checkElement); // Stop checking once element is found

                if (consentContainer && !consentContainer.classList.contains('cky-hide')) {
                    overlay.classList.remove('cky-hide');
                    overlay.style.zIndex = '9999999';
                    // Stop HTML scroll
                    document.documentElement.style.overflow = 'hidden';

                    // Add click handlers for accept/decline buttons
                    const btns = document.querySelectorAll('.cky-btn-accept, .cky-btn-reject');
                    btns.forEach(btn => {
                        btn.addEventListener('click', function handler() {
                            document.documentElement.style.overflow = '';
                            if (typeof window._vwo_code !== 'undefined') {
                                window._vwo_code.finish();
                            }
                            // Remove handler after first click
                            btn.removeEventListener('click', handler);
                        });
                    });
                }
            }

            if (elementCheckCount >= maxChecks) {
                clearInterval(checkElement);
            }
        }, 100); // Check every 100ms
    }

    // Initial call
    cookieAutoBg();

    // Event delegation for .cky-notice-des span clicks
    document.addEventListener('click', function(event) {
        if (event.target.matches('.cky-notice-des span') || event.target.closest('.cky-notice-des span')) {
            const consentContainer = document.querySelector('.cky-consent-container');
            const modal = document.querySelector('.cky-modal');
            if (consentContainer) consentContainer.classList.add('cky-hide');
            if (modal) modal.classList.add('cky-modal-open');
            if (typeof window._vwo_code !== 'undefined') {
                window._vwo_code.finish();
            }
        }
    });

    // Event delegation for .cky-btn-close clicks
    document.addEventListener('click', function(event) {
        if (event.target.matches('.cky-btn-close') || event.target.closest('.cky-btn-close')) {
            const overlay = document.querySelector('.cky-overlay');
            if (overlay) overlay.classList.remove('cky-hide');
        }
    });

    // Re-run on VWO mutation
    if (window._vwo_code) {
        window._vwo_code.mutations = window._vwo_code.mutations || [];
        window._vwo_code.mutations.push(cookieAutoBg);
    }
}
