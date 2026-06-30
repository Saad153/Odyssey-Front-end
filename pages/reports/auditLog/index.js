import React from 'react';
import AuditLog from 'Components/Layouts/Reports/AuditLog';

const auditLog = ({query, result}) => {
  return (
    <>
      <AuditLog query={query} result={result}/>
    </>
  )
}


export default auditLog