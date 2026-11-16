import React from 'react';
import {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Wrench,
  Wind,
  Cpu,
  Sparkles,
  Briefcase,
} from 'lucide-react';

const ICON_MAP = {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Wrench,
  Wind,
  Cpu,
  Sparkles,
  electrician: Zap,
  plumber: Droplets,
  carpenter: Hammer,
  painter: Paintbrush,
  mechanic: Wrench,
  'ac technician': Wind,
  'ac-technician': Wind,
  'appliance repair': Cpu,
  'appliance-repair': Cpu,
  'cleaning professional': Sparkles,
  'cleaning-professional': Sparkles,
};

export default function CategoryIcon({ name, icon, className = 'w-6 h-6' }) {
  const key = icon || (name ? String(name).toLowerCase() : '');
  const IconComponent = ICON_MAP[key] || ICON_MAP[String(name || '').toLowerCase()] || Briefcase;
  return <IconComponent className={className} />;
}
