import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Members from './components/Members';
import Library from './components/Library/Library';
import Proposals from './components/Proposals/Proposals';
import Home from './components/Home';
import Calendar from './components/Calendar/Calendar';
import { t } from './theme';

const CAPITANO_PASSWORD = 'kraken123';
const STORAGE_KEY = 'rr_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function saveSession(member, isCapitano) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ member, isCapitano }));
  } catch (_) {}
}

function clearSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
}

export default function App() {
  const saved = loadSession();
  const [currentMember, setCurrentMember] = useState(saved?.member     || null);
  const [isCapitano,    setIsCapitano]    = useState(saved?.isCapitano  || false);
  const [activeTab,     setActiveTab]     = useState('home');

  // Aggiorna localStorage ogni volta che cambia la sessione
  useEffect(() => {
    if (currentMember) saveSession(currentMember, isCapitano);
    else clearSession();
  }, [currentMember, isCapitano]);

  function handleLogin(member) {
    if (member === 'capitano') {
      const pwd = window.prompt('⚓ Inserisci la password del Capitano:');
      if (pwd === CAPITANO_PASSWORD) {
        setIsCapitano(true);
        setCurrentMember({ name: 'Capitano' });
      } else {
        window.alert('❌ Password errata!');
      }
    } else {
      setCurrentMember(member);
      setIsCapitano(false);
    }
  }

  function handleLogout() {
    setCurrentMember(null);
    setIsCapitano(false);
    setActiveTab('home');
  }

  if (!currentMember) {
    return <Login onLogin={handleLogin} />;
  }

  function renderTab() {
    switch (activeTab) {
      case 'home':
        return <Home currentMember={currentMember} isCapitano={isCapitano} />;
      case 'calendar':
        return <Calendar isCapitano={isCapitano} currentMember={isCapitano ? null : currentMember} />;
      case 'library':
        return <Library isCapitano={isCapitano} currentMember={isCapitano ? null : currentMember} />;
      case 'libsugg':
        return <Proposals isCapitano={isCapitano} currentMember={isCapitano ? null : currentMember} source="library" />;
      case 'usersugg':
        return <Proposals isCapitano={isCapitano} currentMember={isCapitano ? null : currentMember} source="user" />;
      case 'members':
        return <Members isCapitano={isCapitano} />;
      default:
        return (
          <div style={{ background: t.card, borderRadius: t.radius, padding: '2rem', textAlign: 'center', color: t.muted, fontFamily: t.fontSerif, boxShadow: t.shadow }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏴‍☠️</div>
            <div>Sezione in costruzione...</div>
          </div>
        );
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bgSoft }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCapitano={isCapitano}
        currentMember={currentMember}
        onLogout={handleLogout}
      />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
        {renderTab()}
      </main>
    </div>
  );
}