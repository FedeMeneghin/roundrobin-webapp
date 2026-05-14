import React, { useState } from 'react';
import { color, font, text, space, radius, btn } from '../theme';

const tabs = [
  { id: 'home',     label: 'Home',          icon: '🏠' },
  { id: 'calendar', label: 'Calendario',    icon: '📅' },
  { id: 'library',  label: 'Libreria',      icon: '📚' },
  { id: 'libsugg',  label: 'Prop. libreria',icon: '🏛️' },
  { id: 'usersugg', label: 'Prop. pirati',  icon: '💬' },
  { id: 'voting',   label: 'Votazione',     icon: '🗳️' },
  { id: 'members',  label: 'Pirati',        icon: '👥' },
];

export default function Navbar({ activeTab, setActiveTab, isCapitano, currentMember, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .rr-nav {
          background: ${color.surface};
          border-bottom: 1px solid ${color.border};
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 8px rgba(18,43,38,0.06);
        }
        .rr-nav-inner {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 ${space[5]};
        }
        .rr-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
        }
        .rr-logo {
          font-family: ${font.heading};
          font-weight: 800;
          font-size: ${text.lg};
          color: ${color.primary};
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: ${space[2]};
          flex-shrink: 0;
        }
        .rr-user {
          display: flex;
          align-items: center;
          gap: ${space[3]};
          flex-shrink: 0;
        }
        .rr-username {
          color: ${color.textSoft};
          font-size: ${text.sm};
          font-family: ${font.body};
          font-weight: 600;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rr-cap-badge {
          background: ${color.primarySoft};
          color: ${color.primaryDark};
          border-radius: ${radius.pill};
          padding: 0.2rem 0.7rem;
          font-size: ${text.xs};
          font-weight: 700;
          font-family: ${font.body};
          flex-shrink: 0;
        }
        .rr-hamburger {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.3rem;
          color: ${color.textSoft};
          display: none;
          padding: ${space[2]};
          border-radius: ${radius.sm};
        }

        /* Tab bar */
        .rr-tabs {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          gap: 0;
          border-top: 1px solid ${color.border};
        }
        .rr-tabs::-webkit-scrollbar { display: none; }

        .rr-tab {
          display: flex;
          align-items: center;
          gap: ${space[1]};
          padding: ${space[3]} ${space[4]};
          border: none;
          border-bottom: 2.5px solid transparent;
          background: transparent;
          cursor: pointer;
          font-size: ${text.sm};
          font-family: ${font.body};
          font-weight: 500;
          color: ${color.textSoft};
          white-space: nowrap;
          flex-shrink: 0;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .rr-tab:hover { color: ${color.text}; }
        .rr-tab.active {
          color: ${color.primary};
          font-weight: 700;
          border-bottom-color: ${color.primary};
        }

        /* Mobile: hamburger + dropdown */
        @media (max-width: 639px) {
          .rr-hamburger { display: flex; }
          .rr-username  { display: none; }
          .rr-tabs {
            display: ${`var(--menu-open, none)`};
            flex-direction: column;
            border-top: 1px solid ${color.border};
            padding-bottom: ${space[3]};
          }
          .rr-tabs.open { display: flex; }
          .rr-tab {
            border-bottom: none;
            border-left: 3px solid transparent;
            padding: ${space[3]} ${space[5]};
            font-size: ${text.md};
            justify-content: flex-start;
            width: 100%;
          }
          .rr-tab.active {
            border-left-color: ${color.primary};
            border-bottom-color: transparent;
            background: ${color.primarySoft};
          }
        }
      `}</style>

      <nav className="rr-nav">
        <div className="rr-nav-inner">

          {/* Top bar */}
          <div className="rr-topbar">
            <div className="rr-logo">
              🏴‍☠️ Round Robin
            </div>
            <div className="rr-user">
              {isCapitano && <span className="rr-cap-badge">⚓ Capitano</span>}
              <span className="rr-username">{currentMember?.name}</span>
              <button onClick={onLogout} style={{ ...btn.ghost, padding: `${space[2]} ${space[4]}`, fontSize: text.xs }}>
                Esci
              </button>
              <button className="rr-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className={`rr-tabs${menuOpen ? ' open' : ''}`}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`rr-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

        </div>
      </nav>
    </>
  );
}