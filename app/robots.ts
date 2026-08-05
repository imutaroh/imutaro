import { MetadataRoute } from 'next';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 検索結果ページはクエリごとに無限にURLが生えるためクロール対象から外す
      disallow: '/search',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
