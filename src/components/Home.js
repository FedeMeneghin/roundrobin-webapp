import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const palette = {
  bg: '#f6f1e8',
  card: '#fffdf9',
  accent: '#6f8f72',
  accentLight: '#edf3ec',
  muted: '#7f786e',
  border: '#ece6dc',
  beige: '#f3eee5',
  gold: '#b78b2e',
  text: '#1f1f1c',
};

export default function Home({ currentMember, isCapitano }) {
  const [currentBook, setCurrentBook] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [stats, setStats] = useState({ books: 0, members: 0, proposals: 0 });
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([
      fetchCurrentBook(),
      fetchEvents(),
      fetchStats(),
    ]);
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
      supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),

      supabase
        .from('members')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      books: books || 0,
      members: members || 0,
      proposals: proposals || 0,
    });
  }

  if (loading) {
    return (
      <p style={{ padding: '3rem', color: palette.muted }}>
        Caricamento...
      </p>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        paddingBottom: '3rem',
      }}
    >

      {/* HERO */}
      <div
        style={{
          background: palette.card,
          border: `1px solid ${palette.border}`,
          borderRadius: '14px',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
        }}
      >
        <div
          style={{
            color: palette.muted,
            fontSize: '0.95rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Bentornato a bordo
        </div>

        <div
          style={{
            fontSize: '3rem',
            lineHeight: '0.95',
            color: palette.text,
            fontFamily: 'Cormorant Garamond, serif',
            fontWeight: '700',
          }}
        >
          {isCapitano ? 'Capitano' : currentMember?.name}
        </div>
      </div>

      {/* Libro del mese */}
      <div
        style={{
          background: palette.card,
          borderRadius: '14px',
          padding: '2.5rem',
          border: `1px solid ${palette.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
        }}
      >
        <div
          style={{
            color: palette.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.8rem',
            fontWeight: '600',
          }}
        >
          Libro del mese
        </div>

        {currentBook ? (
          <>
            <div
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '3.2rem',
                lineHeight: '0.95',
                color: palette.text,
                fontWeight: '700',
                maxWidth: '700px',
              }}
            >
              {currentBook.title}
            </div>

            <div
              style={{
                fontSize: '1.05rem',
                color: palette.muted,
              }}
            >
              {currentBook.authors?.name}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                flexWrap: 'wrap',
                marginTop: '0.4rem',
              }}
            >
              {currentBook.genre && (
                <span
                  style={{
                    background: palette.accentLight,
                    color: palette.accent,
                    borderRadius: '999px',
                    padding: '0.25rem 0.8rem',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                  }}
                >
                  {currentBook.genre}
                </span>
              )}

              {currentBook.authors?.nationality && (
                <span
                  style={{
                    background: palette.beige,
                    color: palette.muted,
                    borderRadius: '999px',
                    padding: '0.25rem 0.8rem',
                    fontSize: '0.72rem',
                  }}
                >
                  {currentBook.authors.nationality}
                </span>
              )}
            </div>

            {currentBook.selected_date && (
              <div
                style={{
                  marginTop: '0.8rem',
                  fontSize: '0.92rem',
                  color: palette.muted,
                }}
              >
                In lettura dal{' '}
                {new Date(currentBook.selected_date).toLocaleDateString('it-IT')}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: palette.muted }}>
            Nessun libro attivo al momento.
          </div>
        )}
      </div>

      {/* Grid inferiore */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
        }}
      >

        {/* Eventi */}
        <div
          style={{
            background: palette.card,
            borderRadius: '12px',
            padding: '2rem',
            border: `1px solid ${palette.border}`,
          }}
        >
          <div
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.8rem',
              marginBottom: '1.5rem',
              color: palette.text,
            }}
          >
            Prossimi incontri
          </div>

          {upcomingEvents.length === 0 ? (
            <div style={{ color: palette.muted }}>
              Nessun evento in programma.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    paddingBottom: '1rem',
                    borderBottom: `1px solid ${palette.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: palette.muted,
                    }}
                  >
                    {new Date(e.date).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>

                  <div style={{ fontSize: '1rem', color: palette.text }}>
                    {e.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div
          style={{
            background: palette.card,
            borderRadius: '12px',
            padding: '2rem',
            border: `1px solid ${palette.border}`,
          }}
        >
          <div
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.8rem',
              marginBottom: '1.5rem',
              color: palette.text,
            }}
          >
            Il club
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
            }}
          >
            {[
              { label: 'Libri letti', value: stats.books },
              { label: 'Pirati a bordo', value: stats.members },
              { label: 'Proposte in archivio', value: stats.proposals },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <div style={{ color: palette.muted }}>
                  {s.label}
                </div>

                <div
                  style={{
                    fontSize: '2rem',
                    color: palette.accent,
                    fontFamily: 'Cormorant Garamond, serif',
                    fontWeight: '700',
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
