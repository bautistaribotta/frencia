/* ============================================================
   Frencia · Icon
   RN port of the Lucide usage from the web kit (data-lucide="…").
   Components accept a kebab-case `icon` name; this resolves it to
   a lucide-react-native component. Stroke 2px, currentColor.
   Add more icons to REGISTRY as needed.
   ============================================================ */

import React from 'react';
import {
  Activity,
  AlertTriangle,
  Apple,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CalendarOff,
  Check,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Dumbbell,
  Eye,
  EyeOff,
  Flame,
  Home,
  List,
  Lock,
  LogOut,
  Mail,
  Minus,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Repeat,
  Search,
  Settings,
  Camera,
  Target,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { useColors } from './theme-context';

const REGISTRY: Record<string, LucideIcon> = {
  activity: Activity,
  'alert-triangle': AlertTriangle,
  apple: Apple,
  'arrow-down-right': ArrowDownRight,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  'bar-chart-3': BarChart3,
  calendar: Calendar,
  'calendar-off': CalendarOff,
  camera: Camera,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  clock: Clock,
  dumbbell: Dumbbell,
  eye: Eye,
  'eye-off': EyeOff,
  flame: Flame,
  home: Home,
  info: Info,
  list: List,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  minus: Minus,
  'more-horizontal': MoreHorizontal,
  pause: Pause,
  play: Play,
  plus: Plus,
  repeat: Repeat,
  search: Search,
  settings: Settings,
  target: Target,
  timer: Timer,
  'trash-2': Trash2,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  user: User,
  x: X,
  zap: Zap,
};

export type IconName = keyof typeof REGISTRY;

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Renders a Lucide icon by kebab name. Unknown names render nothing. */
export function Icon({ name, size = 20, color, strokeWidth = 2 }: IconProps) {
  const colors = useColors();
  const Cmp = REGISTRY[name];
  if (!Cmp) {
    if (__DEV__) console.warn(`[Frencia] Icon "${name}" not in registry — add it to Icon.tsx`);
    return null;
  }
  return <Cmp size={size} color={color ?? colors.textPrimary} strokeWidth={strokeWidth} />;
}
