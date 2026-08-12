import Svg, { Circle, G, Line, Polygon, Text as SvgText } from "react-native-svg";
import type { RadarChartData } from "@/src/lib/compare-radar-metrics";
import { Colors } from "@/constants/theme";

const COLORS = [Colors.brand[700], Colors.brand[500], "#7ec8e8"];

interface CompareRadarChartProps {
  data: RadarChartData;
  size?: number;
}

export function CompareRadarChart({ data, size = 260 }: CompareRadarChartProps) {
  const { axes, labels } = data;
  const n = axes.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;

  const point = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const polygonPoints = (hi: number) =>
    axes
      .map((axis, i) => {
        const p = point((360 / n) * i, ((axis.values[hi] ?? 0) / 100) * maxR);
        return `${p.x},${p.y}`;
      })
      .join(" ");

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[25, 50, 75, 100].map((level) => {
        const r = (level / 100) * maxR;
        const pts = Array.from({ length: n }, (_, i) => point((360 / n) * i, r))
          .map((p) => `${p.x},${p.y}`)
          .join(" ");
        return <Polygon key={level} points={pts} fill="none" stroke="#e2e8f0" strokeWidth={1} />;
      })}
      {axes.map((_, i) => {
        const p = point((360 / n) * i, maxR);
        return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth={1} />;
      })}
      {labels.map((_, hi) => (
        <Polygon
          key={hi}
          points={polygonPoints(hi)}
          fill={COLORS[hi % 3]}
          fillOpacity={0.15}
          stroke={COLORS[hi % 3]}
          strokeWidth={2}
        />
      ))}
      {axes.map((axis, i) => {
        const p = point((360 / n) * i, maxR + 16);
        return (
          <SvgText
            key={axis.id}
            x={p.x}
            y={p.y}
            fill={Colors.muted}
            fontSize={9}
            fontWeight="600"
            textAnchor="middle"
          >
            {axis.label}
          </SvgText>
        );
      })}
      <Circle cx={cx} cy={cy} r={3} fill={Colors.brand[500]} />
    </Svg>
  );
}
