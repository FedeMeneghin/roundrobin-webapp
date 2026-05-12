import React, { useState } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Members from './components/Members';
import Library from './components/Library';
import Proposals from './components/Proposals';
import Home from './components/Home';

const palette = {
  bg: '#faf8f4',
  card: '#ffffff',
  accent: '#7a9e7e',
  muted: '#888',
  border: '#e8e4de',
};

const CAPITANO_PASSWORD = 'kraken123';

export default function App() {
  const [currentMember, setCurrentMember] = useState(null); // oggetto membro o 'capitano'
  const [isCapitano, setIsCapitano] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  function handleLogin(member) {
    if (member === 'capitano') {
      const pwd = window.prompt('⚓ Inserisci la password del Capitano:');
      if (pwd === CAPITANO_PASSWORD) {
        setIsCapitano(true);
        setCurrentMember({ name: 'Capitano' });
      } else {
        window.alert('❌ Password errata, pirata!');
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

  // Mostra login se non autenticato
  if (!currentMember) {
    return <Login onLogin={handleLogin} />;
  }

  function renderTab() {
    switch (activeTab) {
      case 'library':
        return <Library isCapitano={isCapitano} currentMember={isCapitano ? null : currentMember} />;
      case 'libsugg':
        return <Proposals isCapitano={isCapitano} currentMember={isCapitano ? null : currentMember} source="library" />;
      case 'usersugg':
        return <Proposals isCapitano={isCapitano} currentMember={isCapitano ? null : currentMember} source="user" />;
      case 'members':
        return <Members isCapitano={isCapitano} />;
      case 'home':
        return <Home currentMember={currentMember} isCapitano={isCapitano} />;
      default:
        return (
          <div style={{ background: '#fff', border: '1px solid #e8e4de', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#888', fontFamily: 'Georgia, serif' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏴‍☠️</div>
            <div>Sezione in costruzione...</div>
          </div>
        );
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.bg }}>
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