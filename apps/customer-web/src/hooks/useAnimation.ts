import { useEffect, useState } from 'react';

/**
 * Hook to handle enter animations (fade in, slide up, etc.)
 * @param {boolean} show - Whether the element should be visible
 * @param {string} type - Type of animation ('fade', 'slide-up', 'slide-down', 'zoom')
 * @param {number} duration - Animation duration in milliseconds
 * @returns {Object} Animated style object
 */
export const useEnterAnimation = (show: boolean, type = 'fade', duration = 300) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      // Trigger animation after a slight delay to ensure element is mounted
      const timer = setTimeout(() => setAnimate(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [show]);

  const baseStyle = {
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    opacity: animate ? 1 : 0,
  };

  switch (type) {
    case 'slide-up':
      return {
        ...baseStyle,
        transform: animate ? 'translateY(0)' : 'translateY(20px)',
      };
    case 'slide-down':
      return {
        ...baseStyle,
        transform: animate ? 'translateY(0)' : 'translateY(-20px)',
      };
    case 'zoom':
      return {
        ...baseStyle,
        transform: animate ? 'scale(1)' : 'scale(0.95)',
      };
    case 'fade':
    default:
      return baseStyle;
  }
};

/**
 * Hook to handle hover animations with reduced motion support
 * @param {boolean} prefersReducedMotion - Whether user prefers reduced motion
 * @returns {Object} Hover style object
 */
export const useHoverAnimation = (prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) {
    return {};
  }

  return {
    ':hover:not(:active):not([disabled])': {
      opacity: 0.9,
      transform: 'translateY(-2px)',
    },
    ':active:not([disabled])': {
      transform: 'translateY(0)',
    },
  };
};