import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import moment from "moment";
import PrintTopHeader from "Components/Shared/PrintTopHeader";
import { Table, Row, Col, Form } from "react-bootstrap";
import Pagination from "Components/Shared/Pagination";
import ExcelJS from "exceljs";
import Cookies from "js-cookie";
import { useRouter } from "next/router";


const AuditReport = ({ query, result }) => { 
  console.log("Result:", result.result)
    const router = useRouter();
    const hasExported = useRef(false);
    const [ records, setRecords ] = useState([]);

    useEffect(() => {
        if (
          router.isReady &&
          router.query.autoExport === "true" &&
          records.length > 0 &&
          !hasExported.current
        ) {
          hasExported.current = true;
          exportToExcel();
        }
      }, [router.isReady, router.query, records]);
    
      const ImageToBlob = (imageUrl) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous'; // Enable CORS if required
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(resolve);
          };
          img.onerror = reject;
          img.src = imageUrl;
        });
      };

      const exportToExcel = async () => {
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Invoice Report');
        
          worksheet.columns = [
            { header: 'S#', key: 'id', width: 10 },
            { header: 'Date Time', key: 'createdAt', width: 30  },
            { header: 'User Log', key: 'Employee', width: 30  },
            { header: 'Form', key: 'formName', width: 30  },
            { header: 'Action', key: 'type', width: 30 },
            { header: 'Doc #', key: 'docNo', width: 30 },
          ];
      
          const headerRow = worksheet.getRow(1);
          headerRow.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'D3D3D3' } 
            };
            cell.border = {
              right: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              top: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
            }
            cell.font = {
              size: 14,
              bold: true,
            };
          
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle'
            };
          });
          // console.log(records)
          const data = records.map((x, i) => ({
            
            id: i + 1,
            createdAt: moment(x.createdAt).format("YYYY-MM-DD HH:MM:SS"),
            Employee: x.Employee?.name || "",
            formName: x.formName || "",
            type: x.type || "",
            docNo: x.docNo || "",
          }));
          
      
        
            worksheet.addRows(data);
      
            records.forEach((x, i) => {
              if (x.type === "parent") {
                const row = worksheet.getRow(i + 2); // Account for header row (index starts from 1)
                row.eachCell((cell) => {
                  cell.font = { bold: true };
                  cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'd7d7d7' } 
                  }; // Set font to bold
                });
              }
            });
      
            worksheet.insertRow(1, ['', '', '', '', '', '', '', '']);
            // worksheet.insertRow(1, ['']);
            worksheet.insertRow(1, ['', '', '', 'Date: From: ' + moment(query.from).format('DD-MM-YYYY') + ' To: ' + moment(query.to).format('DD-MM-YYYY'),]);
            worksheet.insertRow(1, ['', '', '', 'House# D-213, DMCHS, Siraj Ud Daula Road, Karachi']);
            query.company=='1' && worksheet.insertRow(1, ['', '', '', 'Seanet Shipping & Logistics']);
            query.company=='2' && worksheet.insertRow(1, ['', '', '', 'Air Cargo Services']);
            query.company!='1' && query.company!='2' && worksheet.insertRow(1, ['', '', '', 'Seanet Shipping & Logistics & Air Cargo Services']);
            worksheet.insertRow(1, ['']);
            worksheet.insertRow(1, ['']);
      
          worksheet.getCell('D3').font = {
            size: 16,  
            bold: true  
          };
          worksheet.getCell('D4').font = {
            size: 16,  // Increase font size
            bold: true  // Make the text bold
          };
          worksheet.getCell('D5').font = {
            size: 14,  // Increase font size
            bold: true  // Make the text bold
          };
      
          
          const imageUrl = query.company=='1' ? '/seanet-colored.png' : query.company=='2' ? '/acs-colored.png' : '/sns-acs.png';
      
          // const imageUrl = '/public/seanet-logo-complete.png'
          const imageBlob = await ImageToBlob(imageUrl);
      
          const imageId = workbook.addImage({
            buffer: await imageBlob.arrayBuffer(), // Convert Blob to ArrayBuffer
            extension: 'png', // Image extension
          });
      
          worksheet.addImage(imageId, {
            tl: { col: 1, row: 1 }, // Top-left position (column, row)
            ext: { width: 150, height: 100 }, // Image width and height
          });
      
          try{
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'AuditLogReport.xlsx';
            link.click();
            window.URL.revokeObjectURL(url);
          }catch(e){
            // console.log(e)
            console.error(e)
          }
        };

    useEffect(() => {
  if (result && Array.isArray(result.result)) {
    setRecords(result.result);
    return;
  }
  setRecords(result.temp);
    }, [result]);
    const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

    const [currentPage,setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(30);
    const indexOfLast = currentPage * recordsPerPage ;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = records ? records.slice(indexOfFirst,indexOfLast) : [];
    const noOfPages = records ? Math.ceil(records.length / recordsPerPage) : 0 ;
    const groupedRecords = currentRecords.reduce((acc, item) => {
    const group = item.groupName || "OTHERS";

    if (!acc[group]) acc[group] = [];
  acc[group].push(item);

  return acc;
}, {});
    return (
        <>  
            <PrintTopHeader company={query.company} query={query} from={moment(query.from).format('DD-MM-YYYY')} to={moment(query.to).subtract(1, 'days').format('DD-MM-YYYY')} /> 
                
            <div className="report-header" style={{ marginTop: '20px', marginBottom: '20px', position: 'relative' }}>
              <div style={{ position: 'relative', marginBottom: '25px' }}>
            <div style={{
                borderTop: '3px solid #000'
            }} />
            
              <span style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff',
                padding: '0 14px',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                Audit Log Report
              </span>
            </div>
              </div>
              
            <Row style={{  marginTop: '15px', justifyContent: 'right' }}>
            
                <Col md={4}>  
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 'bold' }}>As On :</span>
                    <span style={{ borderBottom: '1px solid #3f0202', minWidth: '150px', marginLeft: '10px', textAlign: 'center' }}>{moment(query.to).subtract(1, 'days').format('DD-MM-YYYY')}</span>
                </div>
                </Col>
            </Row>
            <div>
            <div className="table-box">
                      <div className="table-scroll">
                        <table className="summary">
                          <thead className="sticky-header">
                            <tr>
                              <th rowSpan={2}>S #</th>
                              <th rowSpan={2} style={{ textAlign: "left" }}>Date | Time</th>
                              <th rowSpan={5}>User Log</th>
                              <th colSpan={6} style={{ textAlign: "center" }}>Audit</th>
                              {/* <th rowSpan={2}>Total</th> */}
                            </tr>
            
                            <tr>
                              <th>Form</th>
                              <th>Action</th>
                              <th>Doc #</th>
                          
                            </tr>
                          </thead>
            
                        <tbody>
                          {Object.entries(groupedRecords).map(([groupName, groupRows]) => (
                            <React.Fragment key={groupName}>
                              <tr className="group-row">
                                <td colSpan={15} className="group-title">
                                  
                                </td>
                              </tr>
                              {groupRows.map((r, index) => (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td className="cell-code">{moment(r.createdAt).format('DD-MM-YYYY | HH:mm:ss')}</td>
                                  <td className="cell-title indent">
                                    {r.Employee?.name}
                                  </td>
                                  <td className="cell-center">{r.formName}</td>
                                  <td className="cell-num">{r.type}</td>
                                  <td className="cell-center">{r.docNo}</td>
                                  
                                  
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                  </table>
                  </div>
            </div>
            <div className="d-flex justify-content-end mt-4">
              <Pagination noOfPages={noOfPages} currentPage={currentPage} setCurrentPage={setCurrentPage}/>
            </div>
            </div>
            </>
    );
};

export default AuditReport;