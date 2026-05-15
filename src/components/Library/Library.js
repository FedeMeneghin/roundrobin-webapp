import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { color, font, text, space, radius, shadow } from '../../theme';
import { useBooks } from '../../hooks/useSupabase';
import BookCard from './BookCard';

const FILTERS = [
  { id: 'active',    label: '📖 In lettura' },
  { id: 'completed', label: '📚 Letti'      },
];

export default function Library({ isCapitano, currentMember }) {
  const [filter, setFilter] = useState('active');
  const { data: books, loading, error: fetchError, refetch } = useBooks(filter);
  const [error, setError] = useState(null);

  async function rateBook(bookId, rating, hasRead) {
    if (!currentMember) return alert('Seleziona prima il tuo nome!');
    const { error: err } = await supabase.from('book_ratings').upsert({
      book_id: bookId, member_id: currentMember.id,
      has_read: hasRead, rating: hasRead ? rating : null,
    }, { onConflict: 'book_id,member_id' });
    if (err) setError(err.message);
    else refetch();
  }

  async function removeBook(id) {
    if (!window.confirm('Rimuovere questo libro dalla libreria?')) return;
    const { error: err } = await supabase.from('books').delete().eq('id', id);
    if (err) setError(err.message);
    else refetch();
  }

  async function markAsRead(bookId, bookTitle) {
    const confirmed = window.confirm(`Segnare "${bookTitle}" come letto e spostarlo nell'archivio?`);
    if (!confirmed) return;
    const { error: err } = await supabase
      .from('books')
      .update({ status: 'completed', selected_date: new Date().toISOString().slice(0, 10) })
      .eq('id', bookId);
    if (err) setError(err.message);
    else refetch();
  }

  const displayError = error || fetchError;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
      <style>{`
        .rr-book-card:hover { box-shadow: 0 8px 28px rgba(18,43,38,0.11) !important; transform: translateY(-2px); }
        .rr-book-card { transition: all 0.18s ease; }
      `}</style>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: space[2] }}>
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            style={{
              background:   filter === id ? color.primary : color.surface,
              color:        filter === id ? '#fff' : color.textSoft,
              border:       `1.5px solid ${filter === id ? color.primary : color.border}`,
              borderRadius: '9999px',
              padding:      `${space[2]} ${space[5]}`,
              cursor:       'pointer',
              fontSize:     text.sm,
              fontWeight:   '700',
              fontFamily:   font.body,
              transition:   'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {displayError && (
        <div style={{ color: color.danger, fontSize: text.sm, fontFamily: font.body }}>{displayError}</div>
      )}

      {loading ? (
        <div style={{ color: color.muted, fontSize: text.sm, fontFamily: font.body, padding: space[4] }}>Caricamento libreria...</div>
      ) : !books?.length ? (
        <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: `${space[10]} ${space[6]}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: space[3] }}>📭</div>
          <div style={{ color: color.muted, fontFamily: font.body, fontSize: text.md }}>
            {filter === 'completed' ? 'Nessun libro letto ancora.' : 'Nessun libro in lettura al momento.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: space[4] }}>
          {books.map(book => (
            <BookCard
              key={book.id}
              book={book}
              currentMember={currentMember}
              isCapitano={isCapitano}
              onRate={rateBook}
              onRemove={removeBook}
              onMarkRead={filter === 'active' ? markAsRead : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}