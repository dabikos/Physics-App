import type { DemoMode, SimulationId, TheorySlide } from './types'

export const simulationCatalog: { id: SimulationId; title: string; description: string }[] = [
  {
    id: 'uniform-acceleration',
    title: 'Равноускоренное движение',
    description: 'Траектория, скорость и ускорение.',
  },
  {
    id: 'ohms-law',
    title: 'Закон Ома',
    description: 'Связь напряжения, тока и сопротивления.',
  },
  {
    id: 'energy-incline',
    title: 'Энергия на наклонной плоскости',
    description: 'Потенциальная и кинетическая энергия на склоне.',
  },
]

export const modeIcons: Record<DemoMode, string> = {
  idle: 'easel-outline',
  theory: 'book-outline',
  problems: 'calculator-outline',
  simulations: 'pulse-outline',
  formulas: 'flask-outline',
  test: 'checkmark-circle-outline',
  'ai-explain': 'sparkles-outline',
  worksheet: 'document-text-outline',
}

const KNOWN_HEADINGS = [
  'Введение',
  'Основные понятия',
  'Законы и формулы',
  'Примеры и задачи',
  'Роль и применение в жизни',
  'Заключение',
  'Введение в прямолинейное движение',
  'Понятие перемещения',
  'Скорость в прямолинейном движении',
  'Роль времени в анализе движения',
]

export const formatFormulaForKatex = (raw: string) => {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (trimmed.includes('$') || /\\[a-zA-Z]+/.test(trimmed)) {
    return trimmed
  }

  let result = trimmed

  result = result
    .replace(/Δ([A-Za-z0-9\u0400-\u04FF])/g, '\\Delta $1')
    .replace(/Δ/g, '\\Delta')
    .replace(/ν([A-Za-z0-9\u0400-\u04FF])/g, '\\nu $1')
    .replace(/ν/g, '\\nu')
    .replace(/λ([A-Za-z0-9\u0400-\u04FF])/g, '\\lambda $1')
    .replace(/λ/g, '\\lambda')
    .replace(/π([A-Za-z0-9\u0400-\u04FF])/g, '\\pi $1')
    .replace(/π/g, '\\pi')
    .replace(/α([A-Za-z0-9\u0400-\u04FF])/g, '\\alpha $1')
    .replace(/α/g, '\\alpha')
    .replace(/β([A-Za-z0-9\u0400-\u04FF])/g, '\\beta $1')
    .replace(/β/g, '\\beta')
    .replace(/γ([A-Za-z0-9\u0400-\u04FF])/g, '\\gamma $1')
    .replace(/γ/g, '\\gamma')
    .replace(/δ([A-Za-z0-9\u0400-\u04FF])/g, '\\delta $1')
    .replace(/δ/g, '\\delta')
    .replace(/θ([A-Za-z0-9\u0400-\u04FF])/g, '\\theta $1')
    .replace(/θ/g, '\\theta')
    .replace(/μ([A-Za-z0-9\u0400-\u04FF])/g, '\\mu $1')
    .replace(/μ/g, '\\mu')
    .replace(/ρ([A-Za-z0-9\u0400-\u04FF])/g, '\\rho $1')
    .replace(/ρ/g, '\\rho')
    .replace(/ω([A-Za-z0-9\u0400-\u04FF])/g, '\\omega $1')
    .replace(/ω/g, '\\omega')
    .replace(/Ω([A-Za-z0-9\u0400-\u04FF])/g, '\\Omega $1')
    .replace(/Ω/g, '\\Omega')
    .replace(/Σ([A-Za-z0-9\u0400-\u04FF])/g, '\\Sigma $1')
    .replace(/Σ/g, '\\Sigma')
    .replace(/∑/g, '\\sum')
    .replace(/∫/g, '\\int')
    .replace(/∞/g, '\\infty')
    .replace(/→/g, '\\rightarrow')

  result = result.replace(/√\(([^)]+)\)/g, (match, expr) => {
    const inner = expr.replace(/\//g, ' \\div ')
    return `\\sqrt{${inner}}`
  })

  result = result.replace(/_(?!\{)([A-Za-z0-9\u0400-\u04FF]+)/g, '_{$1}')

  result = result.replace(/([A-Za-z0-9\u0400-\u04FF]+)\s*\/\s*([A-Za-z0-9\u0400-\u04FF]+)/g, (match, num, den) => {
    if (match.includes('\\')) return match
    return `\\frac{${num}}{${den}}`
  })

  result = result
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/₀/g, '_0')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2')
    .replace(/₃/g, '_3')
    .replace(/·/g, ' \\cdot ')
    .replace(/×/g, ' \\times ')
    .replace(/÷/g, ' \\div ')

  return result
}

const isIgnoredHeading = (title: string) => {
  const normalized = title.toLowerCase()
  return (
    normalized === 'условие' ||
    normalized === 'решение' ||
    normalized === 'ответ' ||
    normalized === 'дано' ||
    normalized === 'найти'
  )
}

export const extractTheorySlides = (
  theory: string,
  fallbackTitle: string,
  fallbackContent = 'Содержание раздела...',
): TheorySlide[] => {
  const text = theory.trim()
  if (!text) return []

  const parts: TheorySlide[] = []
  const headings: { title: string; index: number }[] = []

  KNOWN_HEADINGS.forEach((heading) => {
    const safe = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const patterns = [
      new RegExp(`\\*\\*${safe}\\*\\*`, 'm'),
      new RegExp(`##\\s*${safe}`, 'm'),
      new RegExp(`^${safe}`, 'm'),
      new RegExp(`\\n${safe}`, 'm'),
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (!match) continue

      const index = match.index !== undefined ? match.index : text.indexOf(heading)
      if (index !== -1 && !headings.find((item) => item.title === heading)) {
        headings.push({ title: heading, index })
        break
      }
    }
  })

  if (headings.length === 0) {
    const markdownHeadings = text.match(/\*\*([^*]+)\*\*/g) || []
    markdownHeadings.forEach((match) => {
      const title = match.replace(/\*\*/g, '').trim()
      if (!title || title.length >= 120 || isIgnoredHeading(title)) return

      const index = text.indexOf(match)
      if (index !== -1 && !headings.find((item) => item.title === title)) {
        headings.push({ title, index })
      }
    })

    if (headings.length === 0) {
      const lines = text.split('\n')
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i].trim()
        const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : ''
        if (
          line &&
          /^[А-ЯЁ]/.test(line) &&
          !line.endsWith('.') &&
          line.length < 100 &&
          line.split(' ').length < 15 &&
          !isIgnoredHeading(line) &&
          (nextLine === '' || /^[А-ЯЁ]/.test(nextLine) || nextLine.length > 50)
        ) {
          const index = text.indexOf(line)
          if (index !== -1 && !headings.find((item) => item.title === line)) {
            headings.push({ title: line, index })
          }
        }
      }
    }
  }

  headings.sort((a, b) => a.index - b.index)

  const uniqueHeadings = headings.filter(
    (heading, index, self) => index === self.findIndex((item) => item.title === heading.title),
  )

  if (uniqueHeadings.length === 0) {
    return [{ title: fallbackTitle, content: text }]
  }

  uniqueHeadings.forEach((heading, index) => {
    const startIndex = heading.index
    const endIndex = index < uniqueHeadings.length - 1 ? uniqueHeadings[index + 1].index : text.length

    let content = text.substring(startIndex, endIndex)

    if (content.startsWith(`**${heading.title}**`)) {
      content = content.substring(heading.title.length + 4).trim()
    } else if (content.startsWith(`## ${heading.title}`)) {
      content = content.substring(heading.title.length + 3).trim()
    } else if (content.startsWith(heading.title)) {
      content = content.substring(heading.title.length).trim()
    }

    content = content
      .replace(/^\*\*/g, '')
      .replace(/\*\*$/g, '')
      .replace(/^##\s*/g, '')
      .replace(/^\n+/g, '')
      .trim()

    parts.push({
      title: heading.title,
      content: content || fallbackContent,
    })
  })

  return parts.length > 0 ? parts : [{ title: fallbackTitle, content: text }]
}
