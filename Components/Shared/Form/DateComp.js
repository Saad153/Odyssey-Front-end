import { DatePicker } from "antd";
import { useController } from "react-hook-form";
import React, { memo } from "react";
import moment from "moment";

const normalizeDate = (value) => {
  if (!value) return null;

  if (moment.isMoment(value)) {
    return value.isValid() ? value : null;
  }

  const formats = ["DD-MM-YYYY", "YYYY-MM-DD", "DD/MM/YYYY", moment.ISO_8601];
  let parsed = moment(value, formats, true);

  if (!parsed.isValid()) {
    parsed = moment(value);
  }

  return parsed.isValid() ? parsed : null;
};

const DateComp = (props) => {
  const {
    control,
    name,
    defaultValues,
    required,
    label,
    disabled,
    width,
  } = props;

  const { field } = useController({
    control,
    name,
    defaultValue: normalizeDate(defaultValues),
    rules: required ? { required: `${label} is required` } : undefined,
  });

  const selectedDate = normalizeDate(field.value);

  return (
    <>
      <div>{label}</div>

      <DatePicker
        name={name}
        format="DD-MM-YYYY"
        value={selectedDate}
        onChange={(date) =>
          field.onChange(date && date.isValid() ? date : null)
        }
        onBlur={field.onBlur}
        style={{ minWidth: width, fontSize: 12 }}
        disabled={disabled}
      />
    </>
  );
};

export default memo(DateComp);