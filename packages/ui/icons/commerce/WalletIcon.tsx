import { Wallet } from 'lucide-react';
import { IconProps } from '../types';
import { DESIGN_TOKENS } from '../../tokens';

export const WalletIcon = ({ 
  size = 24, 
  color, 
  strokeWidth = 2, 
  className,
  ...props 
}: IconProps) => {
  const iconColor = color || DESIGN_TOKENS.colors.primary;
  
  return (
    <Wallet 
      size={size} 
      color={iconColor} 
      strokeWidth={strokeWidth} 
      className={className}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props} 
    />
  );
};
export { WalletIcon as Wallet };