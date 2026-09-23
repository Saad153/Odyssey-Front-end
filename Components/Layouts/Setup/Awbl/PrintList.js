import React from 'react';
import moment from 'moment';

// The printable AWB list. react-to-print clones this node into its own iframe,
// so the styles it needs travel with it in the <style> block below rather than
// living in a global stylesheet.
//
// Kept as a forwardRef because react-to-print needs a real DOM node to clone.
const PrintList = React.forwardRef(({ rows, filters, companyLabel }, ref) => {
  const { airlineName, status, search } = filters || {};

  const statusLabel =
    status === 'unused' ? 'Unused only' :
    status === 'used' ? 'Used only' : 'All';

  // Anything the filter has already fixed for every row is stated once in the
  // heading instead of repeated down the page. Filter to one airline and
  // Unused and the sheet becomes what was actually asked for: a clean list of
  // numbers, nothing else.
  const showAirline = !airlineName;
  const showStatus = status === 'all';
  const showJob = status !== 'unused'; // unused numbers have no job or party

  const numbersOnly = !showAirline && !showStatus && !showJob;

  // A bare number list down one column wastes most of the page and turns 125
  // numbers into three sheets, so it is laid out in columns instead.
  const COLUMNS = 3;
  const chunks = [];
  if (numbersOnly) {
    const perColumn = Math.ceil(rows.length / COLUMNS) || 1;
    for (let i = 0; i < rows.length; i += perColumn) {
      chunks.push({ start: i, items: rows.slice(i, i + perColumn) });
    }
  }

  const Meta = () => (
    <>
      <h2>Air Waybill Numbers{companyLabel ? ` — ${companyLabel}` : ''}</h2>
      <div className='meta'>
        <span><b>Airline:</b> {airlineName || 'All airlines'}</span>
        <span><b>Status:</b> {statusLabel}</span>
        {search ? <span><b>Search:</b> {search}</span> : null}
        <span><b>Total:</b> {rows.length}</span>
        <span><b>Printed:</b> {moment().format('DD-MM-YYYY HH:mm')}</span>
      </div>
    </>
  );

  return (
    <div ref={ref} className='awbl-print'>
      <style>{`
        @page { size: A4 portrait; margin: 14mm 12mm; }
        .awbl-print { font-family: Arial, Helvetica, sans-serif; color: #000; }
        .awbl-print h2 { font-size: 16px; margin: 0 0 2px 0; }
        .awbl-print .meta { font-size: 11px; color: #333; margin-bottom: 10px; }
        .awbl-print .meta span { margin-right: 14px; }
        .awbl-print table { width: 100%; border-collapse: collapse; font-size: 11px; }
        .awbl-print th, .awbl-print td { border: 1px solid #999; padding: 3px 5px; text-align: left; }
        .awbl-print th { background: #eee; font-weight: bold; }
        .awbl-print td.num { font-family: "Courier New", monospace; font-weight: bold; white-space: nowrap; }
        .awbl-print td.sr { color: #666; width: 30px; }
        .awbl-print tr { page-break-inside: avoid; }
        /* Repeats the header row at the top of every printed page. */
        .awbl-print thead { display: table-header-group; }
        .awbl-print .cols { display: flex; gap: 10px; align-items: flex-start; }
        .awbl-print .cols > div { flex: 1; }
        .awbl-print .foot { margin-top: 10px; font-size: 10px; color: #555; }
      `}</style>

      <Meta />

      {numbersOnly &&
        <div className='cols'>
          {chunks.map((chunk) => (
            <div key={chunk.start}>
              <table>
                <thead>
                  <tr><th style={{ width: 30 }}>#</th><th>AWB Number</th></tr>
                </thead>
                <tbody>
                  {chunk.items.map((row, i) => (
                    <tr key={row.id}>
                      <td className='sr'>{chunk.start + i + 1}</td>
                      <td className='num'>{row.formatted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      }

      {!numbersOnly &&
        <table>
          <thead>
            <tr>
              <th style={{ width: 34 }}>#</th>
              <th style={{ width: 130 }}>AWB Number</th>
              {showAirline && <th>Airline</th>}
              {showStatus && <th style={{ width: 60 }}>Status</th>}
              {showJob && <th style={{ width: 120 }}>Job No</th>}
              {showJob && <th>Party</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id}>
                <td>{i + 1}</td>
                <td className='num'>{row.formatted}</td>
                {showAirline && <td>{row.airline}</td>}
                {showStatus && <td>{row.status}</td>}
                {showJob && <td>{row.status === 'used' ? (row.jobNo || '') : ''}</td>}
                {showJob && <td>{row.status === 'used' ? (row.party || '') : ''}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      }

      {!rows.length &&
        <div style={{ textAlign: 'center', padding: 24, border: '1px solid #999', fontSize: 12 }}>
          No AWB numbers match these filters.
        </div>
      }

      <div className='foot'>
        {rows.length} number{rows.length === 1 ? '' : 's'} listed.
      </div>
    </div>
  );
});

PrintList.displayName = 'PrintList';

export default PrintList;
