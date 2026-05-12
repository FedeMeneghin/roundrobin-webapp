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
};

const GENRES = ['Romanzo', 'Saggio', 'Racconto', 'Poesia', 'Graphic novel', 'Altro'];
const GENDERS = ['M', 'F', 'Non binario', 'Sconosciuto'];

export default function Proposals({ isCapitano, currentMember, source }) {
  // source: 'library' | 'user'
  const isLibrary = source === 'library';

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [authorLocked, setAuthorLocked] = useState(false);

  const emptyForm = {
    title: '', publisher: '', publication_year: '', genre: 'Romanzo',
    author_name: '', author_gender: 'Sconosciuto', author_nationality: '', author_id: null,
  };
  const [form, setForm] = useState(emptyForm);
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => { fetchProposals(); }, [source]);

  async function fetchProposals() {
    setLoading(true);
    const { data, error } = await supabase
      .from('proposals')
      .select(`*, books(*, authors(name, gender, nationality)), members(name)`)
      .eq('source', source)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setProposals(data);
    setLoading(false);
  }

  async function searchAuthors(query) {
    if (query.length < 2) { setAuthorSuggestions([]); return; }
    const { data } = await supabase.from('authors').select('id, name, gender, nationality').ilike('name', `%${query}%`).limit(5);
    setAuthorSuggestions(data || []);
  }

  function selectAuthor(author) {
    setForm(prev => ({ ...prev, author_name: author.name, author_gender: author.gender, author_nationality: author.nationality || '', author_id: author.id }));
    setAuthorSuggestions([]);
    setAuthorLocked(true);
  }

  function clearAuthor() {
    setForm(prev => ({ ...prev, author_name: '', author_gender: 'Sconosciuto', author_nationality: '', author_id: null }));
    setAuthorLocked(false);
  }

  async function addProposal() {
    if (!form.title || !form.author_name) return;
    if (!isLibrary && !currentMember) return alert('Seleziona prima il tuo nome nella sezione Pirati!');

    // 1. Crea autore se non esiste
    let authorId = form.author_id || null;
    if (!authorId) {
      const { data: newAuthor, error: authorError } = await supabase
        .from('authors')
        .insert({ name: form.author_name.trim(), gender: form.author_gender, nationality: form.author_nationality || null })
        .select('id').single();
      if (authorError) { setError(authorError.message); return; }
      authorId = newAuthor.id;
    }

    // 2. Crea libro nel backlog
    const { data: newBook, error: bookError } = await supabase
      .from('books')
      .insert({ title: form.title.trim(), author_id: authorId, genre: form.genre, publisher: form.publisher || null, publication_year: form.publication_year ? parseInt(form.publication_year) : null, status: 'backlog' })
      .select('id').single();
    if (bookError) { setError(bookError.message); return; }

    // 3. Crea proposta
    const { error: proposalError } = await supabase.from('proposals').insert({
      book_id: newBook.id,
      proposed_by: isLibrary ? null : currentMember.id,
      source,
    });
    if (proposalError) { setError(proposalError.message); return; }

    setForm(emptyForm);
    setAuthorLocked(false);
    setShowAdd(false);
    fetchProposals();
  }

  async function removeProposal(proposalId, bookId) {
    if (!window.confirm('Rimuovere questa proposta?')) return;
    await supabase.from('proposals').delete().eq('id', proposalId);
    await supabase.from('books').delete().eq('id', bookId);
    fetchProposals();
  }

  if (loading) return <p style={{ padding: '2rem', color: palette.muted }}>Caricamento proposte...</p>;

  // Chi può aggiungere proposte
  const canAdd = isLibrary ? isCapitano : !!currentMember;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ color: palette.muted, fontSize: '0.9rem' }}>
          {proposals.length} {proposals.length === 1 ? 'proposta' : 'proposte'}
        </div>
        {canAdd && (
          <button onClick={() => setShowAdd(!showAdd)} style={{ background: palette.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            {showAdd ? 'Annulla' : '+ Proponi libro'}
          </button>
        )}
        {!canAdd && !isLibrary && (
          <span style={{ color: palette.muted, fontSize: '0.85rem' }}>Seleziona il tuo nome in Pirati per proporre un libro</span>
        )}
        {!canAdd && isLibrary && (
          <span style={{ color: palette.muted, fontSize: '0.85rem' }}>Solo il Capitano può aggiungere proposte della libreria</span>
        )}
      </div>

      {error && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

      {/* Form */}
      {showAdd && (
        <div style={{ background: palette.beige, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 'bold', color: palette.accent, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>📖 Nuovo libro</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <input style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: '#fff', gridColumn: '1/-1' }} placeholder="Titolo *" value={form.title} onChange={e => f('title', e.target.value)} />
            <input style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: '#fff' }} placeholder="Casa editrice" value={form.publisher} onChange={e => f('publisher', e.target.value)} />
            <input style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: '#fff' }} placeholder="Anno pubblicazione" type="number" value={form.publication_year} onChange={e => f('publication_year', e.target.value)} />
            <select style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: '#fff', gridColumn: '1/-1' }} value={form.genre} onChange={e => f('genre', e.target.value)}>
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ fontWeight: 'bold', color: palette.accent, margin: '1rem 0 0.5rem', fontFamily: 'Georgia, serif' }}>✍️ Autore/Autrice</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <div style={{ gridColumn: '1/-1', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: authorLocked ? palette.accentLight : '#fff', flex: 1 }}
                  placeholder="Nome autore/autrice *"
                  value={form.author_name}
                  disabled={authorLocked}
                  onChange={e => { f('author_name', e.target.value); searchAuthors(e.target.value); }}
                />
                {authorLocked && (
                  <button onClick={clearAuthor} style={{ background: 'transparent', border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem 0.8rem', cursor: 'pointer', color: palette.muted, fontSize: '0.85rem' }}>✕ Cambia</button>
                )}
              </div>
              {authorSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: `1px solid ${palette.border}`, borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {authorSuggestions.map(a => (
                    <div key={a.id} onClick={() => selectAuthor(a)}
                      style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: `1px solid ${palette.border}`, fontSize: '0.9rem' }}
                      onMouseEnter={e => e.currentTarget.style.background = palette.accentLight}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      {a.name} <span style={{ color: palette.muted, fontSize: '0.8rem' }}>· {a.gender} · {a.nationality || '?'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!authorLocked && (
              <>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: '0.8rem', color: palette.muted, display: 'block', marginBottom: '0.3rem' }}>Genere dell'autore/autrice</label>
                  <select style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: '#fff', width: '100%' }} value={form.author_gender} onChange={e => f('author_gender', e.target.value)}>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <input style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: '#fff', gridColumn: '1/-1' }} placeholder="Nazionalità" value={form.author_nationality} onChange={e => f('author_nationality', e.target.value)} />
              </>
            )}
          </div>
          <button onClick={addProposal} style={{ marginTop: '1rem', background: palette.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            Salva proposta
          </button>
        </div>
      )}

      {/* Lista proposte */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
        {proposals.length === 0 && <p style={{ color: palette.muted }}>Nessuna proposta ancora.</p>}
        {proposals.map(p => {
          const book = p.books;
          return (
            <div key={p.id} style={{ background: palette.card, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontWeight: 'bold', fontFamily: 'Georgia, serif', fontSize: '1rem' }}>{book?.title}</div>
              <div style={{ color: palette.muted, fontSize: '0.85rem' }}>{book?.authors?.name} · {book?.publication_year || '?'}</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {book?.genre && <span style={{ background: palette.accentLight, color: palette.accent, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem' }}>{book.genre}</span>}
                {book?.authors?.gender && <span style={{ background: palette.beige, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', color: palette.muted }}>{book.authors.gender}</span>}
                {book?.authors?.nationality && <span style={{ background: palette.beige, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', color: palette.muted }}>{book.authors.nationality}</span>}
              </div>
              {book?.publisher && <div style={{ fontSize: '0.8rem', color: palette.muted }}>🏠 {book.publisher}</div>}
              {!isLibrary && p.members && <div style={{ fontSize: '0.8rem', color: palette.muted }}>🏴‍☠️ Proposto da {p.members.name}</div>}
              <div style={{ fontSize: '0.8rem', color: palette.muted }}>📅 {new Date(p.created_at).toLocaleDateString('it-IT')}</div>

              {isCapitano && (
                <button onClick={() => removeProposal(p.id, book?.id)} style={{ marginTop: '0.5rem', background: 'transparent', border: `1px solid #e07070`, color: '#e07070', borderRadius: '8px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.75rem', alignSelf: 'flex-end' }}>
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