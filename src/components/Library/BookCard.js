import React from 'react';
import { color, font, text, space, radius, shadow, btn } from '../../theme';
import Stars from '../../ui/Stars';
import Badge from '../../ui/Badge';

/**
 * Single book card for the Library view.
 * Handles display, personal rating, and Capitano actions.
 */
export default function BookCard({ book, currentMember, isCapitano, onRate, onRemove }) {
  const myRating = currentMember
    ? book.book_ratings?.find(r => r.member_id === currentMember.id)
    : null;

  const rated = book.book_ratings?.filter(r => r.rating);
  const avgRating = rated?.length
    ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1)
    : null;

  return (
    <div
      className="rr-book-card"
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
          style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: radius.sm }}
          loading="lazy"
        />
      )}

      {/* Title + author */}
      <div>
        <div style={{ fontFamily: font.heading, fontWeight: '700', fontSize: text.lg, color: color.text, lineHeight: 1.3, marginBottom: space[1] }}>
          {book.title}
        </div>
        <div style={{ color: color.textSoft, fontSize: text.sm, fontFamily: font.body }}>
          {book.authors?.name}
          {book.publication_year ? ` · ${book.publication_year}` : ''}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: space[2], flexWrap: 'wrap' }}>
        {book.genre            && <Badge bg={color.primarySoft} fg={color.primaryDark}>{book.genre}</Badge>}
        {book.authors?.gender  && <Badge bg={color.bgSoft}      fg={color.textSoft}>{book.authors.gender}</Badge>}
        {book.authors?.nationality && <Badge bg={color.bgSoft}  fg={color.textSoft}>{book.authors.nationality}</Badge>}
      </div>

      {book.publisher    && <div style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>🏠 {book.publisher}</div>}
      {book.selected_date && <div style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>📅 {new Date(book.selected_date).toLocaleDateString('it-IT')}</div>}

      {/* Club average */}
      {avgRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: space[2], fontSize: text.sm, color: color.textSoft, fontFamily: font.body }}>
          <Stars value={Math.round(avgRating)} />
          <span style={{ fontWeight: '600', color: color.gold }}>{avgRating}</span>
          <span style={{ color: color.muted }}>media club</span>
        </div>
      )}

      {/* Personal rating */}
      {currentMember && (
        <div style={{ borderTop: `1px solid ${color.border}`, paddingTop: space[3], display: 'flex', flexDirection: 'column', gap: space[2] }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: space[2], fontSize: text.sm, cursor: 'pointer', fontFamily: font.body, color: color.textSoft }}>
            <input
              type="checkbox"
              checked={myRating?.has_read || false}
              onChange={e => onRate(book.id, myRating?.rating || null, e.target.checked)}
              style={{ accentColor: color.primary, width: '15px', height: '15px' }}
            />
            L'ho letto
          </label>
          {myRating?.has_read && (
            <div style={{ display: 'flex', alignItems: 'center', gap: space[2] }}>
              <span style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>Il tuo voto:</span>
              <Stars value={myRating?.rating || 0} onChange={v => onRate(book.id, v, true)} />
            </div>
          )}
        </div>
      )}

      {isCapitano && (
        <button onClick={() => onRemove(book.id)} style={{ ...btn.danger, alignSelf: 'flex-end', marginTop: space[1] }}>
          Rimuovi
        </button>
      )}
    </div>
  );
}
