import React, { useState } from 'react';
import { color } from '../theme';

/**
 * Star rating widget.
 * - When `onChange` is provided it is interactive (picker mode).
 * - When `onChange` is omitted it is read-only (display mode).
 */
export default function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          style={{
            cursor:     onChange ? 'pointer' : 'default',
            fontSize:   '1rem',
            color:      (hover || value) >= i ? color.gold : color.border,
            transition: 'color 0.1s',
          }}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={()     => onChange && onChange(i)}
        >
          ★
        </span>
      ))}
    </span>
  );
}
