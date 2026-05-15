import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { color, font, text, space, radius, shadow, heading, btn, input as inputStyle } from '../../theme';
import { useEvents } from '../../hooks/useSupabase';
import EventCard from './EventCard';
import Field from '../../ui/Field';

const EMPTY_FORM = { title: '', date: '', type: 'ufficiale', location: '', notes: '' };

const TYPE_OPTIONS = ['ufficiale', 'vario'];
const TYPE_LABELS  = { ufficiale: '⚓ Ufficiale', vario: '🗺️ Vario' };

export default function Calendar({ isCapitano }) {
  const { data: events, loading, error: fetchError, refetch } = useEvents();
  const [error,     setError]     = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const fs = { ...inputStyle, fontSize: text.sm, padding: `${space[2]} ${space[3]}` };

  async function saveEvent() {
    if (!form.title || !form.date) return;
    const payload = {
      title:    form.title.trim(),
      date:     form.date,
      type:     form.type,
      location: form.location || null,
      notes:    form.notes    || null,
    };
    let err;
    if (editingId) {
      ({ error: err } = await supabase.from('events').update(payload).eq('id', editingId));
    } else {
      ({ error: err } = await supabase.from('events').insert(payload));
    }
    if (err) { setError(err.message); return; }
    setForm(EMPTY_FORM); setShowAdd(false); setEditingId(null); refetch();
  }

  async function removeEvent(id) {
    if (!window.confirm('Rimuovere questo evento?')) return;
    await supabase.from('events').delete().eq('id', id);
    refetch();
  }

  function startEdit(e) {
    setForm({ title: e.title, date: e.date, type: e.type || 'ufficiale', location: e.location || '', notes: e.notes || '' });
    setEditingId(e.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const today    = new Date().toISOString().slice(0, 10);
  const allEvents = events || [];
  const upcoming  = allEvents.filter(e => e.date >= today);
  const past      = allEvents.filter(e => e.date <  today);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[6] }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ ...heading.section }}>📅 Calendario incontri</div>
        {isCapitano && (
          <button
            onClick={() => { setShowAdd(!showAdd); setForm(EMPTY_FORM); setEditingId(null); }}
            style={{ ...btn.primary }}
          >
            {showAdd ? 'Annulla' : '+ Nuovo evento'}
          </button>
        )}
      </div>

      {(error || fetchError) && (
        <div style={{ color: color.danger, fontSize: text.sm, fontFamily: font.body }}>
          {error || fetchError}
        </div>
      )}

      {/* ── Form ── */}
      {showAdd && isCapitano && (
        <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: space[6] }}>
          <div style={{ ...heading.md, marginBottom: space[5] }}>
            {editingId ? '✏️ Modifica evento' : '➕ Nuovo evento'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space[4] }}>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Titolo *">
                <input style={fs} placeholder="Es. Incontro mensile" value={form.title} onChange={e => f('title', e.target.value)} />
              </Field>
            </div>

            <Field label="Data *">
              <input type="date" style={fs} value={form.date} onChange={e => f('date', e.target.value)} />
            </Field>

            <Field label="Luogo">
              <input style={fs} placeholder="Es. Casa di Marco" value={form.location} onChange={e => f('location', e.target.value)} />
            </Field>

            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Tipo di evento">
                <div style={{ display: 'flex', gap: space[3] }}>
                  {TYPE_OPTIONS.map(tipo => (
                    <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: space[2], cursor: 'pointer', fontSize: text.sm, fontFamily: font.body, color: color.textSoft }}>
                      <input type="radio" name="tipo" value={tipo} checked={form.type === tipo} onChange={() => f('type', tipo)} style={{ accentColor: color.primary }} />
                      {TYPE_LABELS[tipo]}
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Note">
                <textarea rows={3} style={{ ...fs, resize: 'vertical' }} placeholder="Dettagli, link..." value={form.notes} onChange={e => f('notes', e.target.value)} />
              </Field>
            </div>
          </div>

          <div style={{ display: 'flex', gap: space[3], justifyContent: 'flex-end', marginTop: space[5], borderTop: `1px solid ${color.border}`, paddingTop: space[4] }}>
            <button onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setEditingId(null); }} style={btn.ghost}>Annulla</button>
            <button onClick={saveEvent} style={btn.primary} disabled={!form.title || !form.date}>
              {editingId ? 'Salva modifiche' : 'Aggiungi evento'}
            </button>
          </div>
        </div>
      )}

      {/* ── Upcoming ── */}
      {loading ? (
        <div style={{ color: color.muted, fontSize: text.sm, fontFamily: font.body, padding: space[4] }}>Caricamento...</div>
      ) : (
        <>
          {upcoming.length === 0 ? (
            <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: `${space[10]} ${space[6]}`, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: space[3] }}>📭</div>
              <div style={{ color: color.muted, fontFamily: font.body, fontSize: text.md }}>Nessun evento in programma.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
              {upcoming.map(e => (
                <EventCard key={e.id} e={e} isPast={false} isCapitano={isCapitano} onEdit={startEdit} onRemove={removeEvent} />
              ))}
            </div>
          )}

          {/* ── Past ── */}
          {past.length > 0 && (
            <>
              <div style={{ ...heading.sm, color: color.muted, marginTop: space[2] }}>📜 Passati</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
                {past.map(e => (
                  <EventCard key={e.id} e={e} isPast isCapitano={isCapitano} onEdit={startEdit} onRemove={removeEvent} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
