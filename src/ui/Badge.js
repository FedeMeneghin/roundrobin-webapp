import React from 'react';
import { badge } from '../theme';

/**
 * Thin wrapper around the `badge()` theme helper.
 * Accepts `bg` / `fg` theme color values directly.
 */
export default function Badge({ bg, fg, children, style }) {
  return (
    <span style={{ ...badge(bg, fg), ...style }}>
      {children}
    </span>
  );
}
