import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { color, font, text, space, radius, shadow, heading, btn, badge } from '../../theme';
import { useProposals } from '../../hooks/useSupabase';
import ProposalForm from './ProposalForm';
import ProposalCard from './ProposalCard';

export default function Proposals({ isCapitano, currentMember, source }) {
  const isLibrary = source === 'library';
  const { data: proposals, loading, error: fetchError, refetch } = useProposals(source);
  const [error]   = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  async function removeProposal(proposalId, bookId) {
    if (!window.confirm('Rimuovere questa proposta?')) return;
    await supabase.from('proposals').delete().eq('id', proposalId);
    await supabase.from('books').delete().eq('id', bookId);
    refetch();
  }

  async function promoteToLibrary(proposalId, bookId) {
    if (!window.confirm('Spostare questo libro in libreria come completato?')) return;
    await supabase.from('books').update({ status: 'completed', selected_date: new Date().toISOString().slice(0, 10) }).eq('id', bookId);
    await supabase.from('proposals').delete().eq('id', proposalId);
    refetch();
  }

  async function setBookOfMonth(proposalId, bookId, bookTitle) {
    if (!window.confirm(`Impostare "${bookTitle}" come libro del mese?`)) return;
    await supabase.from('books').update({ status: 'backlog', selected_date: null }).eq('status', 'active');
    await supabase.from('books').update({ status: 'active', selected_date: new Date().toISOString().slice(0, 10) }).eq('id', bookId);
    await supabase.from('proposals').delete().eq('id', proposalId);
    refetch();
  }

  const canAdd       = isLibrary ? isCapitano : !!currentMember;
  const displayError = error || fetchError;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space[5] }}>
      <style>{`
        .rr-proposal-card:hover { box-shadow: 0 8px 28px rgba(18,43,38,0.11) !important; transform: translateY(-2px); }
        .rr-proposal-card { transition: all 0.18s ease; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space[3] }}>
          <div style={heading.section}>
            {isLibrary ? '🏛️ Proposte libreria' : '💬 Proposte partecipanti'}
          </div>
          <span style={{ ...badge(color.bgSoft, color.textSoft), fontSize: text.xs }}>
            {(proposals || []).length}
          </span>
        </div>
        {canAdd ? (
          <button onClick={() => setShowAdd(!showAdd)} style={btn.primary}>
            {showAdd ? 'Annulla' : '+ Proponi'}
          </button>
        ) : (
          <span style={{ fontSize: text.xs, color: color.muted, fontFamily: font.body }}>
            {isLibrary ? 'Solo il Capitano può aggiungere' : 'Accedi per proporre'}
          </span>
        )}
      </div>

      {displayError && (
        <div style={{ color: color.danger, fontSize: text.sm, fontFamily: font.body }}>{displayError}</div>
      )}

      {showAdd && (
        <ProposalForm
          isCapitano={isCapitano}
          currentMember={currentMember}
          isLibrary={isLibrary}
          source={source}
          onSubmitted={() => { setShowAdd(false); refetch(); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {loading ? (
        <div style={{ color: color.muted, fontSize: text.sm, fontFamily: font.body, padding: space[4] }}>Caricamento proposte...</div>
      ) : !(proposals || []).length ? (
        <div style={{ background: color.surface, borderRadius: radius.md, boxShadow: shadow.sm, border: `1px solid ${color.border}`, padding: `${space[10]} ${space[6]}`, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: space[3] }}>📋</div>
          <div style={{ color: color.muted, fontFamily: font.body, fontSize: text.md }}>Nessuna proposta ancora.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: space[4] }}>
          {proposals.map(p => (
            <ProposalCard
              key={p.id}
              p={p}
              isLibrary={isLibrary}
              isCapitano={isCapitano}
              onSetBookOfMonth={setBookOfMonth}
              onPromote={promoteToLibrary}
              onRemove={removeProposal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
