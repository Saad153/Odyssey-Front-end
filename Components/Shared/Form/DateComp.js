import { DatePicker } from "antd";
import { useController } from "react-hook-form";
import React, { memo } from 'react'
import moment from 'moment';

const normalizeDate = (value) => {
  if (!value) return null;

  if (moment.isMoment(value)) {
    return value.isValid() ? value : null;
  }

  const formats = ['DD-MM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', moment.ISO_8601];
  let parsed = moment(value, formats, true);

  if (!parsed.isValid()) {
    parsed = moment(value);
  }

  return parsed.isValid() ? parsed : null;
};

const NumComp = (props) => {
  const { control, name, defaultValues } = props;
  const { field } = useController({ control, name, defaultValue: normalizeDate(defaultValues) });

  const selectedDate = normalizeDate(field.value);

  return (
    <>
      <div>{props.label}</div>
      <DatePicker
        name={name}
        format="DD-MM-YYYY"
        value={selectedDate}
        onChange={(date) => field.onChange(date && date.isValid() ? date : null)}
        onBlur={field.onBlur}
        style={{ minWidth: props.width, fontSize: 12 }}
        disabled={props.disabled}
      />
    </>
  );
};


export default memo(NumComp)
