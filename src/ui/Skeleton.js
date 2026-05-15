import React from 'react';
import { color, radius } from '../theme';

const shimmer = `
  @keyframes rr-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  .rr-skeleton {
    background: linear-gradient(
      90deg,
      ${color.bgSoft} 25%,
      ${color.border}  50%,
      ${color.bgSoft} 75%
    );
    background-size: 200% 100%;
    animation: rr-shimmer 1.5s ease-in-out infinite;
    border-radius: ${radius.sm};
  }
  @media (prefers-reduced-motion: reduce) {
    .rr-skeleton { animation: none; }
  }
`;

/**
 * A single shimmer skeleton block.
 * Pass `style` to control width / height / shape.
 */
export default function Skeleton({ style }) {
  return (
    <>
      <style>{shimmer}</style>
      <div className="rr-skeleton" style={style} />
    </>
  );
}

/** Convenience: a text line skeleton (1em tall, optional width). */
export function SkeletonText({ width = '100%' }) {
  return <Skeleton style={{ height: '1em', width, marginBottom: '0.25rem' }} />;
}

/** Convenience: a card-sized skeleton block. */
export function SkeletonCard({ height = 200 }) {
  return <Skeleton style={{ height, width: '100%', borderRadius: radius.md }} />;
}
