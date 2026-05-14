import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { color, font, text, space, radius, shadow, heading, btn, badge, input as inputStyle } from '../theme';

const GENRES  = ['Romanzo', 'Saggio', 'Racconto', 'Poesia', 'Graphic novel', 'Altro'];
const GENDERS = ['M', 'F', 'Non binario', 'Sconosciuto'];

async function searchOpenLibrary(query) {
  const isISBN = /^[\d-]{9,}$/.test(query.trim());
  let url;
  if (isISBN) {
    const isbn = query.replace(/-/g, '');
    url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  } else {
    url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6&fields=title,author_name,publisher,first_publish_year,isbn,cover_i,key`;
  }
  const res  = await fetch(url);
  const data = await res.json();
  if (isISBN) {
    const key  = `ISBN:${query.replace(/-/g, '')}`;
    const book = data[key];
    if (!book) return [];
    return [{ title: book.title, author: book.authors?.[0]?.name || '', publisher: book.publishers?.[0]?.name || '', year: book.publish_date ? parseInt(book.publish_date) : null, isbn: query.replace(/-/g,''), cover_url: book.cover?.large || book.cover?.medium || null }];
  } else {
    return (data.docs || []).map(d => ({ title: d.title, author: d.author_name?.[0] || '', publisher: d.publisher?.[0] || '', year: d.first_publish_year || null, isbn: d.isbn?.[0] || null, cover_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null }));
  }
}

export default function Proposals({ isCapitano, currentMember, source }) {
  const isLibrary  = source === 'library';
  const [proposals, setProposals]   = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState(null);
  const [showAdd,   setShowAdd]     = useState(false);

  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching,     setSearching]     = useState(false);
  const [bookSelected,  setBookSelected]  = useState(false);
  const searchTimeout = useRef(null);

  const emptyForm = { title:'', publisher:'', publication_year:'', genre:'Romanzo', isbn:'', cover_url:'', author_name:'', author_gender:'Sconosciuto', author_nationality:'', author_id:null };
  const [form,              setForm]             = useState(emptyForm);
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [authorLocked,      setAuthorLocked]      = useState(false);
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProposals(); }, [source]);

  async function fetchProposals() {
    setLoading(true);
    const { data, error } = await supabase
      .from('proposals')
      .select('id, source, proposed_by, books(id, title, genre, publisher, publication_year, isbn, cover_url, authors(name,gender,nationality)), members(name)')
      .eq('source', source)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setProposals(data || []);
    setLoading(false);
  }

  function handleSearchChange(val) {
    setSearchQuery(val);
    setBookSelected(false);
    clearTimeout(searchTimeout.current);
    if (val.length < 3) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchOpenLibrary(val);
      setSearchResults(results);
      setSearching(false);
    }, 500);
  }

  function selectFromSearch(r) {
    setForm(prev => ({ ...prev, title: r.title, publisher: r.publisher || '', publication_year: r.year || '', isbn: r.isbn || '', cover_url: r.cover_url || '', author_name: r.author || '' }));
    setSearchQuery(r.title);
    setSearchResults([]);
    setBookSelected(true);
  }

  async function searchAuthors(name) {
    if (name.length < 2) { setAuthorSuggestions([]); return; }
    const { data } = await supabase.from('authors').select('id,name,gender,nationality').ilike('name', `%${name}%`).limit(5);
    setAuthorSuggestions(data || []);
  }

  function selectAuthor(a) {
    setForm(prev => ({ ...prev, author_id: a.id, author_name: a.name, author_gender: a.gender || 'Sconosciuto', author_nationality: a.nationality || '' }));
    setAuthorSuggestions([]);
    setAuthorLocked(true);
  }

  function clearAuthor() {
    setForm(prev => ({ ...prev, author_id: null, author_name: '', author_gender: 'Sconosciuto', author_nationality: '' }));
    setAuthorLocked(false);
    setAuthorSuggestions([]);
  }

  function resetForm() {
    setForm(emptyForm); setSearchQuery(''); setSearchResults([]);
    setBookSelected(false); setAuthorSuggestions([]); setAuthorLocked(false);
  }

  async function submitProposal() {
    if (!form.title || !form.author_name) return;
    if (!isLibrary && !currentMember) return alert('Seleziona prima il tuo nome!');
    let authorId = form.author_id || null;
    if (!authorId) {
      const { data: newAuthor, error: aErr } = await supabase.from('authors').insert({ name: form.author_name.trim(), gender: form.author_gender, nationality: form.author_nationality || null }).select('id').single();
      if (aErr) { setError(aErr.message); return; }
      authorId = newAuthor.id;
    }
    const { data: newBook, error: bErr } = await supabase.from('books').insert({ title: form.title.trim(), author_id: authorId, genre: form.genre, publisher: form.publisher || null, publication_year: form.publication_year ? parseInt(form.publication_year) : null, isbn: form.isbn || null, cover_url: form.cover_url || null, status: 'backlog' }).select('id').single();
    if (bErr) { setError(bErr.message); return; }
    const { error: pErr } = await supabase.from('proposals').insert({ book_id: newBook.id, proposed_by: isLibrary ? null : currentMember.id, source });
    if (pErr) { setError(pErr.message); return; }
    resetForm(); setShowAdd(false); fetchProposals();
  }

  async function removeProposal(proposalId, bookId) {
    if (!window.confirm('Rimuovere questa proposta?')) return;
    await supabase.from('proposals').delete().eq('id', proposalId);
    await supabase.from('books').delete().eq('id', bookId);
    fetchProposals();
  }

  async function promoteToLibrary(proposalId, bookId) {
    if (!window.confirm('Spostare questo libro in libreria come completato?')) return;
    await supabase.from('books').update({ status: 'completed', selected_date: new Date().toISOString().slice(0,10) }).eq('id', bookId);
    await supabase.from('proposals').delete().eq('id', proposalId);
    fetchProposals();
  }

  const canAdd = isLibrary ? isCapitano : !!currentMember;

  const Field = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[1] }}>
      {label && <label style={{ fontSize: text.xs, color: color.textSoft, fontFamily: font.body, fontWeight: '600' }}>{label}</label>}
      {children}
    </div>
  );

  const fieldStyle = { ...inputStyle, fontSize: text.sm, padding: `${space[2]} ${space[3]}` };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
      <style>{`
        .rr-proposal-card:hover { box-shadow: 0 8px 28px rgba(18,43,38,0.11) !important; transform: translateY(-2px); }
        .rr-proposal-card { transition: all 0.18s ease; }
        .rr-search-row:hover { background: ${color.primarySoft} !important; }
        .rr-search-row { transition: background 0.12s ease; }
      `}</style>

      {/* Header + bottone aggiungi */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ ...heading.section }}>
          {isLibrary ? '🏛️ Proposte libreria' : '💬 Proposte pirati'}
          <span style={{ ...badge(color.bgSoft, color.textSoft), marginLeft: space[3], fontSize: text.xs }}>{proposals.length}</span>
        </div>
        {canAdd ? (
          <button onClick={() => { setShowAdd(!showAdd); resetForm(); }} style={{ ...btn.primary }}>
            {showAdd ? 'Annulla' : '+ Proponi'}
          </button>
        ) : (
          <span style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>
            {isLibrary ? 'Solo il Capitano può aggiungere' : 'Accedi per proporre'}
          </span>
        )}
      </div>

      {error && <div style={{ color: color.danger, fontSize: text.sm, fontFamily: font.body }}>{error}</div>}

      {/* ── FORM AGGIUNGI ── */}
      {showAdd && (
        <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: space[6] }}>
          <div style={{ ...heading.md, marginBottom: space[1] }}>📖 Proponi un libro</div>
          <div style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body, marginBottom: space[5] }}>
            {isCapitano ? '⚓ Andrà nelle proposte della libreria.' : '🏴‍☠️ Andrà nelle proposte dei pirati.'}
          </div>

          {/* Ricerca Open Library */}
          <Field label="🔍 Cerca per titolo o ISBN">
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...fieldStyle }}
                placeholder="Es. 'Il nome della rosa' oppure ISBN"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
              />
              {searching && (
                <div style={{ position: 'absolute', right: space[3], top: '50%', transform: 'translateY(-50%)', color: color.muted, fontSize: text.xs }}>
                  ⏳
                </div>
              )}
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.sm, zIndex: 20, boxShadow: shadow.md, maxHeight: '300px', overflowY: 'auto' }}>
                  {searchResults.map((r, i) => (
                    <div key={i} className="rr-search-row" onClick={() => selectFromSearch(r)}
                      style={{ padding: `${space[3]} ${space[4]}`, cursor: 'pointer', borderBottom: `1px solid ${color.border}`, display: 'flex', gap: space[3], alignItems: 'center' }}>
                      {r.cover_url
                        ? <img src={r.cover_url} alt="" style={{ width: 34, height: 50, objectFit: 'cover', borderRadius: radius.xs, flexShrink: 0 }} />
                        : <div style={{ width: 34, height: 50, background: color.bgSoft, borderRadius: radius.xs, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📚</div>
                      }
                      <div>
                        <div style={{ fontWeight: '600', fontSize: text.sm, fontFamily: font.body, color: color.text }}>{r.title}</div>
                        <div style={{ color: color.muted, fontSize: text.xs, fontFamily: font.body }}>{r.author}{r.year ? ` · ${r.year}` : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {bookSelected && (
              <div style={{ fontSize: text.xs, color: color.success, fontFamily: font.body, marginTop: space[1] }}>
                ✅ Dati compilati da Open Library — puoi modificarli se necessario.
              </div>
            )}
          </Field>

          {/* Preview copertina */}
          {form.cover_url && (
            <div style={{ display: 'flex', alignItems: 'center', gap: space[4], margin: `${space[4]} 0`, padding: space[4], background: color.bgSoft, borderRadius: radius.sm }}>
              <img src={form.cover_url} alt="Copertina" style={{ width: 52, height: 76, objectFit: 'cover', borderRadius: radius.xs, boxShadow: shadow.sm }} />
              <div>
                <div style={{ fontFamily: font.heading, fontWeight: '700', fontSize: text.md, color: color.text }}>{form.title}</div>
                <div style={{ color: color.textSoft, fontSize: text.sm, fontFamily: font.body }}>{form.author_name}</div>
              </div>
            </div>
          )}

          {/* Campi libro */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space[3], marginTop: space[4] }}>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Titolo *">
                <input style={fieldStyle} placeholder="Titolo del libro" value={form.title} onChange={e => f('title', e.target.value)} />
              </Field>
            </div>
            <Field label="Casa editrice">
              <input style={fieldStyle} placeholder="Editore" value={form.publisher} onChange={e => f('publisher', e.target.value)} />
            </Field>
            <Field label="Anno">
              <input style={fieldStyle} placeholder="2024" type="number" value={form.publication_year} onChange={e => f('publication_year', e.target.value)} />
            </Field>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Genere">
                <select style={{ ...fieldStyle }} value={form.genre} onChange={e => f('genre', e.target.value)}>
                  {GENRES.map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="ISBN">
                <input style={fieldStyle} placeholder="ISBN" value={form.isbn} onChange={e => f('isbn', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Autore */}
          <div style={{ borderTop: `1px solid ${color.border}`, margin: `${space[5]} 0 ${space[4]}`, paddingTop: space[4] }}>
            <div style={{ ...heading.md, marginBottom: space[3] }}>✍️ Autore/Autrice</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space[3] }}>
              <div style={{ gridColumn: '1/-1', position: 'relative' }}>
                <Field label="Nome autore *">
                  <div style={{ display: 'flex', gap: space[2] }}>
                    <input style={{ ...fieldStyle, flex: 1, background: authorLocked ? color.primarySoft : color.surface }}
                      placeholder="Nome autore/autrice" value={form.author_name} disabled={authorLocked}
                      onChange={e => { f('author_name', e.target.value); searchAuthors(e.target.value); }} />
                    {authorLocked && (
                      <button onClick={clearAuthor} style={{ ...btn.ghost, padding: `${space[2]} ${space[3]}`, fontSize: text.xs }}>✕ Cambia</button>
                    )}
                  </div>
                </Field>
                {authorSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.sm, zIndex: 10, boxShadow: shadow.md }}>
                    {authorSuggestions.map(a => (
                      <div key={a.id} onClick={() => selectAuthor(a)}
                        style={{ padding: `${space[3]} ${space[4]}`, cursor: 'pointer', borderBottom: `1px solid ${color.border}`, fontSize: text.sm, fontFamily: font.body, color: color.text }}
                        onMouseEnter={e => e.currentTarget.style.background = color.primarySoft}
                        onMouseLeave={e => e.currentTarget.style.background = color.surface}>
                        {a.name} {a.nationality ? `· ${a.nationality}` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Field label="Genere">
                <select style={{ ...fieldStyle }} value={form.author_gender} onChange={e => f('author_gender', e.target.value)} disabled={authorLocked}>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Nazionalità">
                <input style={{ ...fieldStyle, background: authorLocked ? color.primarySoft : color.surface }}
                  placeholder="Es. Italiana" value={form.author_nationality}
                  disabled={authorLocked} onChange={e => f('author_nationality', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: space[3], justifyContent: 'flex-end', borderTop: `1px solid ${color.border}`, paddingTop: space[4] }}>
            <button onClick={() => { setShowAdd(false); resetForm(); }} style={{ ...btn.ghost }}>Annulla</button>
            <button onClick={submitProposal} style={{ ...btn.primary }}
              disabled={!form.title || !form.author_name}>
              Aggiungi proposta
            </button>
          </div>
        </div>
      )}

      {/* ── LISTA PROPOSTE ── */}
      {loading ? (
        <div style={{ color: color.muted, fontSize: text.sm, fontFamily: font.body, padding: space[4] }}>Caricamento proposte...</div>
      ) : proposals.length === 0 ? (
        <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: `${space[10]} ${space[6]}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: space[3] }}>📋</div>
          <div style={{ color: color.muted, fontFamily: font.body, fontSize: text.md }}>Nessuna proposta ancora.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: space[4] }}>
          {proposals.map(p => {
            const book = p.books;
            if (!book) return null;
            return (
              <div key={p.id} className="rr-proposal-card" style={{ background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.md, boxShadow: shadow.xs, padding: space[5], display: 'flex', flexDirection: 'column', gap: space[3] }}>
                {book.cover_url && (
                  <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: radius.sm }} loading="lazy" />
                )}
                <div>
                  <div style={{ fontFamily: font.heading, fontWeight: '700', fontSize: text.lg, color: color.text, lineHeight: 1.3, marginBottom: space[1] }}>{book.title}</div>
                  <div style={{ color: color.textSoft, fontSize: text.sm, fontFamily: font.body }}>{book.authors?.name}{book.publication_year ? ` · ${book.publication_year}` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: space[2], flexWrap: 'wrap' }}>
                  {book.genre && <span style={badge(color.primarySoft, color.primaryDark)}>{book.genre}</span>}
                  {book.authors?.nationality && <span style={badge(color.bgSoft, color.textSoft)}>{book.authors.nationality}</span>}
                </div>
                {!isLibrary && p.members?.name && (
                  <div style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>
                    Proposto da <strong style={{ color: color.textSoft }}>{p.members.name}</strong>
                  </div>
                )}
                {isCapitano && (
                  <div style={{ display: 'flex', gap: space[2], borderTop: `1px solid ${color.border}`, paddingTop: space[3] }}>
                    <button onClick={() => promoteToLibrary(p.id, book.id)} style={{ ...btn.primary, fontSize: text.xs, padding: `${space[2]} ${space[3]}`, flex: 1 }}>
                      ✅ Sposta in libreria
                    </button>
                    <button onClick={() => removeProposal(p.id, book.id)} style={{ ...btn.danger, fontSize: text.xs, padding: `${space[2]} ${space[3]}` }}>
                      Rimuovi
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
