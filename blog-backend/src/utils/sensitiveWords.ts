import fs from 'fs'
import path from 'path'

let words: Set<string> | null = null

/**
 * 加载敏感词库
 */
export function loadSensitiveWords() {
  if (words) return words
  const filePath = path.join(__dirname, '../../data/sensitive_words.txt')
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    // 支持顿号、逗号（中英文）、换行、制表符等多种分隔符
    const items = content
      .split(/[、，,\n\r\t、]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 0)
    words = new Set(items)
    console.log(`[SensitiveWords] 已加载 ${words.size} 个敏感词`)
    return words
  } catch (err) {
    console.error('[SensitiveWords] 加载敏感词库失败:', err)
    words = new Set()
    return words
  }
}

/**
 * 检测文本中是否包含敏感词
 * @param text 待检测文本
 * @returns 包含的敏感词列表（去重），如果没有则返回空数组
 */
export function checkSensitiveWords(text: string): string[] {
  const dict = loadSensitiveWords()
  const lower = text.toLowerCase()
  const found: string[] = []

  for (const word of dict) {
    if (lower.includes(word)) {
      found.push(word)
    }
  }

  return [...new Set(found)]
}

/**
 * 检测文本是否包含敏感词（简单布尔判断）
 */
export function hasSensitiveWord(text: string): boolean {
  const dict = loadSensitiveWords()
  const lower = text.toLowerCase()
  for (const word of dict) {
    if (lower.includes(word)) {
      return true
    }
  }
  return false
}
