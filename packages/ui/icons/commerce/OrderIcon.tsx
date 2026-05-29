import { Package } from 'lucide-react';
import { IconProps } from '../types';
import { DESIGN_TOKENS } from '../../tokens';

export const OrderIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className,
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  
  return (
    <Package 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props} 
    />
  );
};