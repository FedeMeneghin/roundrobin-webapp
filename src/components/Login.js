import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabase';

const palette = {
  bg: '#faf8f4',
  card: '#ffffff',
  accent: '#7a9e7e',
  accentLight: '#e8f0e9',
  muted: '#888',
  border: '#e8e4de',
  beige: '#f2ece2',
};

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!name.trim() || !password) return;
    setLoading(true);
    setError(null);

    const { data: member, error: fetchError } = await supabase
      .from('members')
      .select('*')
      .ilike('name', name.trim())
      .single();

    if (fetchError || !member) {
      setError('Pirata non trovato. Registrati prima!');
      setLoading(false);
      return;
    }

    if (!member.password_hash) {
      setError('Questo pirata non ha ancora una password. Registrati!');
      setLoading(false);
      return;
    }

    const valid = await bcrypt.compare(password, member.password_hash);
    if (!valid) {
      setError('Password errata, pirata! Riprova.');
      setLoading(false);
      return;
    }

    onLogin(member);
    setLoading(false);
  }

  async function handleRegister() {
    if (!name.trim() || !password) return;
    if (password.length < 4) { setError('La password deve essere di almeno 4 caratteri.'); return; }
    setLoading(true);
    setError(null);

    // Controlla se il nome esiste già
    const { data: existing } = await supabase
      .from('members')
      .select('id, password_hash')
      .ilike('name', name.trim())
      .maybeSingle();

    if (existing && existing.password_hash) {
      setError('Questo nome è già registrato. Fai il login!');
      setLoading(false);
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    if (existing && !existing.password_hash) {
      // Il Capitano aveva già creato il membro — aggiorniamo solo la password
      await supabase.from('members').update({ password_hash: hash }).eq('id', existing.id);
      const { data: updated } = await supabase.from('members').select('*').eq('id', existing.id).single();
      onLogin(updated);
    } else {
      // Nuovo pirata — creiamo il membro
      const { data: newMember, error: insertError } = await supabase
        .from('members')
        .insert({ name: name.trim(), password_hash: hash })
        .select('*')
        .single();
      if (insertError) { setError(insertError.message); setLoading(false); return; }
      onLogin(newMember);
    }

    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: palette.card, border: `1px solid ${palette.border}`, borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏴‍☠️</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: palette.accent }}>Il Book Club dei Pirati</div>
          <div style={{ color: palette.muted, fontSize: '0.9rem', marginTop: '0.3rem' }}>
            {mode === 'login' ? 'Bentornato a bordo!' : 'Unisciti all\'equipaggio!'}
          </div>
        </div>

        {/* Toggle login/registrazione */}
        <div style={{ display: 'flex', background: palette.beige, borderRadius: '8px', padding: '3px', marginBottom: '1.5rem' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); }}
              style={{ flex: 1, background: mode === m ? palette.accent : 'transparent', color: mode === m ? '#fff' : palette.muted, border: 'none', borderRadius: '6px', padding: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
              {m === 'login' ? '🔑 Accedi' : '⚓ Registrati'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: palette.muted, display: 'block', marginBottom: '0.3rem' }}>Nome del pirata</label>
            <input
              style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.7rem', width: '100%', fontSize: '0.95rem', background: palette.bg, boxSizing: 'border-box' }}
              placeholder="Come ti chiami?"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: palette.muted, display: 'block', marginBottom: '0.3rem' }}>Password</label>
            <input
              type="password"
              style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.7rem', width: '100%', fontSize: '0.95rem', background: palette.bg, boxSizing: 'border-box' }}
              placeholder="La tua password segreta"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
            />
          </div>

          {error && <div style={{ color: '#e07070', fontSize: '0.85rem', background: '#fdf0f0', border: '1px solid #f0d0d0', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>{error}</div>}

          <button
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            style={{ background: palette.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.8rem', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Caricamento...' : mode === 'login' ? '🔑 Accedi' : '⚓ Registrati'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: palette.muted }}>
          Sei il Capitano?{' '}
          <span onClick={() => onLogin('capitano')} style={{ color: palette.accent, cursor: 'pointer', textDecoration: 'underline' }}>
            Accedi come Capitano
          </span>
        </div>
      </div>
    </div>
  );
}