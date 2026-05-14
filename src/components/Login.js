import React, { useState } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabase';
import { color, font, text, space, radius, shadow, heading, btn, input as inputStyle } from '../theme';

export default function Login({ onLogin }) {
  const [mode,     setMode]     = useState('login'); // 'login' | 'register'
  const [name,     setName]     = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  function switchMode(m) { setMode(m); setError(null); setPassword(''); }

  async function handleLogin() {
    if (!name.trim() || !password) return;
    setLoading(true); setError(null);

    const { data: member, error: fetchError } = await supabase
      .from('members').select('*').ilike('name', name.trim()).single();

    if (fetchError || !member) {
      setError('Pirata non trovato. Registrati prima!');
      setLoading(false); return;
    }
    if (!member.password_hash) {
      setError('Questo pirata non ha ancora una password. Registrati!');
      setLoading(false); return;
    }

    const valid = await bcrypt.compare(password, member.password_hash);
    if (!valid) { setError('Password errata, pirata! Riprova.'); setLoading(false); return; }

    onLogin(member);
    setLoading(false);
  }

  async function handleRegister() {
    if (!name.trim() || !password) return;
    if (password.length < 4) { setError('La password deve avere almeno 4 caratteri.'); return; }
    setLoading(true); setError(null);

    const { data: existing } = await supabase
      .from('members').select('id, password_hash').ilike('name', name.trim()).maybeSingle();

    if (existing?.password_hash) {
      setError('Questo nome è già registrato. Fai il login!');
      setLoading(false); return;
    }

    const hash = await bcrypt.hash(password, 10);

    if (existing && !existing.password_hash) {
      // Il Capitano aveva già creato il membro — aggiungiamo solo la password
      await supabase.from('members').update({ password_hash: hash }).eq('id', existing.id);
      const { data: updated } = await supabase.from('members').select('*').eq('id', existing.id).single();
      onLogin(updated);
    } else {
      // Nuovo pirata — lo creiamo
      const { data: newMember, error: insertError } = await supabase
        .from('members').insert({ name: name.trim(), password_hash: hash }).select('*').single();
      if (insertError) { setError(insertError.message); setLoading(false); return; }
      onLogin(newMember);
    }

    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleRegister();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: ${font.body}; background: ${color.bg}; }

        .rr-mode-btn {
          flex: 1;
          border: none;
          border-radius: ${radius.sm};
          padding: ${space[3]} ${space[4]};
          cursor: pointer;
          font-size: ${text.sm};
          font-weight: 700;
          font-family: ${font.body};
          transition: all 0.18s ease;
        }
        .rr-mode-btn.active {
          background: ${color.primary};
          color: #fff;
          box-shadow: 0 4px 14px rgba(24,180,141,0.28);
        }
        .rr-mode-btn.inactive {
          background: transparent;
          color: ${color.muted};
        }
        .rr-mode-btn.inactive:hover { color: ${color.text}; }

        .rr-submit-btn {
          width: 100%;
          padding: ${space[4]};
          font-size: ${text.md};
          font-weight: 700;
          font-family: ${font.body};
          background: ${color.primary};
          color: #fff;
          border: none;
          border-radius: ${radius.pill};
          cursor: pointer;
          margin-top: ${space[2]};
          box-shadow: 0 4px 14px rgba(24,180,141,0.28);
          transition: all 0.18s ease;
        }
        .rr-submit-btn:hover:not(:disabled) {
          background: ${color.primaryHover};
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(24,180,141,0.34);
        }
        .rr-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .rr-input:focus {
          outline: none;
          border-color: ${color.primary} !important;
          box-shadow: 0 0 0 3px ${color.primarySoft};
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: color.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: space[4],
        fontFamily: font.body,
      }}>
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: space[6] }}>

          {/* Logo */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: space[3] }}>🏴‍☠️</div>
            <div style={{ ...heading.xl, textAlign: 'center' }}>Round Robin</div>
            <div style={{ color: color.muted, fontSize: text.sm, marginTop: space[2] }}>
              {mode === 'login' ? 'Bentornato a bordo!' : "Unisciti all'equipaggio!"}
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: color.surface,
            borderRadius: radius.lg,
            boxShadow: shadow.md,
            border: `1px solid ${color.border}`,
            padding: space[8],
          }}>

            {/* Toggle login / registrazione */}
            <div style={{
              display: 'flex',
              background: color.bgSoft,
              borderRadius: radius.md,
              padding: '4px',
              marginBottom: space[6],
              gap: '4px',
            }}>
              <button className={`rr-mode-btn ${mode === 'login' ? 'active' : 'inactive'}`}
                onClick={() => switchMode('login')}>
                🔑 Accedi
              </button>
              <button className={`rr-mode-btn ${mode === 'register' ? 'active' : 'inactive'}`}
                onClick={() => switchMode('register')}>
                ⚓ Registrati
              </button>
            </div>

            {/* Campi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: space[4] }}>
              <div>
                <label style={{ fontSize: text.xs, color: color.textSoft, fontWeight: '600', display: 'block', marginBottom: space[2] }}>
                  Nome del pirata
                </label>
                <input
                  className="rr-input"
                  style={{ ...inputStyle }}
                  placeholder="Come ti chiami?"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(null); }}
                  onKeyDown={handleKey}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: text.xs, color: color.textSoft, fontWeight: '600', display: 'block', marginBottom: space[2] }}>
                  Password
                  {mode === 'register' && (
                    <span style={{ color: color.muted, fontWeight: '400', marginLeft: space[2] }}>
                      (minimo 4 caratteri)
                    </span>
                  )}
                </label>
                <input
                  className="rr-input"
                  type="password"
                  style={{ ...inputStyle }}
                  placeholder="La tua password segreta"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  onKeyDown={handleKey}
                />
              </div>

              {/* Errore */}
              {error && (
                <div style={{
                  color: color.danger,
                  background: color.dangerSoft,
                  border: `1px solid ${color.danger}30`,
                  borderRadius: radius.sm,
                  padding: `${space[3]} ${space[4]}`,
                  fontSize: text.sm,
                  fontFamily: font.body,
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                className="rr-submit-btn"
                onClick={mode === 'login' ? handleLogin : handleRegister}
                disabled={loading || !name.trim() || !password}
              >
                {loading
                  ? 'Caricamento...'
                  : mode === 'login' ? '🔑 Accedi' : '⚓ Registrati'}
              </button>
            </div>

            {/* Link Capitano */}
            <div style={{ textAlign: 'center', marginTop: space[5], fontSize: text.xs, color: color.muted }}>
              Sei il Capitano?{' '}
              <span
                onClick={() => onLogin('capitano')}
                style={{ color: color.primary, cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
                Accedi come Capitano
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}