import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';

const ink = '#334155';
const blue = '#4F63D8';
const nntImages: Record<string, number> = {
  'NNT-007': require('../../../assets/exams/nnt-pv.gif'),
  'NNT-029': require('../../../assets/exams/nnt-charges.gif'),
  'NNT-030': require('../../../assets/exams/nnt-wire.png'),
  'NNT-034': require('../../../assets/exams/nnt-volume.gif'),
  'NNT-043': require('../../../assets/exams/nnt-motion-a.png'),
  nnt_motion: require('../../../assets/exams/nnt-motion.png'),
  nnt_ui: require('../../../assets/exams/nnt-ui.png'),
};
const label = (x: number, y: number, value: string, size = 12) => (
  <SvgText x={x} y={y} fill={ink} fontSize={size} fontWeight="600">{value}</SvgText>
);
const wire = (x1: number, y1: number, x2: number, y2: number) => (
  <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={2} />
);

/** Clean, code-native redrawings of the figures in the supplied practice screenshots. */
export function ExamIllustration({ id }: { id: string }) {
  const { colors } = useTheme();
  if (nntImages[id]) return <View style={[styles.frame, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
    <Image source={nntImages[id]} contentFit="contain" style={styles.sourceImage} accessibilityLabel="Иллюстрация к заданию" />
  </View>;
  let diagram: React.ReactNode = null;

  switch (id) {
    case 'NNT-004':
      diagram = <>
        {wire(48, 147, 282, 147)}{wire(48, 147, 48, 18)}
        <Path d="M48 115 L240 38" stroke={blue} strokeWidth={3} fill="none" />
        <Line x1={208} y1={147} x2={208} y2={51} stroke={colors.textMuted} strokeDasharray="4 4" />
        <Line x1={48} y1={51} x2={208} y2={51} stroke={colors.textMuted} strokeDasharray="4 4" />
        {label(10, 24, 'l, мм')}{label(270, 166, 'F, Н')}
        {label(42, 164, '0')}{label(194, 164, '10')}{label(10, 119, '20')}{label(10, 55, '40')}
      </>;
      break;
    case 'OZP-034':
      diagram = <>
        {wire(43, 143, 268, 143)}{wire(43, 143, 43, 20)}
        <Path d="M43 143 L223 35" stroke={blue} strokeWidth={3} fill="none" />
        {[88, 133, 178, 223].map((x, i) => <React.Fragment key={x}>
          <Line x1={x} y1={143} x2={x} y2={143 - (i + 1) * 27} stroke={colors.textMuted} strokeDasharray="4 4" />
        </React.Fragment>)}
        <Line x1={43} y1={89} x2={133} y2={89} stroke={colors.textMuted} strokeDasharray="4 4" />
        <Line x1={43} y1={35} x2={223} y2={35} stroke={colors.textMuted} strokeDasharray="4 4" />
        {label(7, 26, 'v, м/с')}{label(233, 162, 't, с')}{label(128, 161, '1')}{label(218, 161, '2')}{label(12, 92, '10')}{label(12, 39, '20')}
      </>;
      break;
    case 'OZP-044':
      diagram = <>
        <Rect x={42} y={75} width={24} height={64} fill={colors.cardAlt} stroke={ink} strokeWidth={2} />
        <Rect x={254} y={75} width={24} height={64} fill={colors.cardAlt} stroke={ink} strokeWidth={2} />
        <Path d="M36 47 Q160 137 284 47" stroke={blue} strokeWidth={4} fill="none" />
        <Rect x={145} y={68} width={30} height={30} fill={colors.cardAlt} stroke={ink} strokeWidth={2} />
        {wire(160, 70, 160, 24)}{wire(160, 98, 160, 140)}
        <Polygon points="160,20 155,31 165,31" fill={ink} />
        <Polygon points="160,145 155,134 165,134" fill={ink} />
        {label(172, 30, 'Fупр')}{label(172, 143, 'Fтяж')}
      </>;
      break;
    case 'OZP-045':
      diagram = <>
        {wire(24, 92, 56, 92)}{wire(56, 92, 79, 92)}
        <Rect x={79} y={83} width={28} height={18} fill={colors.cardAlt} stroke={ink} strokeWidth={2} />
        {label(82, 77, 'R₃')}{wire(107, 92, 133, 92)}
        <Rect x={133} y={83} width={28} height={18} fill={colors.cardAlt} stroke={ink} strokeWidth={2} />
        {label(136, 77, 'R₂')}{wire(161, 92, 184, 92)}
        <Rect x={184} y={83} width={28} height={18} fill={colors.cardAlt} stroke={ink} strokeWidth={2} />
        {label(187, 77, 'R₁')}{wire(212, 92, 286, 92)}
        <Path d="M56 92 V35 H105 M133 35 H184 V92" stroke={ink} strokeWidth={2} fill="none" />
        <Rect x={105} y={26} width={28} height={18} fill={colors.cardAlt} stroke={ink} strokeWidth={2} />
        {label(108, 20, 'R₄')}
        <Path d="M120 92 V142 H255 V92" stroke={ink} strokeWidth={2} fill="none" />
      </>;
      break;
    case 'OZP-053':
      diagram = <>
        {wire(45, 146, 274, 146)}{wire(45, 146, 45, 18)}
        <Path d="M118 101 V48 H205 V101" stroke={blue} strokeWidth={3} fill="none" />
        <Line x1={118} y1={101} x2={45} y2={101} stroke={colors.textMuted} strokeDasharray="4 4" />
        <Line x1={118} y1={48} x2={45} y2={48} stroke={colors.textMuted} strokeDasharray="4 4" />
        <Line x1={118} y1={101} x2={118} y2={146} stroke={colors.textMuted} strokeDasharray="4 4" />
        <Line x1={205} y1={101} x2={205} y2={146} stroke={colors.textMuted} strokeDasharray="4 4" />
        {label(17, 52, '2P₀')}{label(22, 105, 'P₀')}{label(106, 165, 'V₀')}{label(192, 165, '2V₀')}
        {label(100, 96, '1')}{label(100, 42, '2')}{label(211, 42, '3')}{label(211, 103, '4')}{label(277, 151, 'V')}{label(33, 18, 'P')}
      </>;
      break;
    case 'OZP-055':
      diagram = <>
        {[39, 72, 105, 138].map(y => <React.Fragment key={y}>
          {wire(37, y, 254, y)}<Polygon points={`260,${y} 250,${y - 5} 250,${y + 5}`} fill={ink} />
        </React.Fragment>)}
        {wire(143, 72, 143, 138)}
        {label(49, 67, '2')}{label(149, 67, '1')}{label(149, 137, '3')}{label(270, 78, 'E')}{label(153, 102, '90°')}
      </>;
      break;
    case 'OZP-067':
      diagram = <>
        {wire(20, 88, 60, 88)}{wire(60, 37, 60, 136)}{wire(60, 37, 96, 37)}
        {[96, 178].map((x, i) => <React.Fragment key={x}>
          {wire(x, 19, x, 55)}{wire(x + 10, 19, x + 10, 55)}
          {label(x - 1, 15, `C${i + 1}`)}
        </React.Fragment>)}
        {wire(106, 37, 178, 37)}{wire(188, 37, 256, 37)}{wire(256, 37, 256, 136)}
        {wire(60, 136, 94, 136)}
        {[94, 145, 196].map((x, i) => <React.Fragment key={x}>
          {wire(x, 118, x, 154)}{wire(x + 10, 118, x + 10, 154)}
          {label(x - 1, 112, `C${i + 3}`)}
        </React.Fragment>)}
        {wire(104, 136, 145, 136)}{wire(155, 136, 196, 136)}{wire(206, 136, 256, 136)}{wire(256, 88, 295, 88)}
      </>;
      break;
    case 'OZP-078':
      diagram = <>
        <Path d="M94 22 V128 H214 V22" stroke={ink} strokeWidth={3} fill="none" />
        <Rect x={97} y={74} width={114} height={51} fill="#F7C948" opacity={0.7} />
        <Rect x={97} y={48} width={114} height={25} fill={colors.border} stroke={ink} strokeWidth={2} />
        {wire(236, 47, 236, 73)}<Polygon points="236,39 231,51 241,51" fill={ink} />
        {label(135, 65, 'm = 50 кг')}{label(241, 61, '10 см')}{label(143, 154, 'Q = 180 Дж')}
        <Path d="M154 124 Q138 141 154 148 Q170 137 154 124" fill="#F59E0B" />
      </>;
      break;
    case 'OZP-088':
      diagram = <>
        <Path d="M65 66 L215 66 L263 39 L112 39 Z M65 66 V123 L215 123 V66 M215 123 L263 95 V39" stroke={ink} strokeWidth={2} fill={colors.cardAlt} />
        <Line x1={66} y1={141} x2={215} y2={141} stroke={blue} strokeWidth={2} />
        {label(121, 158, '25 см')}{label(235, 126, '12 см')}{label(265, 75, '6,5 см')}
      </>;
      break;
    case 'optical_fiber':
      diagram = <>
        <Rect x={18} y={30} width={284} height={112} fill={colors.cardAlt} stroke={ink} strokeWidth={2} />
        <Rect x={26} y={60} width={268} height={52} fill={colors.optionSelectedBg} stroke={blue} strokeWidth={2} />
        <Path d="M58 108 L160 60 L248 108" stroke={blue} strokeWidth={3} fill="none" />
        {label(164, 53, 'P')}{label(214, 52, 'оболочка')}{label(214, 93, 'сердцевина')}
      </>;
      break;
  }

  if (!diagram) return null;
  return (
    <View style={[styles.frame, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
      <Svg width="100%" height={180} viewBox="0 0 320 180">{diagram}</Svg>
    </View>
  );
}

export interface ExamContext {
  id: string;
  title: string;
  text: string;
  table?: { headers: string[]; rows: string[][] } | null;
  diagram_description?: string | null;
  illustrationId?: string;
}

export function ContextMaterial({ context }: { context: ExamContext }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.context, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
      <Text style={[styles.contextTitle, { color: colors.text }]}>{context.title}</Text>
      <Text style={[styles.contextText, { color: colors.textSecondary }]}>{context.text}</Text>
      {(context.illustrationId || context.id === 'optical_fiber') && <ExamIllustration id={context.illustrationId || 'optical_fiber'} />}
      {context.table && <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={[styles.table, { borderColor: colors.border }]}>
          <View style={[styles.tableRow, { backgroundColor: colors.optionSelectedBg }]}>
            {context.table.headers.map((cell, i) => <Text key={i} style={[styles.tableCell, styles.tableHead, { color: colors.text, borderColor: colors.border }]}>{cell}</Text>)}
          </View>
          {context.table.rows.map((row, i) => <View key={i} style={styles.tableRow}>
            {row.map((cell, j) => <Text key={j} style={[styles.tableCell, { color: colors.textSecondary, borderColor: colors.border }]}>{cell}</Text>)}
          </View>)}
        </View>
      </ScrollView>}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { marginTop: 12, borderWidth: 1, borderRadius: 16, overflow: 'hidden', padding: 8 },
  sourceImage: { width: '100%', height: 210 },
  context: { marginBottom: 16, borderWidth: 1, borderRadius: 18, padding: 16 },
  contextTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  contextText: { fontSize: 14, lineHeight: 22 },
  table: { borderWidth: 1, borderRadius: 8, overflow: 'hidden', marginTop: 14 },
  tableRow: { flexDirection: 'row' },
  tableCell: { width: 112, fontSize: 12, lineHeight: 17, padding: 8, borderRightWidth: 1, borderBottomWidth: 1 },
  tableHead: { fontWeight: '700' },
});
