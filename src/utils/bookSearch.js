import { buildCoverUrl, parseYear } from './formatters';

/**
 * Normalizza un risultato grezzo in formato uniforme.
 */
function normalize({ title, author, publisher, year, isbn, cover_url }) {
  return { title, author, publisher, year, isbn, cover_url };
}

/**
 * Ricerca su Google Books con query generica.
 */
async function searchGoogleBooks(query) {
  try {
    const q   = encodeURIComponent(query);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=10&langRestrict=it`);
    const data = await res.json();
    const items = data.items || [];
    return items.map(item => {
      const v = item.volumeInfo || {};
      const rawIsbn = (v.industryIdentifiers || [])
        .find(x => x.type === 'ISBN_13' || x.type === 'ISBN_10')?.identifier || null;
      return normalize({
        title:     v.title || '',
        author:    (v.authors || [])[0] || '',
        publisher: v.publisher || '',
        year:      v.publishedDate ? parseInt(v.publishedDate.slice(0, 4)) : null,
        isbn:      rawIsbn,
        cover_url: v.imageLinks?.thumbnail?.replace('http:', 'https:') ||
                   (rawIsbn ? `https://covers.openlibrary.org/b/isbn/${rawIsbn}-M.jpg` : null),
      });
    }).filter(b => b.title);
  } catch (_) { return []; }
}

/**
 * Ricerca su Google Books con operatore intitle: per titoli esatti.
 * Più preciso per titoli in italiano.
 */
async function searchGoogleBooksIntitle(query) {
  try {
    const q   = encodeURIComponent(`intitle:${query}`);
    // Senza langRestrict per catturare anche edizioni straniere dello stesso titolo
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=10`);
    const data = await res.json();
    const items = data.items || [];
    return items.map(item => {
      const v = item.volumeInfo || {};
      const rawIsbn = (v.industryIdentifiers || [])
        .find(x => x.type === 'ISBN_13' || x.type === 'ISBN_10')?.identifier || null;
      return normalize({
        title:     v.title || '',
        author:    (v.authors || [])[0] || '',
        publisher: v.publisher || '',
        year:      v.publishedDate ? parseInt(v.publishedDate.slice(0, 4)) : null,
        isbn:      rawIsbn,
        cover_url: v.imageLinks?.thumbnail?.replace('http:', 'https:') ||
                   (rawIsbn ? `https://covers.openlibrary.org/b/isbn/${rawIsbn}-M.jpg` : null),
      });
    }).filter(b => b.title);
  } catch (_) { return []; }
}

/**
 * Ricerca su OpenLibrary per titolo (campo dedicato, più preciso).
 */
async function searchOpenLibraryTitle(query) {
  try {
    const res  = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=10&fields=title,author_name,publisher,first_publish_year,isbn,cover_i,language`
    );
    const data = await res.json();
    return (data.docs || [])
      .filter(d => d.title)
      .map(d => normalize({
        title:     d.title,
        author:    d.author_name?.[0] || '',
        publisher: d.publisher?.[0]   || '',
        year:      d.first_publish_year || null,
        isbn:      d.isbn?.[0]         || null,
        cover_url: buildCoverUrl(d.cover_i, d.isbn),
      }))
      .sort((a, b) => (b.cover_url ? 1 : 0) - (a.cover_url ? 1 : 0));
  } catch (_) { return []; }
}

/**
 * Ricerca su OpenLibrary per query generica.
 */
async function searchOpenLibraryGeneral(query) {
  try {
    const res  = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=title,author_name,publisher,first_publish_year,isbn,cover_i`
    );
    const data = await res.json();
    return (data.docs || [])
      .filter(d => d.title)
      .map(d => normalize({
        title:     d.title,
        author:    d.author_name?.[0] || '',
        publisher: d.publisher?.[0]   || '',
        year:      d.first_publish_year || null,
        isbn:      d.isbn?.[0]         || null,
        cover_url: buildCoverUrl(d.cover_i, d.isbn),
      }))
      .sort((a, b) => (b.cover_url ? 1 : 0) - (a.cover_url ? 1 : 0));
  } catch (_) { return []; }
}

/**
 * Ricerca per ISBN su OpenLibrary (endpoint diretto).
 */
async function searchOpenLibraryISBN(isbn) {
  try {
    const clean = isbn.replace(/-/g, '');
    const res   = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`);
    const data  = await res.json();
    const book  = data[`ISBN:${clean}`];
    if (!book) return [];
    return [normalize({
      title:     book.title,
      author:    book.authors?.[0]?.name   || '',
      publisher: book.publishers?.[0]?.name || '',
      year:      parseYear(book.publish_date),
      isbn:      clean,
      cover_url: book.cover?.large || book.cover?.medium ||
                 `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg`,
    })];
  } catch (_) { return []; }
}

/**
 * De-duplica i risultati per titolo (case-insensitive).
 */
function dedup(results) {
  const seen = new Set();
  return results.filter(r => {
    const key = r.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Ricerca libri multi-source con fallback progressivo.
 * Restituisce un array normalizzato de-duplicato.
 */
export async function searchBooks(query) {
  const isISBN = /^[\d-]{9,}$/.test(query.trim());

  if (isISBN) {
    const isbn = query.replace(/-/g, '');
    // Per ISBN: Google Books prima, poi OpenLibrary diretto
    const [gb, ol] = await Promise.all([
      searchGoogleBooks(`isbn:${isbn}`),
      searchOpenLibraryISBN(isbn),
    ]);
    return dedup([...gb, ...ol]);
  }

  // Per testo: lancia tutte le fonti in parallelo
  const [gbGeneral, gbIntitle, olTitle, olGeneral] = await Promise.all([
    searchGoogleBooks(query),
    searchGoogleBooksIntitle(query),
    searchOpenLibraryTitle(query),
    searchOpenLibraryGeneral(query),
  ]);

  const merged = dedup([...gbGeneral, ...gbIntitle, ...olTitle, ...olGeneral]);

  // Priorità: prima i risultati con copertina
  return merged.sort((a, b) => (b.cover_url ? 1 : 0) - (a.cover_url ? 1 : 0));
}