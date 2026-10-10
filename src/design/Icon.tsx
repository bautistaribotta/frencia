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
  Combine,
  Dumbbell,
  Eye,
  EyeOff,
  FileText,
  Flame,
  GripVertical,
  HeartPulse,
  History,
  Home,
  Hourglass,
  Layers,
  List,
  Lock,
  LogOut,
  Mail,
  Minus,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat,
  RotateCcw,
  Search,
  Settings,
  Share,
  Shield,
  SkipForward,
  Square,
  Camera,
  Target,
  Ticket,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Undo2,
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
  combine: Combine,
  dumbbell: Dumbbell,
  eye: Eye,
  'eye-off': EyeOff,
  'file-text': FileText,
  flame: Flame,
  'grip-vertical': GripVertical,
  'heart-pulse': HeartPulse,
  history: History,
  home: Home,
  hourglass: Hourglass,
  info: Info,
  layers: Layers,
  list: List,
  lock: Lock,
  'log-out': LogOut,
  mail: Mail,
  minus: Minus,
  'more-horizontal': MoreHorizontal,
  pause: Pause,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  repeat: Repeat,
  'rotate-ccw': RotateCcw,
  search: Search,
  settings: Settings,
  share: Share,
  shield: Shield,
  'skip-forward': SkipForward,
  square: Square,
  target: Target,
  ticket: Ticket,
  timer: Timer,
  'trash-2': Trash2,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  'undo-2': Undo2,
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
