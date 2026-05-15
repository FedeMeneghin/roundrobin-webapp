import React from 'react';
import { color, font, text, space } from '../theme';

/**
 * Generic labelled field wrapper.
 * Renders a column with a small label above the children.
 */
export default function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[1] }}>
      {label && (
        <label style={{
          fontSize: text.xs,
          color: color.textSoft,
          fontFamily: font.body,
          fontWeight: '600',
        }}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
