import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../../supabase';
import { color, font, text, space, radius, shadow, heading, btn, input as inputStyle } from '../../theme';
import { searchBooks } from '../../utils/bookSearch';
import Field from '../../ui/Field';

const GENRES  = ['Romanzo', 'Saggio', 'Racconto', 'Poesia', 'Graphic novel', 'Altro'];
const GENDERS = ['M', 'F', 'Non binario', 'Sconosciuto'];

const EMPTY_FORM = {
  title: '', publisher: '', publication_year: '', genre: 'Romanzo',
  isbn: '', cover_url: '', author_name: '', author_gender: 'Sconosciuto',
  author_nationality: '', author_id: null,
};

export default function ProposalForm({ isCapitano, currentMember, isLibrary, source, onSubmitted, onCancel }) {
  const [form,              setForm]             = useState(EMPTY_FORM);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [searchResults,     setSearchResults]     = useState([]);
  const [searching,         setSearching]         = useState(false);
  const [bookSelected,      setBookSelected]      = useState(false);
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [authorLocked,      setAuthorLocked]      = useState(false);
  const [error,             setError]             = useState(null);
  const searchTimeout = useRef(null);
  const authorTimeout = useRef(null);

  const f = useCallback((k, v) => setForm(prev => ({ ...prev, [k]: v })), []);
  const fs = { ...inputStyle, fontSize: text.sm, padding: `${space[2]} ${space[3]}` };

  function handleSearchChange(val) {
    setSearchQuery(val);
    setBookSelected(false);
    clearTimeout(searchTimeout.current);
    if (val.length < 3) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchBooks(val);
      setSearchResults(results);
      setSearching(false);
    }, 500);
  }

  function selectFromSearch(r) {
    setForm(prev => ({
      ...prev,
      title:            r.title,
      publisher:        r.publisher || '',
      publication_year: r.year      || '',
      isbn:             r.isbn      || '',
      cover_url:        r.cover_url || '',
      author_name:      r.author    || '',
    }));
    setSearchQuery(r.title);
    setSearchResults([]);
    setBookSelected(true);
  }

  function handleAuthorChange(val) {
    f('author_name', val);
    clearTimeout(authorTimeout.current);
    if (val.length < 2) { setAuthorSuggestions([]); return; }
    authorTimeout.current = setTimeout(async () => {
      const { data } = await supabase
        .from('authors').select('id,name,gender,nationality')
        .ilike('name', `%${val}%`).limit(5);
      setAuthorSuggestions(data || []);
    }, 300);
  }

  function selectAuthor(a) {
    setForm(prev => ({
      ...prev,
      author_id:          a.id,
      author_name:        a.name,
      author_gender:      a.gender      || 'Sconosciuto',
      author_nationality: a.nationality || '',
    }));
    setAuthorSuggestions([]);
    setAuthorLocked(true);
  }

  function clearAuthor() {
    setForm(prev => ({ ...prev, author_id: null, author_name: '', author_gender: 'Sconosciuto', author_nationality: '' }));
    setAuthorLocked(false);
    setAuthorSuggestions([]);
  }

  async function handleSubmit() {
    if (!form.title || !form.author_name) return;
    if (!isLibrary && !currentMember) return alert('Seleziona prima il tuo nome!');

    let authorId = form.author_id || null;
    if (!authorId) {
      const { data: newAuthor, error: aErr } = await supabase
        .from('authors')
        .insert({ name: form.author_name.trim(), gender: form.author_gender, nationality: form.author_nationality || null })
        .select('id').single();
      if (aErr) { setError(aErr.message); return; }
      authorId = newAuthor.id;
    }

    const { data: newBook, error: bErr } = await supabase
      .from('books')
      .insert({
        title:            form.title.trim(),
        author_id:        authorId,
        genre:            form.genre,
        publisher:        form.publisher        || null,
        publication_year: form.publication_year ? parseInt(form.publication_year) : null,
        isbn:             form.isbn             || null,
        cover_url:        form.cover_url        || null,
        status:           'backlog',
      })
      .select('id').single();
    if (bErr) { setError(bErr.message); return; }

    const { error: pErr } = await supabase.from('proposals').insert({
      book_id:     newBook.id,
      proposed_by: isLibrary ? null : currentMember.id,
      source,
    });
    if (pErr) { setError(pErr.message); return; }

    onSubmitted();
  }

  return (
    <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: space[6] }}>
      <div style={{ ...heading.md, marginBottom: space[1] }}>📖 Proponi un libro</div>
      <div style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body, marginBottom: space[5] }}>
        {isCapitano ? 'Andrà nelle proposte della libreria.' : 'Andrà nelle proposte dei partecipanti.'}
      </div>

      {error && <div style={{ color: color.danger, fontSize: text.sm, marginBottom: space[3] }}>{error}</div>}

      {/* Book search */}
      <Field label="🔍 Cerca per titolo o ISBN">
        <div style={{ position: 'relative' }}>
          <input
            style={fs}
            placeholder="Es. 'Il nome della rosa' oppure ISBN"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            autoComplete="off"
          />
          {searching && (
            <div style={{ position: 'absolute', right: space[3], top: '50%', transform: 'translateY(-50%)', fontSize: text.xs, color: color.muted }}>⏳</div>
          )}
          {searchResults.length > 0 && (
            <div style={{ position: 'absolute', top: '105%', left: 0, right: 0, background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.sm, zIndex: 20, boxShadow: shadow.md, maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  onMouseDown={e => { e.preventDefault(); selectFromSearch(r); }}
                  style={{ padding: `${space[3]} ${space[4]}`, display: 'flex', gap: space[3], alignItems: 'center', cursor: 'pointer', borderBottom: `1px solid ${color.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = color.bgSoft}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {r.cover_url && <img src={r.cover_url} alt="" style={{ width: '32px', height: '44px', objectFit: 'cover', borderRadius: radius.xs }} loading="lazy" />}
                  <div>
                    <div style={{ fontWeight: '600', fontSize: text.sm, color: color.text, fontFamily: font.body }}>{r.title}</div>
                    <div style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>{r.author}{r.year ? ` · ${r.year}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space[4], marginTop: space[4] }}>
        {/* Title */}
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="Titolo *">
            <input style={fs} placeholder="Titolo del libro" value={form.title} onChange={e => f('title', e.target.value)} />
          </Field>
        </div>

        {/* Genre */}
        <Field label="Genere">
          <select style={fs} value={form.genre} onChange={e => f('genre', e.target.value)}>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>

        {/* Year */}
        <Field label="Anno">
          <input style={fs} type="number" placeholder="Es. 1980" value={form.publication_year} onChange={e => f('publication_year', e.target.value)} />
        </Field>

        {/* Publisher */}
        <Field label="Editore">
          <input style={fs} placeholder="Es. Einaudi" value={form.publisher} onChange={e => f('publisher', e.target.value)} />
        </Field>

        {/* ISBN */}
        <Field label="ISBN">
          <input style={fs} placeholder="978..." value={form.isbn} onChange={e => f('isbn', e.target.value)} />
        </Field>

        {/* Cover URL */}
        <div style={{ gridColumn: '1/-1' }}>
          <Field label="URL copertina">
            <input style={fs} placeholder="https://..." value={form.cover_url} onChange={e => f('cover_url', e.target.value)} />
          </Field>
        </div>

        {/* Author section */}
        <div style={{ gridColumn: '1/-1', background: color.bgSoft, borderRadius: radius.sm, padding: space[4], display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space[3] }}>
          <div style={{ gridColumn: '1/-1', fontSize: text.xs, color: color.muted, fontFamily: font.body, fontWeight: '600', marginBottom: space[1] }}>👤 Autore/Autrice</div>

          <div style={{ gridColumn: '1/-1', position: 'relative' }}>
            <Field label="Nome *">
              <div style={{ display: 'flex', gap: space[2] }}>
                <input
                  style={{ ...fs, flex: 1, background: authorLocked ? color.primarySoft : color.surface }}
                  placeholder="Es. Umberto Eco"
                  value={form.author_name}
                  disabled={authorLocked}
                  onChange={e => handleAuthorChange(e.target.value)}
                />
                {authorLocked && (
                  <button type="button" onClick={clearAuthor} style={{ ...btn.ghost, fontSize: text.xs, padding: `${space[1]} ${space[2]}` }}>✕ Cambia</button>
                )}
              </div>
            </Field>
            {authorSuggestions.length > 0 && !authorLocked && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: color.surface, border: `1px solid ${color.border}`, borderRadius: radius.sm, zIndex: 20, boxShadow: shadow.md }}>
                {authorSuggestions.map(a => (
                  <div
                    key={a.id}
                    onMouseDown={e => { e.preventDefault(); selectAuthor(a); }}
                    style={{ padding: `${space[3]} ${space[4]}`, cursor: 'pointer', fontSize: text.sm, fontFamily: font.body, color: color.text, borderBottom: `1px solid ${color.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = color.bgSoft}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {a.name}
                    <span style={{ fontSize: text.xs, color: color.muted, marginLeft: space[2] }}>{a.gender} · {a.nationality}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Field label="Genere autore">
            <select style={{ ...fs, background: authorLocked ? color.primarySoft : color.surface }} value={form.author_gender} disabled={authorLocked} onChange={e => f('author_gender', e.target.value)}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>

          <Field label="Nazionalità">
            <input
              style={{ ...fs, background: authorLocked ? color.primarySoft : color.surface }}
              placeholder="Es. Italiana"
              value={form.author_nationality}
              disabled={authorLocked}
              onChange={e => f('author_nationality', e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div style={{ display: 'flex', gap: space[3], justifyContent: 'flex-end', borderTop: `1px solid ${color.border}`, paddingTop: space[4], marginTop: space[4] }}>
        <button onClick={onCancel} style={btn.ghost}>Annulla</button>
        <button onClick={handleSubmit} style={btn.primary} disabled={!form.title || !form.author_name}>
          Aggiungi proposta
        </button>
      </div>
    </div>
  );
}
