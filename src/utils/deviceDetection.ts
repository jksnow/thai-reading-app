/**
 * Utility functions for device and browser detection
 */

/**
 * Checks if the current device is a mobile device
 * Uses a combination of screen size and user agent detection
 */
export const isMobileDevice = (): boolean => {
  // Check via user agent (most reliable method)
  const userAgent = navigator.userAgent.toLowerCase();

  // Comprehensive check for mobile devices
  const isMobileUA =
    /android|webos|iphone|ipod|ipad|blackberry|iemobile|opera mini|mobile|tablet|samsung|silk|kindle|phone|mobi|nokia|windows phone|meego|fennec|symbian|tizen/i.test(
      userAgent
    );

  // Alternative check via screen size
  const isMobileWidth = window.innerWidth <= 1024;

  // Use navigator.maxTouchPoints as an additional signal
  const hasTouchScreen = navigator.maxTouchPoints > 0;

  // Log the detection values for debugging
  console.log("Device detection:", {
    userAgent,
    isMobileUA,
    hasTouchScreen,
    isMobileWidth,
    maxTouchPoints: navigator.maxTouchPoints,
  });

  return isMobileUA || (isMobileWidth && hasTouchScreen);
};

/**
 * Checks if the current browser is Safari on iOS
 */
export const isIOSSafari = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isSafari =
    /safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent);
  return isIOS && isSafari;
};

/**
 * Checks if the current browser is Chrome on iOS (which is just Safari underneath)
 */
export const isIOSChrome = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/i.test(userAgent) && /crios/i.test(userAgent);
};

/**
 * Checks if the current browser is Samsung Internet
 * Samsung Internet is known to have issues with popups
 */
export const isSamsungBrowser = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /samsungbrowser/i.test(userAgent);
};

/**
 * Checks if the current browser is in a WebView (embedded browser)
 * WebViews often have issues with redirects
 */
export const isWebView = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  return /wv|webview/i.test(userAgent);
};

/**
 * Checks if the current browser supports popups
 * Note: This is a best-effort check, as some browsers may still block popups
 */
export const supportsPopups = (): boolean => {
  // Problematic browsers
  if (isIOSSafari() || isIOSChrome() || isSamsungBrowser() || isWebView()) {
    console.log("Detected browser with known popup issues");
    return false;
  }

  // Mobile browsers generally don't handle popups well
  if (isMobileDevice()) {
    console.log("Mobile device detected, assuming popup not supported");
    return false;
  }

  // Check if window.open is available and not blocked
  try {
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      console.log("Popup test failed - popup was blocked");
      return false;
    }
    popup.close();
    console.log("Popup test succeeded");
    return true;
  } catch (e) {
    console.log("Popup test failed with error:", e);
    return false;
  }
};
