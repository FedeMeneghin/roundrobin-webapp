import React from 'react';

const palette = {
  bg: '#faf8f4',
  card: '#ffffff',
  accent: '#7a9e7e',
  text: '#2c2c2c',
  muted: '#888',
  border: '#e8e4de',
};

const tabs = [
  { id: 'home', label: '🏠 Home' },
  { id: 'library', label: '📚 Libreria' },
  { id: 'libsugg', label: '🏛️ Proposte libreria' },
  { id: 'usersugg', label: '💬 Proposte pirati' },
  { id: 'voting', label: '🗳️ Votazione' },
  { id: 'members', label: '👥 Pirati' },
  { id: 'calendar', label: '📅 Calendario' },
];

export default function Navbar({ activeTab, setActiveTab, isCapitano, setIsCapitano }) {
  return (
    <div style={{ background: palette.card, borderBottom: `1px solid ${palette.border}`, padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: palette.accent, fontFamily: 'Georgia, serif' }}>
          🏴‍☠️ Il Book Club dei Pirati
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {isCapitano && (
            <span style={{ background: palette.accent, color: '#fff', borderRadius: '20px', padding: '0.2rem 0.8rem', fontSize: '0.8rem' }}>
              ⚓ Modalità Capitano
            </span>
          )}
          <button
            onClick={() => setIsCapitano(!isCapitano)}
            style={{ background: 'transparent', border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem', color: palette.muted }}
          >
            {isCapitano ? 'Esci' : '🔐 Capitano'}
          </button>
        </div>
      </div>
      <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id ? palette.accent : 'transparent',
              color: activeTab === t.id ? '#fff' : palette.muted,
              border: `1px solid ${activeTab === t.id ? palette.accent : palette.border}`,
              borderRadius: '20px',
              padding: '0.3rem 0.9rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'Georgia, serif',
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}