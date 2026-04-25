/**
 * Компонент для отображения LaTeX формул через KaTeX
 * Использует WebView для рендеринга математических выражений
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface FormulaProps {
  /** LaTeX формула (без $$) */
  formula: string;
  /** Режим отображения: inline (в тексте) или block (отдельным блоком) */
  displayMode?: boolean;
  /** Цвет текста формулы */
  color?: string;
  /** Размер шрифта */
  fontSize?: number;
  /** Фон */
  backgroundColor?: string;
}

export const Formula: React.FC<FormulaProps> = ({
  formula,
  displayMode = true,
  color = '#ffffff',
  fontSize = 18,
  backgroundColor = 'transparent',
}) => {
  const html = useMemo(() => {
    // Экранируем специальные символы для HTML
    const escapedFormula = formula
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      background: ${backgroundColor};
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100%;
    }
    #formula {
      color: ${color};
      font-size: ${fontSize}px;
      padding: 4px 0;
      text-align: center;
    }
    .katex { 
      font-size: 1em !important;
      color: ${color} !important;
    }
    .katex-display {
      margin: 0 !important;
    }
  </style>
</head>
<body>
  <div id="formula"></div>
  <script>
    try {
      katex.render('${escapedFormula}', document.getElementById('formula'), {
        displayMode: ${displayMode},
        throwOnError: false,
        errorColor: '#ff6b6b',
        trust: true,
        strict: false
      });
    } catch {
      document.getElementById('formula').innerHTML = '<span style="color: #ff6b6b;">Ошибка формулы</span>';
    }
  </script>
</body>
</html>
    `;
  }, [formula, displayMode, color, fontSize, backgroundColor]);

  // Высота зависит от режима отображения
  const height = displayMode ? Math.max(50, fontSize * 3) : fontSize * 2;

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        source={{ html }}
        style={[styles.webview, { backgroundColor }]}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default Formula;















