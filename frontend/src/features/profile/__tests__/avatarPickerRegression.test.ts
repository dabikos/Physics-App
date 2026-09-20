import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('../components.tsx', import.meta.url), 'utf8')

describe('profile avatar picker regression', () => {
  it('does not regenerate avatar options when the user object identity changes', () => {
    expect(source).not.toMatch(
      /useEffect\(\(\) => \{[\s\S]*?refreshAvatarOptions\(\)[\s\S]*?\}, \[user, visible\]\)/,
    )
  })
})
