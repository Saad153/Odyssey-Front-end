// Turns whatever a save failed with - a rejected axios request, or a
// { status:'error', result:'...' } response body - into something the person
// filling in the form can actually act on.
//
// Messages thrown deliberately by the backend are already written for users
// (the fiscal-year guard in functions/Associations/fiscalYearAssociations
// names the year and says how to switch to it), so those are passed through
// untouched. What needs translating is the raw Postgres/Sequelize text that
// reaches the response when a constraint rejects the row - "invalid input
// syntax for type integer" tells the user nothing about which field to fix.

const DEFAULT_MESSAGE = 'The job could not be saved. Please try again.';

// Matched in order against the raw message; first hit wins. `message` may be
// a function to pull detail (e.g. the column name) out of the match.
const DB_ERROR_PATTERNS = [
  {
    test: /invalid input syntax for type (?:integer|numeric|double precision|bigint)/i,
    message:
      'A number or dropdown field was left blank or contains an invalid value. ' +
      'Check the numeric fields and any unselected dropdowns, then save again.',
  },
  {
    test: /null value in column "([^"]+)"[\s\S]*?not-null constraint/i,
    message: (m) =>
      `"${m[1]}" is required but was left empty. Fill it in and save again.`,
  },
  {
    test: /invalid input syntax for type (?:date|timestamp)/i,
    message:
      'One of the date or time fields is empty or invalid. Check the dates on ' +
      'the job and save again.',
  },
  {
    test: /violates foreign key constraint/i,
    message:
      'One of the selected records (client, vessel, agent, commodity, etc.) no ' +
      'longer exists. Re-select it and save again.',
  },
  {
    test: /violates unique constraint|must be unique/i,
    message:
      'A record with these details already exists. Check the job number and ' +
      'reference fields for a duplicate.',
  },
  {
    test: /^Validation error:?\s*(.+)/i,
    message: (m) => `Validation failed: ${m[1]}`,
  },
];

const humanizeBackendMessage = (raw) => {
  const text = typeof raw === 'string' ? raw : raw?.message || '';
  if (!text) return null;

  for (const pattern of DB_ERROR_PATTERNS) {
    const match = text.match(pattern.test);
    if (match) {
      return typeof pattern.message === 'function'
        ? pattern.message(match)
        : pattern.message;
    }
  }
  // Not a recognised database error - it's one of the backend's own
  // user-facing messages, so show it as written.
  return text;
};

/**
 * @param source  either the `result` string from a { status:'error' } body,
 *                or the Error an axios call rejected with.
 * @param fallback used when nothing usable can be extracted.
 */
export const describeSaveError = (source, fallback = DEFAULT_MESSAGE) => {
  if (!source) return fallback;

  // Server responded, but the route reported failure in the body.
  if (typeof source === 'string') {
    return humanizeBackendMessage(source) || fallback;
  }

  const response = source.response;

  // Rejected with no response at all - the request never completed, so this
  // is connectivity or the server being down, not anything the form did.
  if (!response) {
    return (
      'Could not reach the server, so the job was not saved. Check your ' +
      'connection and try again - if this continues, contact IT.'
    );
  }

  const body = response.data || {};

  // 423 is the licence kill-switch (see functions/license/middleware.js).
  if (response.status === 423) {
    return (
      body.message ||
      'The system is currently read-only, so changes cannot be saved. ' +
      'Please contact your provider.'
    );
  }
  if (response.status === 401) {
    return 'Your session has expired. Log in again and re-enter your changes.';
  }
  if (response.status === 403) {
    return (
      body.result ||
      body.message ||
      'You do not have permission to save this job.'
    );
  }
  if (response.status >= 500) {
    return (
      'The server could not complete the save. Nothing was changed - please ' +
      'try again, and contact IT if it keeps happening.'
    );
  }

  return humanizeBackendMessage(body.result || body.message) || fallback;
};

export default describeSaveError;
