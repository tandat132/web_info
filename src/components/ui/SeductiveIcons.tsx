import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const HeartIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

export const FireIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
  </svg>
);

export const DiamondIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M6 2l2 6h8l2-6H6zm-1.5 7L12 22l7.5-13h-15zM8.5 4h7l-1 3h-5l-1-3z"/>
  </svg>
);

export const WineIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M6 3l0 6c0 2.97 2.16 5.43 5 5.91V19H8v2h8v-2h-3v-4.09c2.84-.48 5-2.94 5-5.91l0-6H6zm2 2h8v3H8V5z"/>
  </svg>
);

export const RoseIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4C6 13.5 5 15.5 5 18c0 2.5 2 4.5 4.5 4.5S14 20.5 14 18c0-2.5-1-4.5-2.5-6 1-.5 1.5-2 1.5-4 0-3.5-2.5-6-6-6zm0 8c-1.5 0-3-1.5-3-3s1.5-3 3-3 3 1.5 3 3-1.5 3-3 3z"/>
  </svg>
);

export const LipsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 8C8 8 5 10.5 5 13.5c0 2 1.5 3.5 3.5 3.5 1 0 2-.5 2.5-1.5.5 1 1.5 1.5 2.5 1.5 2 0 3.5-1.5 3.5-3.5C17 10.5 16 8 12 8zm-3.5 7C7.5 15 7 14.5 7 13.5S7.5 12 8.5 12s1.5.5 1.5 1.5S9.5 15 8.5 15zm7 0c-1 0-1.5-.5-1.5-1.5s.5-1.5 1.5-1.5 1.5.5 1.5 1.5-.5 1.5-1.5 1.5z"/>
  </svg>
);

export const GemIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M5 16L3 5h5.5l2 3h3L15.5 5H21l-2 11H5zm2.5-7L9 7H7l.5 2zm7 0L15 7h-2l1.5 2z"/>
  </svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 2l2.09 6.26L20 10.27l-5.91 2.01L12 18.54l-2.09-6.26L4 10.27l5.91-2.01L12 2z"/>
  </svg>
);