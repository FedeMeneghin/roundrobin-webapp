/**
 * Shared formatting utilities.
 */

/** Format an ISO date string to a long Italian locale string. */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/**
 * Extract a 4-digit year from a possibly ambiguous string.
 * Returns an integer or null.
 */
export function parseYear(str) {
  if (!str) return null;
  const m = String(str).match(/\d{4}/);
  return m ? parseInt(m[0]) : null;
}

/**
 * Build the best available cover URL from OpenLibrary metadata.
 * @param {number|null} cover_i   – OpenLibrary cover id
 * @param {string[]}    isbnList  – list of ISBN strings
 */
export function buildCoverUrl(cover_i, isbnList) {
  if (cover_i) return `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`;
  for (const isbn of (isbnList || [])) {
    const clean = isbn.replace(/-/g, '');
    if (clean.length === 13 || clean.length === 10)
      return `https://covers.openlibrary.org/b/isbn/${clean}-M.jpg`;
  }
  return null;
}

/** Serialise an event object to an ICS string. */
export function toICS(event) {
  const uid   = event.id + '@roundrobin';
  const dt    = event.date.replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  const desc  = event.notes ? event.notes.replace(/\n/g, '\\n') : '';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Round Robin Book Club//IT',
    'BEGIN:VEVENT',
    `UID:${uid}`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dt}`, `DTEND;VALUE=DATE:${dt}`,
    `SUMMARY:${event.title}`, `DESCRIPTION:${desc}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

/** Trigger a browser download of an .ics file for the given event. */
export function downloadICS(event) {
  const blob = new Blob([toICS(event)], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${event.title}.ics`; a.click();
  URL.revokeObjectURL(url);
}

/** Genera un URL Google Maps da una stringa di luogo. */
export function mapsUrl(location) {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}