/**
 * Универсальный компонент для отображения текста с LaTeX формулами
 * Используется в задачах, тестах и чате
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathContentProps {
  /** Текст с возможными формулами */
  content: string;
  /** Цвет текста */
  textColor?: string;
  /** Размер шрифта */
  fontSize?: number;
  /** Использовать ли inline-режим (без дополнительных отступов) */
  inline?: boolean;
}

// Проверяем содержит ли текст формулы или специальные символы
const hasFormulas = (text: string): boolean => {
  // Проверяем явные LaTeX маркеры
  if (/\$\$.+?\$\$|\$[^$]+\$/.test(text)) return true;
  // Проверяем LaTeX команды
  if (/\\[a-zA-Z]+/.test(text)) return true;
  // Проверяем специальные символы
  if (/[²³⁴⁵⁶⁻⁰¹₀₁₂₃αβγδεπΔ∑∫√×÷≈≠≤≥∞θλμρσωνΣΩ→←]/.test(text)) return true;
  return false;
};

// Простой рендер формулы как текст (fallback)
const SimpleFormulaText: React.FC<{
  content: string;
  textColor: string;
  fontSize: number;
}> = ({ content, textColor, fontSize }) => {
  // Делаем текст более читаемым без LaTeX
  const formatted = content
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sqrt/g, '√')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\^\{([^}]+)\}/g, '^$1')
    .replace(/_\{([^}]+)\}/g, '₍$1₎')
    .replace(/\$/g, '');

  return (
    <Text style={{ color: textColor, fontSize, lineHeight: fontSize * 1.5, fontWeight: '400' }}>
      {formatted}
    </Text>
  );
};

export const MathContent: React.FC<MathContentProps> = ({
  content,
  textColor = '#1F2937',
  fontSize = 15,
  inline = false,
}) => {
  const [height, setHeight] = useState(inline ? 30 : 50);
  const [webViewFailed, setWebViewFailed] = useState(false);
  const [webViewLoaded, setWebViewLoaded] = useState(false);

  // Таймаут на загрузку WebView
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!webViewLoaded) {
        setWebViewFailed(true);
      }
    }, 4000); // 4 секунды на загрузку

    return () => clearTimeout(timer);
  }, [webViewLoaded]);

  // Если нет формул, показываем обычный текст
  if (!hasFormulas(content)) {
    return (
      <Text style={[styles.plainText, { color: textColor, fontSize, lineHeight: fontSize * 1.6 }]}>
        {content}
      </Text>
    );
  }

  // Fallback на простой текст если WebView не загрузился
  if (webViewFailed) {
    return <SimpleFormulaText content={content} textColor={textColor} fontSize={fontSize} />;
  }

  // Экранируем HTML спецсимволы, но сохраняем пробелы
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Подготавливаем контент - сохраняем пробелы
  let processedContent = escapeHtml(content);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: ${fontSize}px;
      line-height: 1.6;
      color: ${textColor};
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    #content {
      padding: ${inline ? '2px 0' : '4px 0'};
      white-space: pre-wrap;
      word-spacing: normal;
    }
    .katex { 
      font-size: 1.1em !important; 
      color: ${textColor} !important;
    }
    .katex-display { 
      margin: 10px 0 !important; 
      padding: 12px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
      border-radius: 10px;
      border-left: 3px solid #6366F1;
      overflow-x: auto;
    }
    .katex-display .katex {
      font-size: 1.15em !important;
    }
  </style>
</head>
<body>
  <div id="content">${processedContent.replace(/\n/g, '<br>')}</div>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      try {
        renderMathInElement(document.getElementById("content"), {
          delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false}
          ],
          throwOnError: false,
          errorColor: '#EF4444',
          strict: false
        });
      } catch(e) {
        console.error('KaTeX error:', e);
      }
      
      // Отправляем высоту после рендеринга
      setTimeout(() => {
        const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        window.ReactNativeWebView.postMessage(JSON.stringify({ height: h, loaded: true }));
      }, 150);
    });
  </script>
</body>
</html>`;

  return (
    <View style={[styles.container, { minHeight: height }]}>
      <WebView
        source={{ html }}
        style={{ height, backgroundColor: 'transparent', opacity: webViewLoaded ? 1 : 0.5 }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={() => setWebViewFailed(true)}
        onHttpError={() => setWebViewFailed(true)}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.loaded) {
              setWebViewLoaded(true);
            }
            if (data.height > 0) {
              setHeight(Math.max(inline ? 28 : 40, data.height + 10));
            }
          } catch {}
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  plainText: {
    fontWeight: '400',
  },
});

export default MathContent;
