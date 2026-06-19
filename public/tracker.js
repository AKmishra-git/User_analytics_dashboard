(function () {

    // ─── Config ───────────────────────────────────────────────────────────────
    const API_URL = (typeof TRACKER_API_URL !== 'undefined')
        ? TRACKER_API_URL
        : 'http://localhost:5000/api/analytics/events';

    // ─── Session ID ───────────────────────────────────────────────────────────
    function getSessionId() {
        let sessionId = localStorage.getItem('cf_session_id');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem('cf_session_id', sessionId);
        }
        return sessionId;
    }

    // ─── Event Sender ─────────────────────────────────────────────────────────
    async function sendEvent(payload) {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            console.error('Tracker error:', err);
        }
    }

    // ─── Page View ────────────────────────────────────────────────────────────
    function trackPageView() {
        sendEvent({
            sessionId: getSessionId(),
            eventType: 'page_view',
            page_url:  window.location.pathname,
            timestamp: new Date().toISOString(),
        });
    }

    // ─── Click ────────────────────────────────────────────────────────────────
   // ─── Click ────────────────────────────────────────────────────────────────
function trackClick(e) {
    const target = e.target;

    sendEvent({
        sessionId: getSessionId(),
        eventType: 'click',
        page_url:  window.location.pathname,
        timestamp: new Date().toISOString(),
        x: e.clientX,
        y: e.clientY,
        element: {
            tag:     target.tagName.toLowerCase(),       // button, a, div
            text:    target.innerText?.trim().slice(0, 100) || null,  // "Buy Now"
            id:      target.id || null,                  // "submit-btn"
            classes: target.className || null,           // "btn-primary"
        }
    });
}

    // ─── Init ─────────────────────────────────────────────────────────────────
    trackPageView();
    document.addEventListener('click', trackClick);

})();