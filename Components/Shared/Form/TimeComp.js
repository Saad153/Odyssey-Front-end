// import { TimePicker } from 'antd';
// import { Controller } from "react-hook-form";

// const TimeComp = (props) => {
//   return (
//   <>
//     <Controller
//       name={`${props.name}`}
//       defaultValue=""
//       control={props.control}
//       {...props.register(`${props.name}`)}
//       render={({ field }) => (
//         <>
//           <div>{props.label}</div>
//           <TimePicker disabled={props.disabled} use12Hours size={props.size} style={{minWidth:props.width}} format={'h:mm A'} {...field} />
//         </>
//       )}
//     />
//   </>
//   )
// }
// export default TimeComp

import { TimePicker } from 'antd';
import { useController } from 'react-hook-form';
import React, { memo } from 'react';
import moment from 'moment';

const normalizeTime = (value) => {
  if (!value) return null;

  if (moment.isMoment(value)) {
    return value.isValid() ? value : null;
  }

  const formats = ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm', 'HH:mm:ss', moment.ISO_8601];
  let parsed = moment(value, formats, true);

  if (!parsed.isValid()) {
    parsed = moment(value);
  }

  return parsed.isValid() ? parsed : null;
};

const TimeComp = ({ control, name, defaultValues, disabled, size, width, label, format = 'h:mm A' }) => {
  const defaultTime = normalizeTime(defaultValues);
  const { field } = useController({ control, name, defaultValue: defaultTime });

  const selectedTime = normalizeTime(field.value);

  return (
    <>
      <div>{label}</div>
      <TimePicker
        name={name}
        disabled={disabled}
        use12Hours
        size={size}
        style={{ minWidth: width, fontSize: 12 }}
        format={format}
        value={selectedTime}
        onChange={(time) => field.onChange(time && time.isValid() ? time : null)}
        onBlur={field.onBlur}
      />
    </>
  );
};

export default memo(TimeComp);