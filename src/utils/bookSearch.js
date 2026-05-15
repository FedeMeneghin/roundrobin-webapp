import { buildCoverUrl, parseYear } from './formatters';

/**
 * Search books via Google Books (primary) with OpenLibrary as fallback.
 * Returns an array of normalised book objects.
 */
export async function searchBooks(query) {
  const isISBN = /^[\d-]{9,}$/.test(query.trim());
  const isbn   = isISBN ? query.replace(/-/g, '') : null;

  // ── Google Books (primary) ────────────────────────────────
  try {
    const q    = isISBN ? `isbn:${isbn}` : encodeURIComponent(query);
    const res  = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=8`);
    const data = await res.json();
    const items = data.items || [];
    if (items.length > 0) {
      return items.map(item => {
        const v = item.volumeInfo || {};
        const rawIsbn = (v.industryIdentifiers || [])
          .find(x => x.type === 'ISBN_13' || x.type === 'ISBN_10')?.identifier || null;
        return {
          title:     v.title || '',
          author:    (v.authors || [])[0] || '',
          publisher: v.publisher || '',
          year:      v.publishedDate ? parseInt(v.publishedDate.slice(0, 4)) : null,
          isbn:      rawIsbn,
          cover_url: v.imageLinks?.thumbnail?.replace('http:', 'https:') ||
                     (rawIsbn ? `https://covers.openlibrary.org/b/isbn/${rawIsbn}-M.jpg` : null),
        };
      }).filter(b => b.title);
    }
  } catch (_) {}

  // ── OpenLibrary fallback (ISBN lookup) ────────────────────
  if (isISBN) {
    try {
      const res  = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const data = await res.json();
      const book = data[`ISBN:${isbn}`];
      if (book) return [{
        title:     book.title,
        author:    book.authors?.[0]?.name || '',
        publisher: book.publishers?.[0]?.name || '',
        year:      parseYear(book.publish_date),
        isbn,
        cover_url: book.cover?.large || book.cover?.medium ||
                   `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
      }];
    } catch (_) {}
  }

  // ── OpenLibrary fallback (text search) ───────────────────
  try {
    const res  = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8` +
      `&fields=title,author_name,publisher,first_publish_year,isbn,cover_i`
    );
    const data = await res.json();
    return (data.docs || [])
      .filter(d => d.title)
      .map(d => ({
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
