import { describe, expect, it } from 'vitest'
import { extractTheorySlides, formatFormulaForKatex } from '../utils'

describe('formatFormulaForKatex', () => {
  it('converts unicode symbols and fractions to LaTeX', () => {
    const result = formatFormulaForKatex('Δv = 12 м/с')

    expect(result).toContain('\\Delta v')
    expect(result).toContain('\\frac{м}{с}')
  })

  it('keeps existing latex-like strings untouched', () => {
    const raw = '$$F = ma$$'

    expect(formatFormulaForKatex(raw)).toBe(raw)
  })
})

describe('extractTheorySlides', () => {
  it('splits theory text by known headings', () => {
    const theory = [
      '**Введение**',
      'Это вступление.',
      '**Законы и формулы**',
      'F = ma',
    ].join('\n')

    const slides = extractTheorySlides(theory, 'Fallback')

    expect(slides).toHaveLength(2)
    expect(slides[0]).toEqual({
      title: 'Введение',
      content: 'Это вступление.',
    })
    expect(slides[1]).toEqual({
      title: 'Законы и формулы',
      content: 'F = ma',
    })
  })

  it('falls back to one slide when headings are absent', () => {
    const theory = 'Просто сплошной текст без специальных заголовков.'

    expect(extractTheorySlides(theory, 'Тема')).toEqual([
      {
        title: 'Тема',
        content: theory,
      },
    ])
  })
})
