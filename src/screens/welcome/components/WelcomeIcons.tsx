import React from 'react';
import {
  Building2,
  Briefcase,
  Users,
  Coffee,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react-native';

interface IconProps {
  color?: string;
  size?: number;
}

/**
 * Modern Workspace / Office Building Icon for the Hero Center Bubble
 */
export const WorkspaceDeskIcon: React.FC<IconProps> = ({
  color = '#FFFFFF',
  size = 52,
}) => {
  return <Building2 size={size} color={color} strokeWidth={2} />;
};

/**
 * Briefcase / Work Icon
 */
export const BriefcaseIcon: React.FC<IconProps> = ({
  color = '#FFFFFF',
  size = 36,
}) => {
  return <Briefcase size={size} color={color} strokeWidth={2} />;
};

/**
 * Community / Coworkers Icon
 */
export const CommunityIcon: React.FC<IconProps> = ({
  color = '#176B67',
  size = 38,
}) => {
  return <Users size={size} color={color} strokeWidth={2} />;
};

/**
 * Coffee Mug / Amenities Icon
 */
export const CoffeeIcon: React.FC<IconProps> = ({
  color = '#176B67',
  size = 26,
}) => {
  return <Coffee size={size} color={color} strokeWidth={2.2} />;
};

/**
 * Map Pin / Workspace Location Icon
 */
export const LocationPinIcon: React.FC<IconProps> = ({
  color = '#176B67',
  size = 32,
}) => {
  return <MapPin size={size} color={color} strokeWidth={2.2} />;
};

/**
 * Calendar / Booking Schedule Icon
 */
export const CalendarBookingIcon: React.FC<IconProps> = ({
  color = '#FFFFFF',
  size = 34,
}) => {
  return <Calendar size={size} color={color} strokeWidth={2} />;
};

/**
 * Sparkles / Quality Icon
 */
export const SparkleIcon: React.FC<IconProps> = ({
  color = '#F2C078',
  size = 30,
}) => {
  return <Sparkles size={size} color={color} strokeWidth={2} />;
};
