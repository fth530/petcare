import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface DataPoint {
  x: number; // timestamp or index
  y: number;
  label?: string;
}

interface LineChartProps {
  data: DataPoint[];
  width: number;
  height?: number;
  unit?: string;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height = 160,
  unit = '',
  color,
}) => {
  const { colors } = useTheme();
  const lineColor = color ?? colors.primary[500];
  const pad = { top: 20, right: 16, bottom: 32, left: 40 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  if (data.length < 2) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <SvgText fill={colors.subtext} fontSize={12} x={width / 2} y={height / 2} textAnchor="middle">
          Not enough data
        </SvgText>
      </View>
    );
  }

  const minX = Math.min(...data.map((d) => d.x));
  const maxX = Math.max(...data.map((d) => d.x));
  const minY = Math.min(...data.map((d) => d.y));
  const maxY = Math.max(...data.map((d) => d.y));
  const rangeX = maxX - minX || 1;
  const rangeY = (maxY - minY) * 1.2 || 1;
  const baseY = minY - rangeY * 0.1;

  const toX = (x: number) => pad.left + ((x - minX) / rangeX) * chartW;
  const toY = (y: number) => pad.top + chartH - ((y - baseY) / rangeY) * chartH;

  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(d.x)} ${toY(d.y)}`)
    .join(' ');

  const areaD = `${pathD} L ${toX(data[data.length - 1].x)} ${pad.top + chartH} L ${toX(data[0].x)} ${pad.top + chartH} Z`;

  const yTicks = [minY, (minY + maxY) / 2, maxY].map((v) => Math.round(v * 10) / 10);

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
          <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <React.Fragment key={i}>
          <Line
            x1={pad.left} y1={toY(tick)}
            x2={pad.left + chartW} y2={toY(tick)}
            stroke={colors.border} strokeWidth={1} strokeDasharray="4,4"
          />
          <SvgText
            x={pad.left - 6} y={toY(tick) + 4}
            fill={colors.subtext} fontSize={10} textAnchor="end"
          >
            {tick}{unit}
          </SvgText>
        </React.Fragment>
      ))}

      {/* Area fill */}
      <Path d={areaD} fill="url(#grad)" />

      {/* Line */}
      <Path d={pathD} stroke={lineColor} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points + x labels */}
      {data.map((d, i) => (
        <React.Fragment key={i}>
          <Circle cx={toX(d.x)} cy={toY(d.y)} r={4} fill={lineColor} />
          {d.label ? (
            <SvgText x={toX(d.x)} y={pad.top + chartH + 16} fill={colors.subtext} fontSize={9} textAnchor="middle">
              {d.label}
            </SvgText>
          ) : null}
        </React.Fragment>
      ))}
    </Svg>
  );
};

const styles = StyleSheet.create({ empty: { alignItems: 'center', justifyContent: 'center' } });
