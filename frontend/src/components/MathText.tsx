/**
 * Компонент для отображения текста с встроенными LaTeX формулами
 * Парсит текст и заменяет $$...$$ и $...$ на Formula компоненты
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathTextProps {
  /** Текст с LaTeX формулами ($$...$$ для блочных, $...$ для inline) */
  content: string;
  /** Цвет текста */
  textColor?: string;
  /** Размер шрифта текста */
  fontSize?: number;
  /** Цвет фона */
  backgroundColor?: string;
  /** Стиль контейнера */
  style?: any;
}

export const MathText: React.FC<MathTextProps> = ({
  content,
  textColor = '#ffffff',
  fontSize = 16,
  backgroundColor = 'transparent',
  style,
}) => {
  const html = useMemo(() => {
    // Преобразуем markdown-подобное форматирование в HTML
    let processedContent = content
      // Заголовки
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Жирный текст
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Курсив
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Списки
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      // Переносы строк
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Оборачиваем в параграф если нужно
    if (!processedContent.startsWith('<')) {
      processedContent = `<p>${processedContent}</p>`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      background: ${backgroundColor};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: ${fontSize}px;
      line-height: 1.6;
      color: ${textColor};
      padding: 8px 12px;
    }
    h1 {
      font-size: 1.5em;
      font-weight: 700;
      margin: 16px 0 12px 0;
      color: ${textColor};
      border-bottom: 1px solid rgba(255,255,255,0.2);
      padding-bottom: 8px;
    }
    h2 {
      font-size: 1.3em;
      font-weight: 600;
      margin: 14px 0 10px 0;
      color: ${textColor};
    }
    h3 {
      font-size: 1.15em;
      font-weight: 600;
      margin: 12px 0 8px 0;
      color: ${textColor};
    }
    p {
      margin: 8px 0;
      text-align: justify;
    }
    strong {
      color: #64B5F6;
      font-weight: 600;
    }
    em {
      color: #81C784;
      font-style: italic;
    }
    li {
      margin: 4px 0 4px 20px;
      list-style-position: outside;
    }
    ul, ol {
      margin: 8px 0;
      padding-left: 8px;
    }
    .katex {
      font-size: 1.1em !important;
      color: ${textColor} !important;
    }
    .katex-display {
      margin: 16px 0 !important;
      padding: 12px;
      background: rgba(100, 181, 246, 0.1);
      border-radius: 8px;
      border-left: 3px solid #64B5F6;
      overflow-x: auto;
    }
    .katex-display > .katex {
      font-size: 1.2em !important;
    }
    code {
      background: rgba(255,255,255,0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.9em;
    }
    blockquote {
      border-left: 3px solid #FFB74D;
      padding-left: 12px;
      margin: 12px 0;
      color: rgba(255,255,255,0.8);
      font-style: italic;
    }
  </style>
</head>
<body>
  <div id="content">${processedContent}</div>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      renderMathInElement(document.getElementById("content"), {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false},
          {left: "\\\\[", right: "\\\\]", display: true},
          {left: "\\\\(", right: "\\\\)", display: false}
        ],
        throwOnError: false,
        errorColor: '#ff6b6b',
        trust: true,
        strict: false
      });
      
      // Отправляем высоту контента обратно в React Native
      setTimeout(function() {
        const height = document.body.scrollHeight;
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', value: height}));
      }, 100);
    });
  </script>
</body>
</html>
    `;
  }, [content, textColor, fontSize, backgroundColor]);

  const [webViewHeight, setWebViewHeight] = React.useState(300);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'height' && data.value > 0) {
        setWebViewHeight(data.value + 20);
      }
    } catch {
      // ignore
    }
  };

  return (
    <View style={[styles.container, style, { minHeight: webViewHeight }]}>
      <WebView
        source={{ html }}
        style={[styles.webview, { height: webViewHeight }]}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        bounces={false}
        overScrollMode="never"
        onMessage={handleMessage}
        injectedJavaScript={`
          setTimeout(function() {
            const height = document.body.scrollHeight;
            window.ReactNativeWebView.postMessage(JSON.stringify({type: 'height', value: height}));
          }, 500);
          true;
        `}
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

export default MathText;















