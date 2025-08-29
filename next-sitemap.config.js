/** @type {import('next-sitemap').IConfig} */
const siteUrl = 'https://www.studysahara.com';

const coreLoan = [
  '/eligibility',
  '/no-co-applicant-and-no-collateral',
  '/co-applicant-and-no-collateral',
  '/co-applicant-and-collateral',
  '/us-co-applicant',
];

const lenderPages = [
  '/sbi','/icicibank','/unionbank','/pnb','/avanse','/idfc','/axisbank',
  '/yesbank','/auxilo','/incred','/tatacapital','/poonawallafincorp',
  '/prodigyfinance','/mpowerfinancing','/earnest','/salliemae','/ascent'
];

module.exports = {
  siteUrl,                    // canonical: www
  outDir: 'public',           // write files to /public
  generateRobotsTxt: true,    // also generate robots.txt
  sitemapBaseFileName: 'sitemap',
  changefreq: 'weekly',
  priority: 0.7,

  // Don’t include redirected/legacy paths or internal pages
  exclude: [
    '/askbot',
    '/success',
    '/404',
    '/500',
    '/_next/*',
    '/api/*',
    // legacy slugs you redirect in next.config.js
    '/icici-bank',
    '/axis-bank',
    '/avanse-financial-services',
    '/auxilo-finserv',
    '/union-bank',
    '/punjab-national-bank',
    '/idfc-first-bank',
    '/yes-bank',
    '/incred-finance',
    '/tata-capital',
    '/poonawalla-fincorp',
    '/prodigy-finance',
    '/mpower-financing',
    '/sallie-mae',
    '/no-coapplicant-no-collateral',
    '/coapplicant-no-collateral',
    '/coapplicant-collateral',
    '/us-coapplicant',
    '/check-loan-eligibility',
    '/our-company-studysahara',
  ],

  // Normalize odd paths & tune priority
  transform: async (config, path) => {
    // normalize /PNB -> /pnb
    const normalized = path.replace('/PNB', '/pnb');

    let priority = 0.7;
    if (normalized === '/') priority = 1.0;
    if (coreLoan.includes(normalized)) priority = 0.9;
    if (lenderPages.includes(normalized)) priority = 0.6;

    return {
      // IMPORTANT: return a PATH, not a full URL
      loc: normalized,
      changefreq: 'weekly',
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },

  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api', '/_next'] },
    ],
    additionalSitemaps: [`${siteUrl}/sitemap.xml`],
  },

  // no extra injected URLs for now
  additionalPaths: async () => [],
};