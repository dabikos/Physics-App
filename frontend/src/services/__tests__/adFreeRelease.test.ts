import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(relativePath: string) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function sourceFiles(directory: string): string[] {
  return readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(relativePath);
    return /\.(ts|tsx)$/.test(entry.name) ? [relativePath] : [];
  });
}

describe('ad-free release', () => {
  it('does not bundle or initialize the AdMob SDK', () => {
    const packageJson = JSON.parse(read('package.json'));
    const appJson = JSON.parse(read('app.json'));

    expect(packageJson.dependencies).not.toHaveProperty('react-native-google-mobile-ads');
    expect(appJson.expo.plugins.some((plugin: string | string[]) =>
      (Array.isArray(plugin) ? plugin[0] : plugin) === 'react-native-google-mobile-ads'
    )).toBe(false);

    for (const file of sourceFiles('app').concat(sourceFiles('src'))) {
      const source = read(file);
      expect(source, file).not.toMatch(/react-native-google-mobile-ads|useAdGate|showRewardedChatAd|initializeMobileAds/);
    }
  });

  it('keeps subscription copy truthful in every language', () => {
    for (const language of ['ru', 'en', 'kk']) {
      const locale = JSON.parse(read(`src/locales/${language}.json`));
      expect(locale.subscription.comparison).not.toHaveProperty('ads');
      expect(locale.subscription).not.toHaveProperty('benefitNoAds');
      expect(locale.subscription.premiumBadge).toBeTruthy();
      expect(locale.aiChat.limitMessage).toContain('{{count}}');
      expect(locale.aiChat.limitMessage).toContain('{{plan}}');
    }
  });
});
