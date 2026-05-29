import { User } from 'lucide-react';
import { IconProps } from '../types';
import { DESIGN_TOKENS } from '../../tokens';

export const ProfileIcon = (props: IconProps) => {
  const color = props.color || DESIGN_TOKENS.colors.primary;
  const size = props.size || 24;
  const strokeWidth = props.strokeWidth || 2;
  
  return <User size={size} color={color} strokeWidth={strokeWidth} {...props} />;
};