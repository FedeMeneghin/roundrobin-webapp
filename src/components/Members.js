import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const palette = {
  bg: '#faf8f4',
  card: '#ffffff',
  accent: '#7a9e7e',
  accentLight: '#e8f0e9',
  text: '#2c2c2c',
  muted: '#888',
  border: '#e8e4de',
  beige: '#f2ece2',
};

export default function Members({ isCapitano }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setMembers(data);
    setLoading(false);
  }

  async function addMember() {
    if (!newName.trim()) return;
    const { error } = await supabase
      .from('members')
      .insert({ name: newName.trim() });
    if (error) setError(error.message);
    else { setNewName(''); fetchMembers(); }
  }

  async function removeMember(id) {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    if (error) setError(error.message);
    else fetchMembers();
  }

  if (loading) return <p style={{ padding: '2rem', color: palette.muted }}>Caricamento pirati...</p>;

  return (
    <div style={{ background: palette.card, border: `1px solid ${palette.border}`, borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: palette.accent, fontFamily: 'Georgia, serif' }}>
        👥 Pirati del Club ({members.length})
      </div>

      {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {members.map(m => (
          <div key={m.id} style={{ background: palette.beige, border: `1px solid ${palette.border}`, borderRadius: '20px', padding: '0.3rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
            <span>🏴‍☠️ {m.name}</span>
            {isCapitano && (
              <span
                onClick={() => removeMember(m.id)}
                style={{ cursor: 'pointer', color: palette.muted, fontSize: '0.8rem', marginLeft: '0.2rem' }}
              >✕</span>
            )}
          </div>
        ))}
        {members.length === 0 && <p style={{ color: palette.muted }}>Nessun pirata ancora. Aggiungine uno!</p>}
      </div>

      {isCapitano && (
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <input
            style={{ border: `1px solid ${palette.border}`, borderRadius: '8px', padding: '0.5rem 0.8rem', flex: 1, fontSize: '0.9rem', background: palette.bg }}
            placeholder="Nome del nuovo pirata"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMember()}
          />
          <button
            onClick={addMember}
            style={{ background: palette.accent, color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.1rem', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Aggiungi
          </button>
        </div>
      )}
    </div>
  );
}