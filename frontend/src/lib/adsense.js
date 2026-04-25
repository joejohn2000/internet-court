const ADSENSE_SCRIPT_ID = 'internet-court-adsense-script';
const ADSENSE_CLIENT = 'ca-pub-2820250001442222';
const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

export const loadAdSenseScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(false);
      return;
    }

    const existingScript = document.getElementById(ADSENSE_SCRIPT_ID);
    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = ADSENSE_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load AdSense script.'));
    document.head.appendChild(script);
  });

export const cleanupAdSenseArtifacts = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const selectors = [
    `script#${ADSENSE_SCRIPT_ID}`,
    'ins.adsbygoogle',
    'iframe[src*="googlesyndication.com"]',
    'iframe[src*="doubleclick.net"]',
    '[id^="aswift_"]',
    '[id^="google_ads_iframe"]',
  ];

  document.querySelectorAll(selectors.join(',')).forEach((node) => {
    node.remove();
  });
};
