import { useEffect } from 'react';

export const useAnalytics = () => {
  const trackPageView = () => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  };

  const trackEvent = (eventName, params = {}) => {
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }
  };

  return { trackPageView, trackEvent };
};