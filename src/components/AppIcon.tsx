import { ReactNode } from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

type IconProps = {
  color?: string;
  size?: number;
  strokeWidth?: number;
};

function IconFrame({
  children,
  size = 20
}: IconProps & {
  children: ReactNode;
}) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      {children}
    </Svg>
  );
}

export function FilterIcon({ color = "#f4f7fb", size = 20, strokeWidth = 1.9 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Path
        d="M4 7h5M13 7h7M4 17h7M15 17h5M4 12h11M19 12h1"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <Circle cx="10" cy="7" fill={color} r="1.5" />
      <Circle cx="13" cy="17" fill={color} r="1.5" />
      <Circle cx="16" cy="12" fill={color} r="1.5" />
    </IconFrame>
  );
}

export function BoltIcon({ color = "#82f5d0", size = 20, strokeWidth = 1.9 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Path
        d="M13.3 2.8L7.6 12h4.6l-.9 9.2 5.7-9.2h-4.6l.9-9.2z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </IconFrame>
  );
}

export function FlameIcon({ color = "#f4a261", size = 20, strokeWidth = 1.9 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Path
        d="M12.2 3.4c.5 2.2-.2 3.6-1.8 5.2-1.7 1.7-3.4 3.3-3.4 6 0 3.1 2.3 5.4 5.1 5.4 3.1 0 5.7-2.4 5.7-5.8 0-2.2-1.1-4.1-2.7-5.9-.8-.9-1.8-2-2.2-4.9-.1-.5-.6-.5-.7 0z"
        fill={color}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth * 0.5}
      />
    </IconFrame>
  );
}

export function ReviewIcon({ color = "#f4a261", size = 20, strokeWidth = 1.9 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Path
        d="M6.2 6.6H3.8V4.2M17.8 17.4h2.4v2.4"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <Path
        d="M4.8 10a7.5 7.5 0 0 1 12.7-3.6M19.2 14a7.5 7.5 0 0 1-12.7 3.6"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </IconFrame>
  );
}

export function KeyboardIcon({ color = "#82f5d0", size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Rect
        height="11"
        rx="2.6"
        stroke={color}
        strokeWidth={strokeWidth}
        width="18"
        x="3"
        y="6.5"
      />
      <Path
        d="M7 10.2h.01M10.2 10.2h.01M13.4 10.2h.01M16.6 10.2h.01M7 13.2h.01M10.2 13.2h.01M13.2 13.2H17"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </IconFrame>
  );
}

export function RevealIcon({ color = "#82f5d0", size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Path
        d="M2.5 12s3.5-5.5 9.5-5.5S21.5 12 21.5 12s-3.5 5.5-9.5 5.5S2.5 12 2.5 12z"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <Circle cx="12" cy="12" fill={color} r="2.4" />
    </IconFrame>
  );
}

export function CheckIcon({ color = "#82f5d0", size = 20, strokeWidth = 2 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Path
        d="M5 12.5l4.2 4.2L19 7"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </IconFrame>
  );
}

export function CardsIcon({ color = "#82f5d0", size = 20, strokeWidth = 1.9 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Rect
        height="12"
        rx="2.4"
        stroke={color}
        strokeWidth={strokeWidth}
        width="14"
        x="6.2"
        y="7"
      />
      <Path
        d="M9.2 5.2h6.6a2 2 0 0 1 2 2V14M4.8 9V7.2a2 2 0 0 1 2-2h1.6"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </IconFrame>
  );
}

export function ChartIcon({ color = "#82f5d0", size = 20, strokeWidth = 1.9 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Path
        d="M6 18V11M12 18V7M18 18v-5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
      <Path
        d="M4.8 18h14.4"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </IconFrame>
  );
}

export function TargetIcon({ color = "#82f5d0", size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Circle cx="12" cy="12" r="7" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M12 3.8v2M12 18.2v2M3.8 12h2M18.2 12h2"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </IconFrame>
  );
}

export function SparkIcon({ color = "#82f5d0", size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <IconFrame size={size}>
      <Path
        d="M12 4.8l1.2 3.8 3.8 1.2-3.8 1.2-1.2 3.8-1.2-3.8-3.8-1.2 3.8-1.2L12 4.8z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </IconFrame>
  );
}
