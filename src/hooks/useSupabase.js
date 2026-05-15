import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

/**
 * Generic hook for a single Supabase SELECT query.
 * Re-runs whenever `deps` changes.
 *
 * @param {() => Promise<{data, error}>} queryFn  – returns a supabase promise
 * @param {any[]} deps                            – dependency array
 */
export function useSupabaseQuery(queryFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    const { data: rows, error: err } = await queryFn();
    if (err) setError(err.message);
    else     setData(rows ?? []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

/** Fetch all events ordered by date ascending. */
export function useEvents() {
  return useSupabaseQuery(
    () => supabase.from('events').select('*').order('date', { ascending: true }),
    []
  );
}

/** Fetch books filtered by status. */
export function useBooks(status) {
  return useSupabaseQuery(
    () => supabase
      .from('books')
      .select('*, authors(name, gender, nationality), book_ratings(member_id, has_read, rating)')
      .eq('status', status)
      .order('selected_date', { ascending: false }),
    [status]
  );
}

/** Fetch proposals filtered by source. */
export function useProposals(source) {
  return useSupabaseQuery(
    () => supabase
      .from('proposals')
      .select('id, source, proposed_by, books(id, title, genre, publisher, publication_year, isbn, cover_url, authors(name,gender,nationality)), members(name)')
      .eq('source', source)
      .order('created_at', { ascending: false }),
    [source]
  );
}
