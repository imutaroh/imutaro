import { MetadataRoute } from 'next';
import { getList, getTagList } from '@/libs/microcms';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, tags] = await Promise.all([
    getList({ fields: ['id', 'updatedAt'], limit: 100 }),
    getTagList({ fields: ['id'], limit: 100 }),
  ]);

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    ...articles.contents.map((article) => ({
      url: `${baseUrl}/articles/${article.id}`,
      lastModified: article.updatedAt,
    })),
    ...tags.contents.map((tag) => ({
      url: `${baseUrl}/tags/${tag.id}`,
      lastModified: new Date(),
    })),
  ];
}
