// import { DatePicker } from "antd";
// import { useController } from "react-hook-form";
// import React, { memo } from 'react'
// import moment from 'moment'; // Ensure moment is imported

// const NumComp = (props) => {
//   console.log(props)
//   const { control, name ,defaultValues} = props;
//   const { field: { onChange, onBlur, value, name: fieldName, ref } } = useController({ control,defaultValues, name });
//   const selectedDate = value ? moment(value) : defaultValues ? moment(defaultValues) : null;

//   return (
//     <>
//       <div>{props.label}</div>
//       <DatePicker name={fieldName} 
   
//       onChange={onChange} value={selectedDate} ref={ref} onBlur={onBlur} style={{minWidth:props.width, fontSize:12}} />
//     </>
//   )
// }

// export default memo(NumComp)
import { DatePicker } from "antd";
import { useController } from "react-hook-form";
import React, { memo } from 'react'
import moment from 'moment'; // Ensure moment is imported

const NumComp = (props) => {
  // console.log(props)
  const { control, name ,defaultValues} = props;
  const { field: { onChange, onBlur, value, name: fieldName, ref } } = useController({ control,defaultValues, name });
  if(control){
    const selectedDate = value ? moment(value) : defaultValues ? moment(defaultValues) : null;

    return (
      <>
        <div>{props.label}</div>
        <DatePicker name={fieldName} 
     
        onChange={onChange} value={selectedDate} ref={ref} onBlur={onBlur} style={{minWidth:props.width, fontSize:12}} />
      </>
    )
  }else{
    const selectedDate =  defaultValues ? moment(defaultValues) : null;
    return (
      <>
        <div>{props.label}</div>
        <DatePicker name={fieldName} 
     
        onChange={onChange} value={selectedDate} ref={ref} onBlur={onBlur} style={{minWidth:props.width, fontSize:12}} />
      </>
    )

  }



}

export default memo(NumComp)
