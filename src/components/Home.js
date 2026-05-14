import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { color, font, text, space, radius, shadow, heading, badge, btn} from '../theme';

const EVENT_TYPE = {
  ufficiale: { label: '⚓ Ufficiale', bg: color.primarySoft,  fg: color.primaryDark },
  vario:     { label: '🗺️ Vario',    bg: color.warningSoft,  fg: '#7a4f00'         },
};

function Skeleton({ w = '100%', h = '1rem', br = radius.sm }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: br,
      background: `linear-gradient(90deg, ${color.bgSoft} 25%, ${color.primarySoft} 50%, ${color.bgSoft} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s ease-in-out infinite',
    }} />
  );
}

export default function Home({ currentMember, isCapitano }) {
  const [currentBook,     setCurrentBook]     = useState(null);
  const [upcomingEvents,  setUpcomingEvents]  = useState([]);
  const [stats,           setStats]           = useState({ books: 0, members: 0, proposals: 0 });
  const [loading,         setLoading]         = useState(true);
  //const [settingActive,   setSettingActive]   = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchCurrentBook(), fetchEvents(), fetchStats()]);
    setLoading(false);
  }

  async function fetchCurrentBook() {
    const { data } = await supabase
      .from('books').select('*, authors(name, gender, nationality)')
      .eq('status', 'active').maybeSingle();
    setCurrentBook(data);
  }

  async function fetchEvents() {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase.from('events').select('*')
      .gte('date', today).order('date', { ascending: true }).limit(4);
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

  /*
  async function setBookOfMonth(bookId) {
    setSettingActive(true);
    // Rimetti tutti gli 'active' in 'backlog' prima
    await supabase.from('books').update({ status: 'backlog', selected_date: null }).eq('status', 'active');
    // Imposta il nuovo libro del mese
    await supabase.from('books').update({
      status: 'active',
      selected_date: new Date().toISOString().slice(0, 10),
    }).eq('id', bookId);
    setSettingActive(false);
    fetchAll();
  }
  */

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .rr-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${space[5]};
        }
        @media (max-width: 600px) {
          .rr-grid-2 { grid-template-columns: 1fr; }
        }
        .rr-stat-num {
          font-family: ${font.heading};
          font-size: 2.2rem;
          font-weight: 800;
          color: ${color.primary};
          line-height: 1;
        }
        .rr-event-row + .rr-event-row {
          border-top: 1px solid ${color.border};
          padding-top: ${space[3]};
          margin-top: ${space[3]};
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>

        {/* ── HERO ── */}
        <div style={{
          background: `linear-gradient(135deg, ${color.primary} 0%, #12997a 100%)`,
          borderRadius: radius.lg,
          padding: `${space[8]} ${space[6]}`,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ fontSize: text.sm, opacity: 0.85, marginBottom: space[2], fontFamily: font.body, fontWeight: '500', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Bentornato a bordo
          </div>
          <div style={{ ...heading.hero, color: '#fff', fontSize: 'clamp(1.8rem, 5vw, 2.4rem)' }}>
            {isCapitano ? '⚓ Capitano' : `🏴‍☠️ ${currentMember?.name}`}
          </div>
        </div>

        {/* ── LIBRO DEL MESE ── */}
        <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: space[6] }}>
          <div style={{ ...heading.section, marginBottom: space[4] }}>📖 Libro del mese</div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
              <Skeleton h="2rem" w="70%" /><Skeleton h="1rem" w="40%" /><Skeleton h="1.5rem" w="30%" />
            </div>
          ) : currentBook ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
              <div style={{ ...heading.xl, fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', lineHeight: 1.2 }}>
                {currentBook.title}
              </div>
              <div style={{ fontFamily: font.body, fontSize: text.md, color: color.textSoft }}>
                {currentBook.authors?.name}
              </div>
              <div style={{ display: 'flex', gap: space[2], flexWrap: 'wrap' }}>
                {currentBook.genre && <span style={badge(color.primarySoft, color.primaryDark)}>{currentBook.genre}</span>}
                {currentBook.authors?.nationality && <span style={badge(color.bgSoft, color.textSoft)}>{currentBook.authors.nationality}</span>}
                {currentBook.publication_year && <span style={badge(color.bgSoft, color.textSoft)}>{currentBook.publication_year}</span>}
              </div>
              {currentBook.selected_date && (
                <div style={{ fontSize: text.sm, color: color.muted, fontFamily: font.body }}>
                  In lettura dal {new Date(currentBook.selected_date).toLocaleDateString('it-IT')}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: color.muted, fontStyle: 'italic', fontFamily: font.body, fontSize: text.md }}>
              Nessun libro attivo al momento.
              {isCapitano && ' Apri una votazione per sceglierne uno!'}
              {isCapitano && currentBook && (
                <button
                  onClick={async () => {
                    if (!window.confirm('Segnare questo libro come completato?')) return;
                    await supabase.from('books').update({ status: 'completed' }).eq('id', currentBook.id);
                    fetchAll();
                  }}
                style={{ ...btn.secondary, fontSize: text.xs, marginTop: space[2] }}
                >
                ✅ Segna come completato
                </button>
            )}
            </div>
          )}
        </div>

        {/* ── GRID: EVENTI + STATS ── */}
        <div className="rr-grid-2">

          {/* Prossimi incontri */}
          <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: space[6] }}>
            <div style={{ ...heading.section, marginBottom: space[4] }}>📅 Prossimi incontri</div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: space[3] }}>
                {[1,2,3].map(i => <Skeleton key={i} h="2.5rem" />)}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div style={{ color: color.muted, fontSize: text.sm, fontFamily: font.body, fontStyle: 'italic' }}>
                Nessun evento in programma.
              </div>
            ) : (
              upcomingEvents.map((e, i) => {
                const tipo = EVENT_TYPE[e.type] || EVENT_TYPE.ufficiale;
                return (
                  <div key={e.id} className={i > 0 ? 'rr-event-row' : ''} style={{ display: 'flex', gap: space[3], alignItems: 'flex-start' }}>
                    {/* Data box */}
                    <div style={{
                      background:   tipo.bg,
                      color:        tipo.fg,
                      borderRadius: radius.sm,
                      padding:      `${space[2]} ${space[3]}`,
                      fontSize:     text.xs,
                      fontWeight:   '700',
                      fontFamily:   font.body,
                      minWidth:     '54px',
                      textAlign:    'center',
                      lineHeight:   1.3,
                      flexShrink:   0,
                    }}>
                      {new Date(e.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                    </div>

                    {/* Titolo + badge tipo */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: space[1], flex: 1 }}>
                      <div style={{ fontSize: text.sm, color: color.text, fontFamily: font.body, fontWeight: '600' }}>
                        {e.title}
                      </div>
                      <span style={{
                        ...badge(tipo.bg, tipo.fg),
                        alignSelf: 'flex-start',
                        fontSize: '0.65rem',
                      }}>
                        {tipo.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Il club in numeri */}
          <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: space[6] }}>
            <div style={{ ...heading.section, marginBottom: space[4] }}>📊 Il club</div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: space[4] }}>
                {[1,2,3].map(i => <Skeleton key={i} h="2.5rem" />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: space[4] }}>
                {[
                  { label: 'Libri letti',         value: stats.books,     icon: '📚' },
                  { label: 'Partecipanti attivi',       value: stats.members,   icon: '🏴‍☠️' },
                  { label: 'Proposte in archivio', value: stats.proposals, icon: '📋' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: space[2] }}>
                      <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                      <span style={{ color: color.textSoft, fontSize: text.sm, fontFamily: font.body }}>{s.label}</span>
                    </div>
                    <span className="rr-stat-num">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}