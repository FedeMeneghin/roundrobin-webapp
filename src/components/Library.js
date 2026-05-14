import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const palette = {
  bg: '#faf8f4',
  card: '#ffffff',
  accent: '#7a9e7e',
  accentLight: '#e8f0e9',
  muted: '#888',
  border: '#e8e4de',
  beige: '#f2ece2',
  gold: '#c9a84c',
};

function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          style={{ cursor: onChange ? 'pointer' : 'default', fontSize: '1.1rem', color: (hover || value) >= i ? palette.gold : '#ddd' }}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(i)}
        >★</span>
      ))}
    </span>
  );
}

export default function Library({ isCapitano, currentMember }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('completed');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchBooks(); }, [filter]);

  async function fetchBooks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select(`*, authors(name, gender, nationality), book_ratings(member_id, has_read, rating)`)
      .eq('status', filter)
      .order('selected_date', { ascending: false });
    if (error) setError(error.message);
    else setBooks(data);
    setLoading(false);
  }

  async function rateBook(bookId, rating, hasRead) {
    if (!currentMember) return alert('Seleziona prima il tuo nome nella sezione Pirati!');
    const { error } = await supabase.from('book_ratings').upsert({
      book_id: bookId,
      member_id: currentMember.id,
      has_read: hasRead,
      rating: hasRead ? rating : null,
    }, { onConflict: 'book_id,member_id' });
    if (error) setError(error.message);
    else fetchBooks();
  }

  async function removeBook(id) {
    if (!window.confirm('Rimuovere questo libro dalla libreria?')) return;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchBooks();
  }

  function getMyRating(book) {
    if (!currentMember) return null;
    return book.book_ratings?.find(r => r.member_id === currentMember.id);
  }

  function getAvgRating(book) {
    const rated = book.book_ratings?.filter(r => r.rating);
    if (!rated?.length) return null;
    return (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(1);
  }

  if (loading) return <p style={{ padding: '2rem', color: palette.muted }}>Caricamento libreria...</p>;

  return (
    <div>
      {/* Filtro */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[{ id: 'completed', label: '📚 Letti' }, { id: 'active', label: '📖 In lettura' }].map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)} style={{ background: filter === s.id ? palette.accent : 'transparent', color: filter === s.id ? '#fff' : palette.muted, border: `1px solid ${filter === s.id ? palette.accent : palette.border}`, borderRadius: '20px', padding: '0.3rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            {s.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

      {/* Lista libri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {books.length === 0 && (
          <p style={{ color: palette.muted }}>
            {filter === 'completed' ? 'Nessun libro letto ancora.' : 'Nessun libro in lettura al momento.'}
          </p>
        )}
        {books.map(book => {
          const myRating = getMyRating(book);
          const avgRating = getAvgRating(book);
          return (
            <div key={book.id} style={{ background: palette.card, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontWeight: 'bold', fontFamily: 'Georgia, serif', fontSize: '1rem' }}>{book.title}</div>
              <div style={{ color: palette.muted, fontSize: '0.85rem' }}>{book.authors?.name} · {book.publication_year || '?'}</div>

              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {book.genre && <span style={{ background: palette.accentLight, color: palette.accent, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem' }}>{book.genre}</span>}
                {book.authors?.gender && <span style={{ background: palette.beige, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', color: palette.muted }}>{book.authors.gender}</span>}
                {book.authors?.nationality && <span style={{ background: palette.beige, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', color: palette.muted }}>{book.authors.nationality}</span>}
              </div>

              {book.publisher && <div style={{ fontSize: '0.8rem', color: palette.muted }}>🏠 {book.publisher}</div>}
              {book.selected_date && <div style={{ fontSize: '0.8rem', color: palette.muted }}>📅 Scelto il {new Date(book.selected_date).toLocaleDateString('it-IT')}</div>}

              {avgRating && (
                <div style={{ fontSize: '0.85rem', color: palette.muted }}>
                  Media club: <Stars value={Math.round(avgRating)} /> ({avgRating})
                </div>
              )}

              {/* Voto personale */}
              {currentMember && (
                <div style={{ marginTop: '0.4rem', borderTop: `1px solid ${palette.border}`, paddingTop: '0.6rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={myRating?.has_read || false}
                      onChange={e => rateBook(book.id, myRating?.rating || null, e.target.checked)} />
                    L'ho letto
                  </label>
                  {myRating?.has_read && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <Stars value={myRating?.rating || 0} onChange={v => rateBook(book.id, v, true)} />
                    </div>
                  )}
                </div>
              )}

              {isCapitano && (
                <button onClick={() => removeBook(book.id)} style={{ marginTop: '0.5rem', background: 'transparent', border: `1px solid #e07070`, color: '#e07070', borderRadius: '8px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.75rem', alignSelf: 'flex-end' }}>
                  Rimuovi
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}