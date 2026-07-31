import React, { useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import axiosClient from 'apis/axiosClient';

// Outlook/Gmail-style "type an address, pick from what you've used before"
// input. Each entry becomes its own removable chip (mode="tags" also lets
// you just type a full address and hit enter/comma if it's not suggested).
const MIN_CHARS = 2;

const EmailTagsInput = ({ value, onChange, placeholder, status }) => {
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const search = (q) => {
    clearTimeout(debounceRef.current);
    // Below the threshold: as the usage-history table grows, one or two
    // letters would otherwise match a huge, unhelpful chunk of it.
    if (!q || q.trim().length < MIN_CHARS) { setOptions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      await axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/suggestEmails`, {
        headers: { q:q.trim() }
      }).then((x) => {
        if (x.data.status === 'success') {
          setOptions(x.data.result.map((email) => ({ value:email })));
        }
      }).finally(() => setSearching(false));
    }, 250);
  };

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  return (
    <Select
      mode='tags'
      value={value}
      onChange={onChange}
      onSearch={search}
      options={options}
      loading={searching}
      placeholder={placeholder}
      status={status}
      style={{ width:'100%' }}
      tokenSeparators={[';', ',']}
      filterOption={false}
      notFoundContent={null}
    />
  );
};

export default EmailTagsInput;
