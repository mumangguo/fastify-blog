import { Helmet } from 'react-helmet-async'

interface SeoProps {
  title?: string
  description?: string
  keywords?: string
  author?: string
  image?: string
  url?: string
  type?: string
}

const defaults = {
  title: '木芒果 - 个人博客',
  description: '木芒果的个人博客，记录技术成长，分享编程心得与生活点滴。',
  keywords: '木芒果,个人博客,技术博客,前端开发,后端开发,编程,React,TypeScript,Node.js,Fastify,Prisma',
  author: '木芒果',
  image: '',
  url: typeof window !== 'undefined' ? window.location.href : '',
  type: 'website',
}

export default function SeoMeta({ title, description, keywords, author, image, url, type }: SeoProps) {
  const t = title ? `${title} - 木芒果` : defaults.title
  const desc = description || defaults.description
  const kw = keywords || defaults.keywords
  const img = image || defaults.image
  const link = url || defaults.url
  const siteType = type || defaults.type

  return (
    <Helmet>
      {/* 基础 SEO */}
      <title>{t}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={kw} />
      <meta name="author" content={author || defaults.author} />

      {/* Open Graph */}
      <meta property="og:title" content={t} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={siteType} />
      <meta property="og:url" content={link} />
      <meta property="og:site_name" content="木芒果 - 个人博客" />
      <meta property="og:locale" content="zh_CN" />
      {img && <meta property="og:image" content={img} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="mumuangguo" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={desc} />
      {img && <meta name="twitter:image" content={img} />}
      {img && <meta name="twitter:image:alt" content={t} />}
    </Helmet>
  )
}
