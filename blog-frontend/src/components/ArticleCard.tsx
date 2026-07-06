import { Card, CardBody, Chip } from '@heroui/react'
import { Eye, Calendar, Tag } from 'lucide-react'

interface ArticleCardProps {
  article: any
  onClick?: () => void
  compact?: boolean
}

export default function ArticleCard({ article, onClick, compact }: ArticleCardProps) {
  const tags = article.tags?.map((t: any) => t.tag || t) || []

  return (
    <Card
      className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl"
      isPressable
      onPress={onClick}
    >
      <CardBody className="p-5">
        <div className="flex gap-4">
          {article.coverUrl && (
            <img
              src={article.coverUrl}
              alt={article.title}
              className={`object-cover rounded-xl shrink-0 ${compact ? 'w-24 h-24 md:w-28 md:h-28' : 'w-24 h-24 md:w-32 md:h-32'}`}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold mb-2 ${compact ? 'text-base' : 'text-lg'}`}>{article.title}</h3>
            <p className="text-gray-500 text-sm line-clamp-2 mb-3">
              {article.summary || article.content?.slice(0, 100)}
            </p>
            <div className="flex items-center flex-wrap gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(article.createdTime).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.viewCount}
              </span>
              {article.category && (
                <Chip size="sm" color="primary" variant="flat">{article.category.name}</Chip>
              )}
              {tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="flex items-center gap-0.5 text-gray-400 hover:text-[#87CEEB] transition-colors"
                >
                  <Tag className="w-3 h-3" />
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
