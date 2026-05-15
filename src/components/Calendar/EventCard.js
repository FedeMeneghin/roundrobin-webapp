import React from 'react';
import { color, font, text, space, radius, shadow, btn, badge } from '../../theme';
import { formatDate, downloadICS } from '../../utils/formatters';

const TYPE = {
  ufficiale: {
    label:  '⚓ Ufficiale',
    bg:     color.primarySoft,
    fg:     color.primaryDark,
    border: color.primary,
    dateBg: color.primary,
    dateFg: '#fff',
  },
  vario: {
    label:  '🗺️ Vario',
    bg:     color.warningSoft,
    fg:     '#7a4f00',
    border: color.warning,
    dateBg: color.bgSoft,
    dateFg: color.textSoft,
  },
};

/**
 * Single calendar event card.
 * `onEdit` / `onRemove` are only called when the user is Capitano.
 */
export default function EventCard({ e, isPast, isCapitano, onEdit, onRemove }) {
  const t = TYPE[e.type] || TYPE.ufficiale;

  return (
    <div style={{
      background:   isPast ? color.bgSoft : color.surface,
      border:       `1px solid ${isPast ? color.border : t.border}`,
      borderRadius: radius.md,
      boxShadow:    isPast ? 'none' : shadow.sm,
      padding:      space[5],
      display:      'flex', flexDirection: 'column', gap: space[3],
      opacity:      isPast ? 0.70 : 1,
      transition:   'all 0.18s ease',
    }}>

      {/* Top row: date box + title + type badge */}
      <div style={{ display: 'flex', gap: space[3], alignItems: 'flex-start' }}>

        {/* Date box */}
        <div style={{
          background:   isPast ? color.bgSoft : t.dateBg,
          color:        isPast ? color.muted  : t.dateFg,
          border:       `1px solid ${isPast ? color.border : t.border}`,
          borderRadius: radius.sm,
          padding:      `${space[2]} ${space[3]}`,
          fontSize:     text.xs,
          fontWeight:   '700',
          fontFamily:   font.body,
          textAlign:    'center',
          minWidth:     '58px',
          flexShrink:   0,
          lineHeight:   1.3,
        }}>
          {new Date(e.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
          <div style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: '500', opacity: 0.8 }}>
            {new Date(e.date).getFullYear()}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: font.heading, fontWeight: '700', fontSize: text.lg, color: color.text, lineHeight: 1.2 }}>
            {e.title}
          </div>
          <div style={{ fontSize: text.xs, color: color.muted, marginTop: space[1], fontFamily: font.body, fontStyle: 'italic' }}>
            {formatDate(e.date)}
          </div>
        </div>

        <span style={{ ...badge(t.bg, t.fg), border: `1px solid ${t.border}`, flexShrink: 0, alignSelf: 'flex-start' }}>
          {t.label}
        </span>
      </div>

      {/* Location */}
      {e.location && (
        <div style={{ display: 'flex', alignItems: 'center', gap: space[2], fontSize: text.sm, color: color.textSoft, fontFamily: font.body }}>
        📍
          <a
            href={mapsUrl(e.location)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: color.primary, textDecoration: 'none', fontFamily: font.body }}
            onMouseEnter={ev => ev.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={ev => ev.currentTarget.style.textDecoration = 'none'}
          >
            {e.location}
          </a>
        </div>
)}

      {/* Notes */}
      {e.notes && (
        <div style={{ fontSize: text.sm, color: color.textSoft, fontFamily: font.body, background: color.bgSoft, borderRadius: radius.xs, padding: `${space[3]} ${space[4]}`, lineHeight: 1.6 }}>
          {e.notes}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: space[2], flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => downloadICS(e)} style={{ ...btn.ghost, fontSize: text.xs, padding: `${space[2]} ${space[3]}` }}>
          📅 Esporta .ics
        </button>
        {isCapitano && (
          <>
            <button onClick={() => onEdit(e)} style={{ ...btn.secondary, fontSize: text.xs, padding: `${space[2]} ${space[3]}` }}>
              ✏️ Modifica
            </button>
            <button onClick={() => onRemove(e.id)} style={{ ...btn.danger, fontSize: text.xs }}>
              Rimuovi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
