import React from 'react';
import {
  Home,
  ShoppingCart,
  Coffee,
  Car,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  Briefcase,
  Laptop,
  TrendingUp,
  Tag,
  DollarSign,
  Gift,
  Plane,
  Utensils,
  BookOpen,
  Wifi,
  Smile,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  ShoppingCart,
  Coffee,
  Car,
  Zap,
  Film,
  ShoppingBag,
  HeartPulse,
  Briefcase,
  Laptop,
  TrendingUp,
  Tag,
  DollarSign,
  Gift,
  Plane,
  Utensils,
  BookOpen,
  Wifi,
  Smile,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface CategoryIconProps {
  iconName: string;
  color?: string;
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  color,
  size = 18,
  className = '',
}) => {
  const IconComponent = ICON_MAP[iconName] || Tag;

  return (
    <div
      className={`flex items-center justify-center shrink-0 rounded-lg ${className}`}
      style={color ? { backgroundColor: `${color}1A`, color: color } : undefined}
    >
      <IconComponent size={size} strokeWidth={2.2} />
    </div>
  );
};
