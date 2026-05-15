import React from 'react';
import { color, font, text, space, radius, shadow, btn, badge } from '../../theme';
import Badge from '../../ui/Badge';

/**
 * Single proposal card.
 * Capitano actions (libro del mese, sposta, rimuovi) fire callbacks.
 */
export default function ProposalCard({ p, isLibrary, isCapitano, onSetBookOfMonth, onPromote, onRemove }) {
  const book = p.books;
  if (!book) return null;

  return (
    <div
      className="rr-proposal-card"
      style={{
        background:   color.surface,
        border:       `1px solid ${color.border}`,
        borderRadius: radius.md,
        boxShadow:    shadow.xs,
        padding:      space[5],
        display:      'flex', flexDirection: 'column', gap: space[3],
      }}
    >
      {book.cover_url && (
        <img
          src={book.cover_url}
          alt={book.title}
          style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: radius.sm }}
          loading="lazy"
        />
      )}

      <div>
        <div style={{ fontFamily: font.heading, fontWeight: '700', fontSize: text.lg, color: color.text, lineHeight: 1.3, marginBottom: space[1] }}>
          {book.title}
        </div>
        <div style={{ color: color.textSoft, fontSize: text.sm, fontFamily: font.body }}>
          {book.authors?.name}{book.publication_year ? ` · ${book.publication_year}` : ''}
        </div>
      </div>

      <div style={{ display: 'flex', gap: space[2], flexWrap: 'wrap' }}>
        {book.genre               && <Badge bg={color.primarySoft} fg={color.primaryDark}>{book.genre}</Badge>}
        {book.authors?.nationality && <Badge bg={color.bgSoft}      fg={color.textSoft}>{book.authors.nationality}</Badge>}
      </div>

      {!isLibrary && p.members?.name && (
        <div style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>
          Proposto da <strong style={{ color: color.textSoft }}>{p.members.name}</strong>
        </div>
      )}

      {isCapitano && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[2], borderTop: `1px solid ${color.border}`, paddingTop: space[3] }}>
          <button onClick={() => onSetBookOfMonth(p.id, book.id, book.title)} style={{ ...btn.primary, fontSize: text.xs }}>
            ⭐ Libro del mese
          </button>
          <div style={{ display: 'flex', gap: space[2] }}>
            <button onClick={() => onPromote(p.id, book.id)} style={{ ...btn.secondary, fontSize: text.xs, flex: 1 }}>
              ✅ Sposta in libreria
            </button>
            <button onClick={() => onRemove(p.id, book.id)} style={{ ...btn.danger, fontSize: text.xs }}>
              Rimuovi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
