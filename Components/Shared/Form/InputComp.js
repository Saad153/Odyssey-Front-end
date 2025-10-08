// import { Input } from "antd";
// import { useController } from "react-hook-form";
// import React from 'react'

// const InputComp = (props) => {
//   const { control, name, onChange1 } = props;
//   const { field: { onChange, onBlur, value, name: fieldName, ref } } = useController({ control, name });
//   return (
//     <>
//       <div>{props.label}</div>
//       <Input 
//         disabled={props.disabled} style={{minWidth:props.width, fontSize:12, height:32}} {...props.field} 
//         name={fieldName} onChange={onChange1} value={value} ref={ref} onBlur={onBlur}
//       />
//     </>
//   )
// }

// export default React.memo(InputComp)

import { Input } from 'antd';
import { useController } from 'react-hook-form';
import React from 'react';

const InputComp = (props) => {
  const { control, name, onChange1 } = props;
  const {
    field: { onChange, onBlur, value, name: fieldName, ref }
  } = useController({ control, name });

  // Handle onChange event, merging react-hook-form and custom onChange handlers
  const handleChange = (event) => {
    // Call react-hook-form's onChange handler
    onChange(event);

    // Call custom onChange handler if provided
    if (onChange1) {
      onChange1(event);
    }
  };

  return (
    <>
      <div>{props.label}</div>
      <Input
        disabled={props.disabled}
        style={{ minWidth: props.width, fontSize: 12, height: 32 }}
        name={fieldName}
        onChange={handleChange}
        value={value}
        ref={ref}
        onBlur={onBlur}
      />
    </>
  );
};

export default React.memo(InputComp);
