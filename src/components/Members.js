import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { color, font, text, space, radius, shadow, heading, btn, input as inputStyle } from '../theme';

export default function Members({ isCapitano }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: true });
    if (error) setError(error.message);
    else setMembers(data);
    setLoading(false);
  }

  async function addMember() {
    if (!newName.trim()) return;
    const { error } = await supabase.from('members').insert({ name: newName.trim() });
    if (error) setError(error.message);
    else { setNewName(''); fetchMembers(); }
  }

  async function removeMember(id) {
    if (!window.confirm('Rimuovere questo pirata?')) return;
    const { error } = await supabase.from('members').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchMembers();
  }

  const avatarColors = [
    [color.primarySoft, color.primaryDark],
    [color.warningSoft, '#b07400'],
    [color.successSoft, color.success],
    [color.dangerSoft, color.danger],
    ['#ede9fe', '#6d28d9'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>

      {/* Header */}
      <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: space[6] }}>
        <div style={{ ...heading.section, marginBottom: space[5] }}>
          👥 Pirati del Club ({members.length})
        </div>

        {error && (
          <div style={{ color: color.danger, fontSize: text.sm, marginBottom: space[4], fontFamily: font.body }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: color.muted, fontSize: text.sm, fontFamily: font.body }}>Caricamento pirati...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: `${space[8]} 0`, color: color.muted, fontFamily: font.body }}>
            <div style={{ fontSize: '2.5rem', marginBottom: space[3] }}>🏴‍☠️</div>
            <div style={{ fontSize: text.md }}>Nessun pirata ancora. Aggiungine uno!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: space[3] }}>
            {members.map((m, i) => {
              const [bg, fg] = avatarColors[i % avatarColors.length];
              return (
                <div key={m.id} style={{
                  background: color.bgSoft,
                  border: `1px solid ${color.border}`,
                  borderRadius: radius.md,
                  padding: space[4],
                  display: 'flex', alignItems: 'center', gap: space[3],
                  position: 'relative',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: radius.pill,
                    background: bg, color: fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: font.heading, fontWeight: '800', fontSize: text.lg,
                    flexShrink: 0,
                  }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <div style={{ fontFamily: font.body, fontWeight: '600', fontSize: text.sm, color: color.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.name}
                  </div>
                  {isCapitano && (
                    <button onClick={() => removeMember(m.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: color.muted, fontSize: '1rem', lineHeight: 1,
                      padding: space[1], borderRadius: radius.pill,
                      flexShrink: 0,
                    }} title="Rimuovi">
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Aggiungi membro — solo Capitano */}
        {isCapitano && (
          <div style={{ marginTop: space[6], borderTop: `1px solid ${color.border}`, paddingTop: space[5] }}>
            <div style={{ ...heading.md, marginBottom: space[3] }}>Aggiungi pirata</div>
            <div style={{ display: 'flex', gap: space[3] }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Nome del nuovo pirata"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMember()}
              />
              <button onClick={addMember} style={{ ...btn.primary, flexShrink: 0 }}>
                Aggiungi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}