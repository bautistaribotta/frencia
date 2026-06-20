/* ============================================================
   Frencia Design System — React Native
   Single import surface:
     import { Button, StatTile, colors, useFrenciaFonts } from '@/design';
   ============================================================ */

// Tokens & theme
export * from './theme';

// Theme runtime (provider + hooks)
export {
  FrenciaThemeProvider,
  useTheme,
  useColors,
  useThemedStyles,
} from './theme-context';

// Fonts & icons
export { useFrenciaFonts } from './fonts';
export { Icon } from './Icon';
export type { IconName, IconProps } from './Icon';

// Components — core
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';
export { IconButton } from './components/IconButton';
export type { IconButtonProps } from './components/IconButton';
export { Card } from './components/Card';
export type { CardProps } from './components/Card';
export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';
export { Tag } from './components/Tag';
export type { TagProps } from './components/Tag';
export { Avatar } from './components/Avatar';
export type { AvatarProps } from './components/Avatar';
export { FrenciaText } from './components/Text';
export type { FrenciaTextProps } from './components/Text';

// Components — data
export { StatTile } from './components/StatTile';
export type { StatTileProps } from './components/StatTile';
export { MetricPill } from './components/MetricPill';
export type { MetricPillProps } from './components/MetricPill';
export { ProgressBar } from './components/ProgressBar';
export type { ProgressBarProps } from './components/ProgressBar';
export { Stepper } from './components/Stepper';
export type { StepperProps } from './components/Stepper';
export { WheelPicker } from './components/WheelPicker';
export type { WheelPickerProps } from './components/WheelPicker';
export { SetRow } from './components/SetRow';
export type { SetRowProps } from './components/SetRow';

// Components — navigation
export { SegmentedControl } from './components/SegmentedControl';
export type { SegmentedControlProps, SegOption } from './components/SegmentedControl';
export { TabBar } from './components/TabBar';
export type { TabBarProps, TabItem, TabFab } from './components/TabBar';

// Components — feedback
export { Switch } from './components/Switch';
export type { SwitchProps } from './components/Switch';
