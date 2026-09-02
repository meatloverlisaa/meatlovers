'use client';

import React from 'react';
import {
  CreditCardIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  ShoppingCartIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  DocumentIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  ClipboardIcon,
  BellIcon,
  CheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// Mapping of emoji/icon types to Heroicons components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // Financial
  '💳': CreditCardIcon,
  'credit-card': CreditCardIcon,
  '💰': CurrencyDollarIcon,
  'money': CurrencyDollarIcon,
  'currency': CurrencyDollarIcon,
  '💵': CurrencyDollarIcon,
  'dollar': CurrencyDollarIcon,

  // Status/Alerts
  '⚠️': ExclamationTriangleIcon,
  'warning': ExclamationTriangleIcon,
  'alert': ExclamationTriangleIcon,
  '🚨': BellIcon,
  'siren': BellIcon,

  // Charts/Analytics
  '📊': ChartBarIcon,
  'chart': ChartBarIcon,
  'analytics': ChartBarIcon,
  '📈': ArrowTrendingUpIcon,
  'trending': ArrowTrendingUpIcon,
  'trend-up': ArrowTrendingUpIcon,

  // People
  '👥': UserGroupIcon,
  'people': UserGroupIcon,
  'users': UserGroupIcon,
  'team': UserGroupIcon,
  '👤': UserIcon,
  'person': UserIcon,
  'user': UserIcon,
  'profile': UserIcon,

  // Status/Check
  '✅': CheckCircleIcon,
  'check': CheckCircleIcon,
  'success': CheckCircleIcon,
  'approved': CheckCircleIcon,

  // Documents
  '📋': DocumentTextIcon,
  'clipboard': ClipboardIcon,
  'list': DocumentTextIcon,
  'document': DocumentTextIcon,
  '📄': DocumentIcon,
  'page': DocumentIcon,

  // Time/Calendar
  '🏖️': CalendarIcon,
  'leave': CalendarIcon,
  'vacation': CalendarIcon,
  'calendar': CalendarIcon,

  // Work
  '💼': BriefcaseIcon,
  'briefcase': BriefcaseIcon,
  'job': BriefcaseIcon,
  'employment': BriefcaseIcon,

  // Bank
  '🏦': BuildingLibraryIcon,
  'bank': BuildingLibraryIcon,
  'building': BuildingLibraryIcon,

  // Shopping
  '🛒': ShoppingCartIcon,
  'cart': ShoppingCartIcon,
  'shopping': ShoppingCartIcon,
  'products': ShoppingCartIcon,

  // Inventory
  '📦': CubeIcon,
  'package': CubeIcon,
  'stock': CubeIcon,
  'inventory': CubeIcon,
  'box': CubeIcon,

  // Education
  '🎓': AcademicCapIcon,
  'training': AcademicCapIcon,
  'education': AcademicCapIcon,
  'graduation': AcademicCapIcon,

  // Web
  '🌐': GlobeAltIcon,
  'globe': GlobeAltIcon,
  'website': GlobeAltIcon,
  'web': GlobeAltIcon,

  // Cycling/Recycle
  '♻️': ArrowPathIcon,
  'recycle': ArrowPathIcon,
  'waste': ArrowPathIcon,
  'refresh': ArrowPathIcon,

  // Computer
  '🖥️': ComputerDesktopIcon,
  'computer': ComputerDesktopIcon,
  'desktop': ComputerDesktopIcon,
  'pos': ComputerDesktopIcon,

  // Serve/Plate
  '🍽️': SparklesIcon,
  'serve': SparklesIcon,
  'plate': SparklesIcon,
  'ready': CheckIcon,
};

interface IconRendererProps {
  icon?: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Renders an icon based on emoji or icon type string
 * Supports both emoji characters (💰) and icon type names (money, currency, dollar)
 */
export function IconRenderer({
  icon,
  className = 'w-6 h-6',
  fallback = null,
}: IconRendererProps) {
  if (!icon) {
    return <>{fallback}</>;
  }

  // Try to get the icon component from the map
  const IconComponent = ICON_MAP[icon.toLowerCase().trim()];

  if (!IconComponent) {
    console.warn(`Icon not found in mapping: "${icon}"`);
    return <>{fallback}</>;
  }

  return <IconComponent className={className} />;
}

/**
 * Get icon component by emoji or icon type
 */
export function getIconComponent(
  icon?: string
): React.ComponentType<{ className?: string }> | null {
  if (!icon) return null;
  return ICON_MAP[icon.toLowerCase().trim()] || null;
}

/**
 * Hook to use icon component with className
 */
export function useIcon(
  icon?: string,
  className?: string
): React.ReactNode {
  return <IconRenderer icon={icon} className={className} />;
}

export default IconRenderer;
