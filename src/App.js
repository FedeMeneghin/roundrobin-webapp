import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function App() {
  const [status, setStatus] = useState('Connessione in corso...');

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('members').select('*');
      if (error) {
        setStatus('❌ Errore: ' + error.message);
      } else {
        setStatus('✅ Connessione a Supabase riuscita! Membri nel db: ' + data.length);
      }
    }
    testConnection();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Book Club — Test Supabase</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;