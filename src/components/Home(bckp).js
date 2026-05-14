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

export default function Home({ currentMember, isCapitano }) {
  const [currentBook, setCurrentBook] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats, setStats] = useState({ books: 0, members: 0, proposals: 0 });
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchCurrentBook(), fetchEvents(), fetchStats()]);
    setLoading(false);
  }

  async function fetchCurrentBook() {
    const { data } = await supabase
      .from('books')
      .select('*, authors(name, gender, nationality)')
      .eq('status', 'active')
      .maybeSingle();
    setCurrentBook(data);
  }

  async function fetchEvents() {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(4);
    setUpcomingEvents(data || []);
  }

  async function fetchStats() {
    const [{ count: books }, { count: members }, { count: proposals }] = await Promise.all([
      supabase.from('books').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('members').select('*', { count: 'exact', head: true }),
      supabase.from('proposals').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ books: books || 0, members: members || 0, proposals: proposals || 0 });
  }

  if (loading) return <p style={{ padding: '2rem', color: palette.muted }}>Caricamento...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

      {/* Benvenuto */}
      <div style={{ background: palette.accent, borderRadius: '12px', padding: '1.5rem 2rem', color: '#fff', fontFamily: 'Georgia, serif' }}>
        <div style={{ fontSize: '1.1rem', opacity: 0.85 }}>Bentornato a bordo,</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
          {isCapitano ? '⚓ Capitano' : `🏴‍☠️ ${currentMember?.name}`}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>

        {/* Libro del mese */}
        <div style={{ background: palette.card, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '1.5rem', gridColumn: '1/-1' }}>
          <div style={{ fontWeight: 'bold', color: palette.accent, fontFamily: 'Georgia, serif', fontSize: '1rem', marginBottom: '1rem' }}>📖 Libro del mese</div>
          {currentBook ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>{currentBook.title}</div>
              <div style={{ color: palette.muted }}>{currentBook.authors?.name}</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                {currentBook.genre && <span style={{ background: palette.accentLight, color: palette.accent, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem' }}>{currentBook.genre}</span>}
                {currentBook.authors?.nationality && <span style={{ background: palette.beige, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', color: palette.muted }}>{currentBook.authors.nationality}</span>}
                {currentBook.publication_year && <span style={{ background: palette.beige, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', color: palette.muted }}>{currentBook.publication_year}</span>}
              </div>
              {currentBook.selected_date && (
                <div style={{ fontSize: '0.85rem', color: palette.muted, marginTop: '0.3rem' }}>
                  📅 In lettura dal {new Date(currentBook.selected_date).toLocaleDateString('it-IT')}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: palette.muted, fontStyle: 'italic' }}>
              Nessun libro del mese al momento.{isCapitano && ' Apri una votazione per sceglierne uno!'}
            </div>
          )}
        </div>

        {/* Prossimi eventi */}
        <div style={{ background: palette.card, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ fontWeight: 'bold', color: palette.accent, fontFamily: 'Georgia, serif', fontSize: '1rem', marginBottom: '1rem' }}>📅 Prossimi appuntamenti</div>
          {upcomingEvents.length === 0 ? (
            <div style={{ color: palette.muted, fontStyle: 'italic', fontSize: '0.9rem' }}>Nessun evento in programma.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {upcomingEvents.map(e => (
                <div key={e.id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                  <span style={{ background: palette.beige, borderRadius: '8px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: palette.muted, whiteSpace: 'nowrap' }}>
                    {new Date(e.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>{e.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistiche */}
        <div style={{ background: palette.card, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ fontWeight: 'bold', color: palette.accent, fontFamily: 'Georgia, serif', fontSize: '1rem', marginBottom: '1rem' }}>📊 Il club in numeri</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[
              { label: 'Libri letti', value: stats.books, icon: '📚' },
              { label: 'Pirati a bordo', value: stats.members, icon: '🏴‍☠️' },
              { label: 'Proposte in backlog', value: stats.proposals, icon: '📋' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: palette.muted, fontSize: '0.9rem' }}>{s.icon} {s.label}</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: palette.accent }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}