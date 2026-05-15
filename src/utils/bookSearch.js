const GOOGLE_BOOKS_API_KEY = 'AIzaSyDHGEpKMY4t3kw_-2uPvl0cc26yVZUWKEk';

function parseYear(value) {
  if (!value) return null;
  const match = String(value).match(/\b(18|19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function normalizeIsbn(value) {
  return String(value || '').replace(/[^0-9Xx]/g, '').toUpperCase();
}

function buildOpenLibraryCover(coverId, isbn) {
  if (coverId) return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  return '';
}

function withGoogleKey(url) {
  if (!GOOGLE_BOOKS_API_KEY) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}key=${encodeURIComponent(GOOGLE_BOOKS_API_KEY)}`;
}

function normalizeGoogleBook(item) {
  const info = item?.volumeInfo || {};
  const ids = Array.isArray(info.industryIdentifiers) ? info.industryIdentifiers : [];
  const isbn13 = ids.find(x => x.type === 'ISBN_13')?.identifier || '';
  const isbn10 = ids.find(x => x.type === 'ISBN_10')?.identifier || '';
  const isbn = normalizeIsbn(isbn13 || isbn10);

  return {
    title: info.title || '',
    author: Array.isArray(info.authors) ? info.authors.join(', ') : '',
    publication_year: parseYear(info.publishedDate),
    publisher: info.publisher || '',
    cover_url:
      info.imageLinks?.thumbnail?.replace(/^http:/, 'https:') ||
      info.imageLinks?.smallThumbnail?.replace(/^http:/, 'https:') ||
      '',
    isbn,
    source: 'google',
  };
}

function normalizeOpenLibraryBook(doc) {
  const isbn = normalizeIsbn(Array.isArray(doc.isbn) ? doc.isbn[0] : '');
  const coverId = doc.cover_i || null;

  return {
    title: doc.title || '',
    author: Array.isArray(doc.author_name) ? doc.author_name.join(', ') : '',
    publication_year: doc.first_publish_year || null,
    publisher: Array.isArray(doc.publisher) ? doc.publisher[0] : '',
    cover_url: buildOpenLibraryCover(coverId, isbn),
    isbn,
    source: 'openlibrary',
  };
}

function scoreBook(book, query) {
  const q = query.trim().toLowerCase();
  const title = (book.title || '').toLowerCase();
  const author = (book.author || '').toLowerCase();
  const publisher = (book.publisher || '').toLowerCase();

  let score = 0;

  if (title === q) score += 120;
  if (title.startsWith(q)) score += 60;
  if (title.includes(q)) score += 35;
  if (author.includes(q)) score += 15;
  if (publisher.includes(q)) score += 8;
  if (book.cover_url) score += 10;
  if (book.isbn) score += 10;
  if (book.publication_year) score += 6;
  if (book.publisher) score += 6;
  if (book.source === 'google') score += 5;

  return score;
}

function dedupeBooks(items) {
  const seen = new Set();

  return items.filter(book => {
    const key = book.isbn
      ? `isbn:${book.isbn}`
      : `${(book.title || '').trim().toLowerCase()}|${(book.author || '').trim().toLowerCase()}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchGoogleBooks(url) {
  const res = await fetch(withGoogleKey(url));
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google Books error ${res.status} ${text}`);
  }
  const json = await res.json();
  return Array.isArray(json.items) ? json.items.map(normalizeGoogleBook) : [];
}

async function fetchOpenLibrary(query, isISBN, isbn) {
  const url = isISBN
    ? `https://openlibrary.org/search.json?isbn=${encodeURIComponent(isbn)}&limit=10`
    : `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=10`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenLibrary error ${res.status}`);

  const json = await res.json();
  return Array.isArray(json.docs) ? json.docs.map(normalizeOpenLibraryBook) : [];
}

export async function searchBooks(query) {
  const raw = String(query || '').trim();
  if (!raw) return [];

  const isISBN = /^[\d\- ]{9,}$/.test(raw);
  const isbn = normalizeIsbn(raw);

  const googleAttempts = isISBN
    ? [
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&printType=books&maxResults=10`,
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(isbn)}&printType=books&maxResults=10`,
      ]
    : [
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`intitle:"${raw}"`)}&printType=books&langRestrict=it&maxResults=10`,
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(raw)}&printType=books&langRestrict=it&maxResults=10`,
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(raw)}&printType=books&maxResults=10`,
      ];

  let results = [];

  for (const url of googleAttempts) {
    try {
      const items = await fetchGoogleBooks(url);
      results = results.concat(items);
      if (results.length >= 5) break;
    } catch (_) {}
  }

  if (results.length < 5) {
    try {
      const openLibraryItems = await fetchOpenLibrary(raw, isISBN, isbn);
      results = results.concat(openLibraryItems);
    } catch (_) {}
  }

  return dedupeBooks(results)
    .filter(book => book.title)
    .sort((a, b) => scoreBook(b, raw) - scoreBook(a, raw))
    .slice(0, 10);
}