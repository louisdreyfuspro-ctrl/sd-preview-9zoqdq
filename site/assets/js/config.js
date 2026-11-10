/* StrydeUp website settings: edit this file only, no need to touch the pages.
   LINKS: '#' means "not provided yet" (the button stays on the page).
   PRICES: one table per currency, monthly price per plan. Leave a currency at null until its prices are approved:
   visitors from that region then see USD. "six" = monthly price on the 6-month plan (null = not announced yet). */
window.SU_CONFIG = {
  LINKS: {
    appStore: '#',
    googlePlay: '#',
    web: '#',          // web platform
    signIn: '#',
    trial: '#',        // "Start your free month" buttons
    subscribe: '#',    // Stories newsletter
    waitlist: '#'      // Live Analytics waitlist
  },
  PRICES: {
    USD: { symbol: '$', name: 'US dollars', premium: 49, pro: 149, stable: 218, six: null },
    EUR: null,  // e.g. { symbol: '€', name: 'euros', premium: 0, pro: 0, stable: 0, six: null }
    GBP: null,
    CHF: null
  },
  STABLE_NOTE: 'Minimum of 2 users'
};
