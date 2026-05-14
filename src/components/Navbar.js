import React, { useState } from 'react';
import { t, btn } from '../theme';

const tabs = [
  { id: 'home',     label: 'Home',              icon: '🏠' },
  { id: 'library',  label: 'Libreria',           icon: '📚' },
  { id: 'libsugg',  label: 'Proposte libreria',  icon: '🏛️' },
  { id: 'usersugg', label: 'Proposte pirati',    icon: '💬' },
  { id: 'voting',   label: 'Votazione',          icon: '🗳️' },
  { id: 'members',  label: 'Pirati',             icon: '👥' },
  { id: 'calendar', label: 'Calendario',         icon: '📅' },
];

export default function Navbar({ activeTab, setActiveTab, isCapitano, currentMember, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{ background: t.bg, borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1.2rem' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          {/* Logo */}
          <div style={{ fontFamily: t.fontSerif, fontWeight: 'bold', fontSize: '1.25rem', color: t.accent, letterSpacing: '-0.01em' }}>
            Round Robin
          </div>

          {/* Desktop: utente + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            {isCapitano && (
              <span style={{ background: t.accent, color: '#fff', borderRadius: t.radiusPill, padding: '0.2rem 0.9rem', fontSize: '0.78rem', fontWeight: '600' }}>
                Capitano
              </span>
            )}
<span style={{ color: t.textSoft, fontSize: '0.88rem' }}>
  {currentMember?.name}
</span>
            <button onClick={onLogout} style={{ ...btn.ghost, padding: '0.35rem 0.9rem', fontSize: '0.82rem' }}>
              Esci
            </button>
            {/* Hamburger mobile */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: t.textSoft, display: 'flex', alignItems: 'center', marginLeft: '0.2rem' }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Tab bar — desktop orizzontale, mobile dropdown */}
        <div style={{
          display: menuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          paddingBottom: '0.8rem',
          gap: '0.2rem',
          // su schermi larghi mostra sempre orizzontale
        }}
          className="nav-tabs-mobile"
        >
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
              style={{
                background: activeTab === tab.id ? t.accentLight : 'transparent',
                color: activeTab === tab.id ? t.accent : t.textSoft,
                border: 'none',
                borderRadius: t.radiusSm,
                padding: '0.7rem 1rem',
                cursor: 'pointer',
                fontSize: '0.92rem',
                fontWeight: activeTab === tab.id ? '600' : '400',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: t.accent }} />}
            </button>
          ))}
        </div>

        {/* Tab bar desktop — sempre visibile su schermi larghi */}
        <style>{`
          @media (min-width: 640px) {
            .nav-tabs-mobile {
              display: flex !important;
              flex-direction: row !important;
              padding-bottom: 0 !important;
              gap: 0 !important;
              overflow-x: auto;
            }
            .nav-tabs-mobile button {
              padding: 0.5rem 0.9rem !important;
              border-radius: 0 !important;
              border-bottom: 2.5px solid transparent !important;
              font-size: 0.85rem !important;
            }
          }
        `}</style>

      </div>
    </nav>
  );
}