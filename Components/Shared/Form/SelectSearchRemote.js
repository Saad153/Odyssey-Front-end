import { Select, Spin } from "antd";
import { useController } from "react-hook-form";
import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * A SelectSearchComp that fetches its options from the server as you type,
 * instead of being handed the whole list up front.
 *
 * The ports and destinations tables hold 157,879 and 140,848 rows. Passing
 * either to the plain SelectSearchComp meant downloading ~12.6 MB and ~5.9 MB
 * of JSON every single time the job screen opened, which is what made the Port
 * of Discharge and Final Destination pickers so slow.
 *
 * Two things this has to get right beyond the fetching:
 *
 *  - An already-saved job holds a value whose label is not in the (initially
 *    empty) option list. `resolve` fetches that one record on mount so the
 *    field shows "Karachi (PKKHI)" rather than a bare code or a blank box.
 *
 *  - filterOption is off. The server has already filtered; letting antd filter
 *    again would hide results whose match was on a field it cannot see, such as
 *    a port matched on its country.
 *
 * @param search   (term) => Promise<[{id, name}]>  called as the user types
 * @param resolve  (value) => Promise<{id, name}|null>  labels the saved value
 * @param minChars characters required before searching. Trigram indexes are
 *                 built from 3-character sequences, so 1-character terms cannot
 *                 use them and would scan the whole table.
 */
const SelectSearchRemote = (props) => {
  const {
    control, name, label, disabled, width, clear,
    search, resolve, minChars = 2, placeholder,
    ...rest
  } = props;

  const { field: { onChange, onBlur, value, name: fieldName } } = useController({ control, name });

  const [options, setOptions] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [typed, setTyped] = useState("");

  // Guards against a slow earlier request landing after a faster later one and
  // overwriting the newer results.
  const requestSeq = useRef(0);
  const debounceRef = useRef(null);

  // Label whatever the job already has. Runs when the value arrives (it is
  // empty on first render and filled by the form reset a beat later).
  useEffect(() => {
    let cancelled = false;
    if (!value || !resolve) return;
    if (options.some((o) => String(o.id) === String(value))) return;

    resolve(value)
      .then((option) => {
        if (cancelled || !option) return;
        setOptions((prev) =>
          prev.some((o) => String(o.id) === String(option.id)) ? prev : [option, ...prev]);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [value]);

  const runSearch = useCallback((term) => {
    const seq = ++requestSeq.current;
    setFetching(true);
    search(term)
      .then((rows) => {
        if (seq !== requestSeq.current) return; // a newer search has overtaken this one
        setOptions(rows);
      })
      .catch(() => { if (seq === requestSeq.current) setOptions([]); })
      .finally(() => { if (seq === requestSeq.current) setFetching(false); });
  }, [search]);

  const onSearchTyped = (term) => {
    setTyped(term);
    clearTimeout(debounceRef.current);
    if (term.trim().length < minChars) {
      requestSeq.current++; // cancel anything in flight
      setFetching(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(term), 300);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const notFound = fetching
    ? <div style={{ padding: 8, textAlign: "center" }}><Spin size="small" /></div>
    : typed.trim().length < minChars
      ? <div style={{ padding: 8, fontSize: 12 }}>Type at least {minChars} characters</div>
      : <div style={{ padding: 8, fontSize: 12 }}>No matches</div>;

  return (
    <>
      <div className="">{label}</div>
      <Select
        showSearch
        disabled={disabled}
        style={{ minWidth: width || 200, maxWidth: width || 200, fontSize: 12 }}
        name={fieldName}
        value={value || undefined}
        onChange={(v) => onChange(v ?? "")}
        onBlur={onBlur}
        onSearch={onSearchTyped}
        // The server did the filtering; antd must not filter again.
        filterOption={false}
        notFoundContent={notFound}
        placeholder={placeholder}
        options={options.map((o) => ({ value: o.id, label: o.name }))}
        allowClear={clear}
        {...rest}
      />
    </>
  );
};

export default React.memo(SelectSearchRemote);
