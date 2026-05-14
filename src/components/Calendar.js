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

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function toICS(event) {
  const uid = event.id + '@bookclubpirati';
  const dt = event.date.replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const desc = event.notes ? event.notes.replace(/\n/g, '\\n') : '';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Book Club dei Pirati//IT',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${dt}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(event) {
  const blob = new Blob([toICS(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Calendar({ isCapitano, currentMember }) {
  const [events, setEvents] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: '', title: '', notes: '', type: 'ufficiale' });
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchEvents(), fetchRsvps()]);
    setLoading(false);
  }

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    if (error) setError(error.message);
    else setEvents(data || []);
  }

  async function fetchRsvps() {
    if (!currentMember) return;
    const { data } = await supabase
      .from('event_rsvp')
      .select('event_id')
      .eq('member_id', currentMember.id);
    setRsvps((data || []).map(r => r.event_id));
  }

  async function addEvent() {
    if (!form.date || !form.title.trim()) return;
    const { error } = await supabase.from('events').insert({
      date: form.date,
      title: form.title.trim(),
      notes: form.notes.trim() || null,
      type: form.type,
    });
    if (error) { setError(error.message); return; }
    setForm({ date: '', title: '', notes: '', type: 'ufficiale' });
    setShowAdd(false);
    fetchEvents();
  }

  async function removeEvent(id) {
    if (!window.confirm('Rimuovere questo evento?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchEvents();
  }

  async function toggleRsvp(eventId) {
    if (!currentMember) return;
    const going = rsvps.includes(eventId);
    if (going) {
      await supabase.from('event_rsvp').delete().eq('event_id', eventId).eq('member_id', currentMember.id);
      setRsvps(rsvps.filter(id => id !== eventId));
    } else {
      await supabase.from('event_rsvp').insert({ event_id: eventId, member_id: currentMember.id });
      setRsvps([...rsvps, eventId]);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter(e => e.date >= today);
  const past = events.filter(e => e.date < today);

  function isToday(d) { return d === today; }
  function isSoon(d) {
    const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }

  function EventCard({ e, isPast = false }) {
    const going = rsvps.includes(e.id);
    const isUfficiale = e.type === 'ufficiale';

    return (
      <div style={{ background: isPast ? 'transparent' : palette.card, border: `1px solid ${isToday(e.date) ? palette.accent : palette.border}`, borderRadius: '12px', padding: isPast ? '0.8rem 1.2rem' : '1.2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: isPast ? 0.6 : 1 }}>
        {/* Data */}
        <div style={{ background: isPast ? palette.beige : isUfficiale && isSoon(e.date) ? palette.accent : palette.beige, borderRadius: '10px', padding: '0.5rem 0.8rem', textAlign: 'center', minWidth: '56px', flexShrink: 0 }}>
          <div style={{ fontSize: isPast ? '1rem' : '1.3rem', fontWeight: 'bold', color: !isPast && isUfficiale && isSoon(e.date) ? '#fff' : palette.accent, lineHeight: 1 }}>
            {new Date(e.date).getDate()}
          </div>
          <div style={{ fontSize: '0.7rem', color: !isPast && isUfficiale && isSoon(e.date) ? '#ffffffaa' : palette.muted, textTransform: 'uppercase' }}>
            {new Date(e.date).toLocaleDateString('it-IT', { month: 'short' })}
          </div>
        </div>

        {/* Contenuto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 'bold', fontFamily: 'Georgia, serif', fontSize: isPast ? '0.9rem' : '1rem' }}>{e.title}</div>
            {/* Badge tipo */}
            <span style={{ background: isUfficiale ? palette.accentLight : palette.beige, color: isUfficiale ? palette.accent : palette.muted, borderRadius: '20px', padding: '0.1rem 0.6rem', fontSize: '0.7rem', border: `1px solid ${isUfficiale ? palette.accent : palette.border}` }}>
              {isUfficiale ? '⚓ Ufficiale' : '🗺️ Vario'}
            </span>
            {isToday(e.date) && <span style={{ background: palette.accent, color: '#fff', borderRadius: '20px', padding: '0.1rem 0.6rem', fontSize: '0.7rem' }}>Oggi!</span>}
            {isSoon(e.date) && !isToday(e.date) && <span style={{ background: palette.accentLight, color: palette.accent, borderRadius: '20px', padding: '0.1rem 0.6rem', fontSize: '0.7rem' }}>Questa settimana</span>}
          </div>
          {!isPast && <div style={{ fontSize: '0.8rem', color: palette.muted, marginTop: '0.2rem' }}>{formatDate(e.date)}</div>}
          {!isPast && e.notes && (
            <div style={{ fontSize: '0.85rem', color: palette.muted, marginTop: '0.5rem', borderTop: `1px solid ${palette.border}`, paddingTop: '0.5rem' }}>
              {e.notes}
            </div>
          )}

          {/* Azioni */}
          {!isPast && (
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
              {/* RSVP */}
              {currentMember && !isCapitano && (
                <button onClick={() => toggleRsvp(e.id)} style={{ background: going ? palette.accent : 'transparent', color: going ? '#fff' : palette.muted, border: `1px solid ${going ? palette.accent : palette.border}`, borderRadius: '8px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                  {going ? '✅ Ci sarò' : '👋 Ci sarò?'}
                </button>
              )}
              {/* Scarica ICS */}
              <button onClick={() => downloadICS(e)} style={{ background: 'transparent', color: palette.muted, border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                📅 Aggiungi al calendario
              </button>
            </div>
          )}
        </div>

        {/* Rimuovi (solo capitano) */}
        {isCapitano && (
          <button onClick={() => removeEvent(e.id)} style={{ background: 'transparent', border: `1px solid #e07070`, color: '#e07070', borderRadius: '8px', padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0 }}>
            Rimuovi
          </button>
        )}
      </div>
    );
  }

  if (loading) return <p style={{ padding: '2rem', color: palette.muted }}>Caricamento calendario...</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ color: palette.muted, fontSize: '0.9rem' }}>
          {upcoming.length} {upcoming.length === 1 ? 'evento in programma' : 'eventi in programma'}
        </div>
        {isCapitano && (
          <button onClick={() => setShowAdd(!showAdd)} style={{ background: palette.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            {showAdd ? 'Annulla' : '+ Aggiungi evento'}
          </button>
        )}
      </div>

      {error && <p style={{ color: 'red', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

      {/* Form aggiunta */}
      {showAdd && isCapitano && (
        <div style={{ background: palette.beige, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 'bold', color: palette.accent, marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>📅 Nuovo evento</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: palette.muted, display: 'block', marginBottom: '0.3rem' }}>Tipo di evento</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['ufficiale', 'vario'].map(t => (
                  <button key={t} onClick={() => f('type', t)} style={{ background: form.type === t ? palette.accent : 'transparent', color: form.type === t ? '#fff' : palette.muted, border: `1px solid ${form.type === t ? palette.accent : palette.border}`, borderRadius: '20px', padding: '0.3rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {t === 'ufficiale' ? '⚓ Ufficiale' : '🗺️ Vario'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: palette.muted, display: 'block', marginBottom: '0.3rem' }}>Data *</label>
              <input type="date" style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                value={form.date} onChange={e => f('date', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: palette.muted, display: 'block', marginBottom: '0.3rem' }}>Titolo *</label>
              <input style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: '#fff', width: '100%', boxSizing: 'border-box' }}
                placeholder="Es. Incontro mensile — Siddharta" value={form.title} onChange={e => f('title', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: palette.muted, display: 'block', marginBottom: '0.3rem' }}>Note</label>
              <textarea style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem', background: '#fff', width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', fontSize: '0.9rem' }}
                placeholder="Luogo, link di videochiamata, indicazioni..." value={form.notes} onChange={e => f('notes', e.target.value)} />
            </div>
            <button onClick={addEvent} style={{ background: palette.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', cursor: 'pointer', fontSize: '0.9rem', alignSelf: 'flex-start' }}>
              Salva evento
            </button>
          </div>
        </div>
      )}

      {/* Eventi in programma */}
      {upcoming.length === 0 ? (
        <div style={{ background: palette.card, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '2rem', textAlign: 'center', color: palette.muted, fontStyle: 'italic' }}>
          Nessun evento in programma.{isCapitano && ' Aggiungine uno!'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
          {upcoming.map(e => <EventCard key={e.id} e={e} />)}
        </div>
      )}

      {/* Archivio */}
      {past.length > 0 && (
        <div>
          <div style={{ color: palette.muted, fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Archivio
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[...past].reverse().map(e => <EventCard key={e.id} e={e} isPast />)}
          </div>
        </div>
      )}
    </div>
  );
}