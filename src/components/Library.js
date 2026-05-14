import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { color, font, text, space, radius, shadow, heading, btn, badge } from '../theme';

function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: '3px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          style={{ cursor: onChange ? 'pointer' : 'default', fontSize: '1rem', color: (hover || value) >= i ? color.gold : color.border, transition: 'color 0.1s' }}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(i)}>
          ★
        </span>
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
      .select('*, authors(name, gender, nationality), book_ratings(member_id, has_read, rating)')
      .eq('status', filter)
      .order('selected_date', { ascending: false });
    if (error) setError(error.message);
    else setBooks(data);
    setLoading(false);
  }

  async function rateBook(bookId, rating, hasRead) {
    if (!currentMember) return alert('Seleziona prima il tuo nome!');
    const { error } = await supabase.from('book_ratings').upsert({
      book_id: bookId, member_id: currentMember.id,
      has_read: hasRead, rating: hasRead ? rating : null,
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

  const filters = [
    { id: 'completed', label: '📚 Letti' },
    { id: 'active',    label: '📖 In lettura' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
      <style>{`
        .rr-book-card:hover {
          box-shadow: 0 8px 28px rgba(18,43,38,0.11) !important;
          transform: translateY(-2px);
        }
        .rr-book-card { transition: all 0.18s ease; }
      `}</style>

      {/* Filtro tabs */}
      <div style={{ display: 'flex', gap: space[2] }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            background: filter === f.id ? color.primary : color.surface,
            color: filter === f.id ? '#fff' : color.textSoft,
            border: `1.5px solid ${filter === f.id ? color.primary : color.border}`,
            borderRadius: radius.pill,
            padding: `${space[2]} ${space[5]}`,
            cursor: 'pointer',
            fontSize: text.sm,
            fontWeight: '700',
            fontFamily: font.body,
            transition: 'all 0.15s ease',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {error && <div style={{ color: color.danger, fontSize: text.sm, fontFamily: font.body }}>{error}</div>}

      {/* Lista libri */}
      {loading ? (
        <div style={{ color: color.muted, fontSize: text.sm, fontFamily: font.body, padding: space[4] }}>
          Caricamento libreria...
        </div>
      ) : books.length === 0 ? (
        <div style={{
          background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm,
          border: `1px solid ${color.border}`, padding: `${space[10]} ${space[6]}`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: space[3] }}>📭</div>
          <div style={{ color: color.muted, fontFamily: font.body, fontSize: text.md }}>
            {filter === 'completed' ? 'Nessun libro letto ancora.' : 'Nessun libro in lettura al momento.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: space[4] }}>
          {books.map(book => {
            const myRating = getMyRating(book);
            const avgRating = getAvgRating(book);
            return (
              <div key={book.id} className="rr-book-card" style={{
                background: color.surface,
                border: `1px solid ${color.border}`,
                borderRadius: radius.md,
                boxShadow: shadow.xs,
                padding: space[5],
                display: 'flex', flexDirection: 'column', gap: space[3],
              }}>
                {/* Copertina (se disponibile) */}
                {book.cover_url && (
                  <img src={book.cover_url} alt={book.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: radius.sm }}
                    loading="lazy"
                  />
                )}

                {/* Titolo e autore */}
                <div>
                  <div style={{ fontFamily: font.heading, fontWeight: '700', fontSize: text.lg, color: color.text, lineHeight: 1.3, marginBottom: space[1] }}>
                    {book.title}
                  </div>
                  <div style={{ color: color.textSoft, fontSize: text.sm, fontFamily: font.body }}>
                    {book.authors?.name}
                    {book.publication_year ? ` · ${book.publication_year}` : ''}
                  </div>
                </div>

                {/* Badge */}
                <div style={{ display: 'flex', gap: space[2], flexWrap: 'wrap' }}>
                  {book.genre && <span style={badge(color.primarySoft, color.primaryDark)}>{book.genre}</span>}
                  {book.authors?.gender && <span style={badge(color.bgSoft, color.textSoft)}>{book.authors.gender}</span>}
                  {book.authors?.nationality && <span style={badge(color.bgSoft, color.textSoft)}>{book.authors.nationality}</span>}
                </div>

                {/* Info extra */}
                {book.publisher && (
                  <div style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>
                    🏠 {book.publisher}
                  </div>
                )}
                {book.selected_date && (
                  <div style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>
                    📅 {new Date(book.selected_date).toLocaleDateString('it-IT')}
                  </div>
                )}

                {/* Media club */}
                {avgRating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: space[2], fontSize: text.sm, color: color.textSoft, fontFamily: font.body }}>
                    <Stars value={Math.round(avgRating)} />
                    <span style={{ fontWeight: '600', color: color.gold }}>{avgRating}</span>
                    <span style={{ color: color.muted }}>media club</span>
                  </div>
                )}

                {/* Voto personale */}
                {currentMember && (
                  <div style={{ borderTop: `1px solid ${color.border}`, paddingTop: space[3], display: 'flex', flexDirection: 'column', gap: space[2] }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: space[2], fontSize: text.sm, cursor: 'pointer', fontFamily: font.body, color: color.textSoft }}>
                      <input type="checkbox" checked={myRating?.has_read || false}
                        onChange={e => rateBook(book.id, myRating?.rating || null, e.target.checked)}
                        style={{ accentColor: color.primary, width: '15px', height: '15px' }}
                      />
                      L'ho letto
                    </label>
                    {myRating?.has_read && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: space[2] }}>
                        <span style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>Il tuo voto:</span>
                        <Stars value={myRating?.rating || 0} onChange={v => rateBook(book.id, v, true)} />
                      </div>
                    )}
                  </div>
                )}

                {/* Rimuovi — solo Capitano */}
                {isCapitano && (
                  <button onClick={() => removeBook(book.id)} style={{
                    ...btn.danger, alignSelf: 'flex-end', marginTop: space[1],
                  }}>
                    Rimuovi
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}