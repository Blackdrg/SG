import React from 'react';
import { DESIGN_TOKENS, MOTION_EASING } from './tokens';

const shimmerStyle = `
  @keyframes sg-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('sg-skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'sg-skeleton-styles';
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  variant?: 'text' | 'circular' | 'rectangular';
  style?: React.CSSProperties;
}

export const Skeleton = ({ 
  width, 
  height = 16, 
  borderRadius, 
  variant = 'rectangular',
  style,
}: SkeletonProps) => {
  const getDefaultRadius = () => {
    if (borderRadius) return borderRadius;
    if (variant === 'circular') return 9999;
    if (variant === 'text') return DESIGN_TOKENS.radius.sm;
    return DESIGN_TOKENS.radius.md;
  };

  const getDefaultSize = () => {
    if (variant === 'circular') {
      const size = typeof width === 'number' ? width : 40;
      return { width: size, height: size };
    }
    return { width: width || '100%', height };
  };

  return (
    <div
      style={{
        ...getDefaultSize(),
        backgroundColor: DESIGN_TOKENS.colors.elevated,
        borderRadius: getDefaultRadius(),
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `linear-gradient(90deg, ${DESIGN_TOKENS.colors.elevated} 0px, ${DESIGN_TOKENS.colors.surface} 40px, ${DESIGN_TOKENS.colors.elevated} 80px)`,
        backgroundSize: '200% 100%',
        animation: `sg-shimmer ${DESIGN_TOKENS.motion.standard * 2}ms infinite linear`,
      }} />
    </div>
  );
};

interface SkeletonCardProps {
  count?: number;
}

export const SkeletonCard = ({ count = 1 }: SkeletonCardProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.md }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        border: `1px solid ${DESIGN_TOKENS.colors.border}`,
        borderRadius: `${DESIGN_TOKENS.radius.card}px`,
        padding: `${DESIGN_TOKENS.spacing.lg}px`,
        backgroundColor: DESIGN_TOKENS.colors.surface,
      }}>
        <div style={{ display: 'flex', gap: DESIGN_TOKENS.spacing.md, alignItems: 'center' }}>
          <Skeleton variant="circular" width={48} />
          <div style={{ flex: 1 }}>
            <Skeleton height={16} width="70%" style={{ marginBottom: DESIGN_TOKENS.spacing.xs }} />
            <Skeleton height={14} width="40%" />
          </div>
        </div>
        <Skeleton height={12} style={{ marginTop: DESIGN_TOKENS.spacing.md }} />
        <Skeleton height={12} width="80%" />
        <Skeleton height={12} width="60%" />
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: DESIGN_TOKENS.spacing.sm }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        display: 'flex',
        gap: DESIGN_TOKENS.spacing.sm,
        alignItems: 'center',
        padding: DESIGN_TOKENS.spacing.sm,
      }}>
        <Skeleton variant="circular" width={32} />
        <Skeleton height={14} width="60%" />
      </div>
    ))}
  </div>
);