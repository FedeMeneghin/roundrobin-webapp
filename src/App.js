import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Members from './components/Members';

const palette = {
  bg: '#faf8f4',
  card: '#ffffff',
  accent: '#7a9e7e',
  muted: '#888',
  border: '#e8e4de',
};

// Password segreta del Capitano
const CAPITANO_PASSWORD = 'kraken123';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isCapitano, setIsCapitano] = useState(false);

  // Gestione accesso Capitano con password
  function handleSetCapitano(value) {
    if (value === true) {
      const pwd = window.prompt('⚓ Inserisci la password del Capitano:');
      if (pwd === CAPITANO_PASSWORD) {
        setIsCapitano(true);
      } else {
        window.alert('❌ Password errata, pirata!');
      }
    } else {
      setIsCapitano(false);
    }
  }

  // Qui aggiungeremo altri componenti man mano
  function renderTab() {
    switch (activeTab) {
      case 'members':
        return <Members isCapitano={isCapitano} />;
      default:
        return (
          <div style={{ background: palette.card, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '2rem', textAlign: 'center', color: palette.muted, fontFamily: 'Georgia, serif' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏴‍☠️</div>
            <div style={{ fontSize: '1.2rem' }}>Sezione in costruzione...</div>
            <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Vai su <strong>👥 Pirati</strong> per vedere la prima sezione funzionante!</div>
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
        setIsCapitano={handleSetCapitano}
      />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
        {renderTab()}
      </main>
    </div>
  );
}