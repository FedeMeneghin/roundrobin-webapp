import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { color, font, text, space, radius, shadow, heading, btn, badge, input as inputStyle } from '../theme';

// ── Colori per tipo evento ──────────────────────────────────
const TYPE = {
  ufficiale: {
    label:   '⚓ Ufficiale',
    bg:      color.primarySoft,
    fg:      color.primaryDark,
    border:  color.primary,
    dateBg:  color.primary,
    dateFg:  '#fff',
  },
  vario: {
    label:   '🗺️ Vario',
    bg:      color.warningSoft,
    fg:      '#7a4f00',
    border:  color.warning,
    dateBg:  color.bgSoft,
    dateFg:  color.textSoft,
  },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function toICS(event) {
  const uid   = event.id + '@roundrobin';
  const dt    = event.date.replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const desc  = event.notes ? event.notes.replace(/\n/g, '\\n') : '';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Round Robin Book Club//IT',
    'BEGIN:VEVENT',
    `UID:${uid}`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dt}`, `DTEND;VALUE=DATE:${dt}`,
    `SUMMARY:${event.title}`, `DESCRIPTION:${desc}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(event) {
  const blob = new Blob([toICS(event)], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${event.title}.ics`; a.click();
  URL.revokeObjectURL(url);
}

export default function Calendar({ isCapitano }) {
  const [events,    setEvents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = { title: '', date: '', type: 'ufficiale', location: '', notes: '' };
  const [form, setForm] = useState(emptyForm);
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('events').select('*').order('date', { ascending: true });
    if (error) setError(error.message);
    else setEvents(data || []);
    setLoading(false);
  }

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
    setForm(emptyForm); setShowAdd(false); setEditingId(null); fetchEvents();
  }

  async function removeEvent(id) {
    if (!window.confirm('Rimuovere questo evento?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  }

  function startEdit(e) {
    setForm({ title: e.title, date: e.date, type: e.type || 'ufficiale', location: e.location || '', notes: e.notes || '' });
    setEditingId(e.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const today    = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.date >= today);
  const past     = events.filter(e => e.date <  today);

  // ── Componente card evento ──────────────────────────────────
  function EventCard({ e, isPast }) {
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

        {/* Riga superiore: data + titolo + badge tipo */}
        <div style={{ display: 'flex', gap: space[3], alignItems: 'flex-start' }}>

          {/* Data box — colorato se ufficiale e futuro */}
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

          {/* Badge tipo — sempre visibile */}
          <span style={{
            ...badge(t.bg, t.fg),
            border:     `1px solid ${t.border}`,
            flexShrink: 0,
            alignSelf:  'flex-start',
          }}>
            {t.label}
          </span>
        </div>

        {/* Luogo */}
        {e.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: space[2], fontSize: text.sm, color: color.textSoft, fontFamily: font.body }}>
            📍 {e.location}
          </div>
        )}

        {/* Note */}
        {e.notes && (
          <div style={{ fontSize: text.sm, color: color.textSoft, fontFamily: font.body, background: color.bgSoft, borderRadius: radius.xs, padding: `${space[3]} ${space[4]}`, lineHeight: 1.6 }}>
            {e.notes}
          </div>
        )}

        {/* Azioni */}
        <div style={{ display: 'flex', gap: space[2], flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => downloadICS(e)} style={{ ...btn.ghost, fontSize: text.xs, padding: `${space[2]} ${space[3]}` }}>
            📅 Esporta .ics
          </button>
          {isCapitano && (
            <>
              <button onClick={() => startEdit(e)} style={{ ...btn.secondary, fontSize: text.xs, padding: `${space[2]} ${space[3]}` }}>
                ✏️ Modifica
              </button>
              <button onClick={() => removeEvent(e.id)} style={{ ...btn.danger, fontSize: text.xs }}>
                Rimuovi
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Form field helpers ─────────────────────────────────────
  const Field = ({ label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[1] }}>
      <label style={{ fontSize: text.xs, color: color.textSoft, fontFamily: font.body, fontWeight: '600' }}>{label}</label>
      {children}
    </div>
  );
  const fieldStyle = { ...inputStyle, fontSize: text.sm, padding: `${space[2]} ${space[3]}` };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[6] }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ ...heading.section }}>📅 Calendario incontri</div>
        {isCapitano && (
          <button onClick={() => { setShowAdd(!showAdd); setForm(emptyForm); setEditingId(null); }}
            style={{ ...btn.primary }}>
            {showAdd ? 'Annulla' : '+ Nuovo evento'}
          </button>
        )}
      </div>

      {error && <div style={{ color: color.danger, fontSize: text.sm, fontFamily: font.body }}>{error}</div>}

      {/* ── FORM ── */}
      {showAdd && isCapitano && (
        <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: space[6] }}>
          <div style={{ ...heading.md, marginBottom: space[5] }}>
            {editingId ? '✏️ Modifica evento' : '➕ Nuovo evento'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space[4] }}>

            {/* Titolo */}
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Titolo *">
                <input style={fieldStyle} placeholder="Es. Incontro mensile" value={form.title} onChange={e => f('title', e.target.value)} />
              </Field>
            </div>

            {/* Data */}
            <Field label="Data *">
              <input type="date" style={fieldStyle} value={form.date} onChange={e => f('date', e.target.value)} />
            </Field>

            {/* Luogo */}
            <Field label="Luogo">
              <input style={fieldStyle} placeholder="Es. Casa di Marco" value={form.location} onChange={e => f('location', e.target.value)} />
            </Field>

            {/* Tipo evento */}
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Tipo di evento">
                <div style={{ display: 'flex', gap: space[3] }}>
                  {['ufficiale', 'vario'].map(tipo => {
                    const t = TYPE[tipo];
                    const active = form.type === tipo;
                    return (
                      <button key={tipo} onClick={() => f('type', tipo)} style={{
                        flex: 1,
                        background: active ? t.bg      : color.surface,
                        color:      active ? t.fg      : color.textSoft,
                        border:     `1.5px solid ${active ? t.border : color.border}`,
                        borderRadius: radius.sm,
                        padding: `${space[3]} ${space[4]}`,
                        cursor: 'pointer',
                        fontSize: text.sm,
                        fontWeight: active ? '700' : '500',
                        fontFamily: font.body,
                        transition: 'all 0.15s ease',
                      }}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            {/* Note */}
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Note">
                <textarea style={{ ...fieldStyle, height: '90px', resize: 'vertical', lineHeight: 1.6 }}
                  placeholder="Dettagli, tema della serata..."
                  value={form.notes} onChange={e => f('notes', e.target.value)} />
              </Field>
            </div>
          </div>

          <div style={{ display: 'flex', gap: space[3], justifyContent: 'flex-end', borderTop: `1px solid ${color.border}`, paddingTop: space[4], marginTop: space[4] }}>
            <button onClick={() => { setShowAdd(false); setForm(emptyForm); setEditingId(null); }} style={{ ...btn.ghost }}>
              Annulla
            </button>
            <button onClick={saveEvent} style={{ ...btn.primary }} disabled={!form.title || !form.date}>
              {editingId ? 'Salva modifiche' : 'Aggiungi evento'}
            </button>
          </div>
        </div>
      )}

      {/* ── LISTA ── */}
      {loading ? (
        <div style={{ color: color.muted, fontSize: text.sm, fontFamily: font.body, padding: space[4] }}>
          Caricamento calendario...
        </div>
      ) : (
        <>
          {/* Prossimi eventi — raggruppati per tipo */}
          {upcoming.length > 0 ? (
            <div>
              <div style={{ ...heading.md, marginBottom: space[4] }}>🗓️ Prossimi incontri</div>

              {/* Ufficiali in evidenza */}
              {upcoming.filter(e => (e.type || 'ufficiale') === 'ufficiale').length > 0 && (
                <div style={{ marginBottom: space[5] }}>
                  <div style={{ fontSize: text.xs, fontWeight: '700', color: color.primaryDark, fontFamily: font.body, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: space[3] }}>
                    ⚓ Incontri ufficiali
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
                    {upcoming.filter(e => (e.type || 'ufficiale') === 'ufficiale').map(e =>
                      <EventCard key={e.id} e={e} isPast={false} />
                    )}
                  </div>
                </div>
              )}

              {/* Altri eventi */}
              {upcoming.filter(e => e.type === 'vario').length > 0 && (
                <div>
                  <div style={{ fontSize: text.xs, fontWeight: '700', color: '#7a4f00', fontFamily: font.body, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: space[3] }}>
                    🗺️ Altri eventi
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
                    {upcoming.filter(e => e.type === 'vario').map(e =>
                      <EventCard key={e.id} e={e} isPast={false} />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: `${space[10]} ${space[6]}`, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: space[3] }}>🗓️</div>
              <div style={{ color: color.muted, fontFamily: font.body, fontSize: text.md }}>Nessun evento in programma.</div>
              {isCapitano && <div style={{ color: color.muted, fontSize: text.sm, marginTop: space[2], fontFamily: font.body }}>Aggiungine uno con il bottone qui sopra!</div>}
            </div>
          )}

          {/* Passati — collassabili */}
          {past.length > 0 && (
            <details style={{ background: color.bgSoft, borderRadius: radius.md, border: `1px solid ${color.border}`, padding: space[5] }}>
              <summary style={{ cursor: 'pointer', fontFamily: font.body, fontWeight: '600', fontSize: text.sm, color: color.textSoft, userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: space[2] }}>
                <span style={{ background: color.bgSoft, color: color.muted, borderRadius: radius.pill, padding: '0.25rem 0.7rem', fontSize: text.xs, fontWeight: '700', border: `1px solid ${color.border}` }}>
                  ⏪ {past.length} evento{past.length !== 1 ? 'i' : ''} passato{past.length !== 1 ? 'i' : ''}
                </span>
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: space[3], marginTop: space[4] }}>
                {[...past].reverse().map(e => <EventCard key={e.id} e={e} isPast />)}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}