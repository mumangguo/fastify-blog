import {Card, CardBody, Chip} from '@heroui/react'
import {Icon} from '@iconify/react'
import {useInView} from '@/hooks/useInView'

const STACK = [
    {name: 'TypeScript', icon: 'skill-icons:typescript'},
    {name: 'React', icon: 'skill-icons:react-light'},
    {name: 'Node.js', icon: 'skill-icons:nodejs-light'},
    {name: 'Fastify', icon: 'simple-icons:fastify'},
    {name: 'PostgreSQL', icon: 'skill-icons:postgresql-light'},
    {name: 'Prisma', icon: 'simple-icons:prisma'},
    {name: 'TailwindCSS', icon: 'skill-icons:tailwindcss-light'},
    {name: 'Vite', icon: 'skill-icons:vite-light'},
]

const MILESTONES = [
    {date: '2024', title: '开始探索前端工程化', desc: '从 React 起步，接触 TypeScript，逐步构建对现代 Web 的完整认知'},
    {date: '2025', title: '扎根 Node.js 后端', desc: '深入 Fastify、Prisma、Serverless，追求真正可用的工程实践'},
    {date: '2026', title: '搭建这个博客', desc: '把这几年积累的经验沉淀成文字，希望能帮到走在同样路上的人'},
]

function Section({
                     children,
                     className = '',
                     delay = 0,
                 }: {
    children: React.ReactNode
    className?: string
    delay?: number
}) {
    const [ref, visible] = useInView<HTMLDivElement>()
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            } ${className}`}
            style={{transitionDelay: visible ? `${delay}ms` : '0ms'}}
        >
            {children}
        </div>
    )
}

function SectionTitle({eyebrow, title, desc}: { eyebrow: string; title: string; desc?: string }) {
    return (
        <div className="text-center mb-10">
            <div className="text-xs uppercase tracking-widest text-[#87CEEB] font-semibold mb-2">{eyebrow}</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            {desc && <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">{desc}</p>}
        </div>
    )
}

export function AboutPageSections({
                                      featured,
                                      aboutHtml,
                                      onArticleClick,
                                  }: {
    featured: any[]
    aboutHtml: string
    onArticleClick: (id: number) => void
}) {
    return (
        <>
            {/* 技术栈 */}
            <Section>
                <SectionTitle eyebrow="Tech Stack" title="常用技术栈"
                              desc="这些工具支撑着我的日常开发与这个博客的搭建"/>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {STACK.map((t) => (
                        <Card
                            key={t.name}
                            className="rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                        >
                            <CardBody className="p-4 flex flex-row items-center gap-3">
                                <div
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 group-hover:bg-[#E0F4FC] transition-colors">
                                    <Icon icon={t.icon} className="w-6 h-6"/>
                                </div>
                                <span className="font-medium text-gray-800">{t.name}</span>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* 时间线 */}
            <Section>
                <SectionTitle eyebrow="Journey" title="一些里程碑" desc="走过的路，都算数"/>
                <div className="relative max-w-2xl mx-auto">
                    {/* 中轴线 */}
                    <div
                        className="absolute left-4 md:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-[#87CEEB] via-[#87CEEB]/40 to-transparent md:-translate-x-px"/>
                    <div className="space-y-10">
                        {MILESTONES.map((m, i) => {
                            const isLeft = i % 2 === 0
                            return (
                                <TimelineItem key={i} milestone={m} isLeft={isLeft} index={i}/>
                            )
                        })}
                    </div>
                </div>
            </Section>

            {/* 精选文章 */}
            {featured.length > 0 && (
                <Section>
                    <SectionTitle eyebrow="Featured" title="也许你会喜欢" desc="从最近的文章里挑几篇"/>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {featured.map((a) => (
                            <Card
                                key={a.id}
                                isPressable
                                onPress={() => onArticleClick(a.id)}
                                className="rounded-2xl shadow-sm hover:shadow-lg transition-all group text-left"
                            >
                                {a.coverUrl ? (
                                    <div className="h-36 overflow-hidden rounded-t-2xl">
                                        <img
                                            src={a.coverUrl}
                                            alt={a.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="h-36 bg-gradient-to-br from-[#E0F4FC] to-[#87CEEB]/40 rounded-t-2xl flex items-center justify-center">
                                        <Icon icon="solar:document-text-bold" className="w-12 h-12 text-white/80"/>
                                    </div>
                                )}
                                <CardBody className="p-4">
                                    {a.category && (
                                        <Chip size="sm" color="primary" variant="flat" className="mb-2">
                                            {a.category.name}
                                        </Chip>
                                    )}
                                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-[#5DB8E0] transition-colors">
                                        {a.title}
                                    </h3>
                                    {a.summary && <p className="text-sm text-gray-500 line-clamp-2">{a.summary}</p>}
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </Section>
            )}

            {/* 关于我 HTML */}
            {aboutHtml && (
                <Section>
                    <div id="about-story"/>
                    <SectionTitle eyebrow="More About Me" title="更多故事"/>
                    <Card className="rounded-2xl shadow-sm">
                        <CardBody className="p-6 md:p-10">
                            <div
                                className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-[#5DB8E0] prose-a:no-underline hover:prose-a:underline"
                                dangerouslySetInnerHTML={{__html: aboutHtml}}
                            />
                        </CardBody>
                    </Card>
                </Section>
            )}

            {/* 尾部 CTA */}
            <Section>
                <Card
                    className="rounded-3xl bg-gradient-to-br from-[#87CEEB] to-[#5DB8E0] text-white border-0 shadow-xl overflow-hidden">
                    <CardBody className="p-8 md:p-12 text-center relative">
                        <div className="absolute bg-white/10 rounded-full blur-2xl"/>
                        <div className="absolute bg-white/10 rounded-full blur-2xl"/>
                        <div className="relative">
                            <Icon icon="solar:chat-round-dots-bold" className="w-12 h-12 mx-auto mb-3 text-white/90"/>
                            <h3 className="text-2xl md:text-3xl font-bold mb-2">想聊聊技术？</h3>
                            <p className="text-white/90 mb-4">点击右下角的博客分身，随时可以问我关于博客内容的问题</p>
                        </div>
                    </CardBody>
                </Card>
            </Section>
        </>
    )
}

function TimelineItem({
                          milestone,
                          isLeft,
                          index,
                      }: {
    milestone: (typeof MILESTONES)[number]
    isLeft: boolean
    index: number
}) {
    const [ref, visible] = useInView<HTMLDivElement>()
    return (
        <div
            ref={ref}
            className={`relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8 items-center transition-all duration-700 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{transitionDelay: `${index * 100}ms`}}
        >
            {/* 节点圆点 */}
            <div
                className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 w-4 h-4 rounded-full bg-white ring-4 ring-[#87CEEB] shadow-md z-10"/>
            {/* 卡片 */}
            <div className={`${isLeft ? 'md:col-start-1 md:pr-8 md:text-right' : 'md:col-start-2 md:pl-8'}`}>
                <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <CardBody className="p-5">
                        <div className="text-[#87CEEB] font-bold text-sm mb-1">{milestone.date}</div>
                        <div className="font-semibold text-gray-900 mb-1">{milestone.title}</div>
                        <div className="text-sm text-gray-500 leading-relaxed">{milestone.desc}</div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}
