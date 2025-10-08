import React, { useEffect, useReducer } from 'react';
import { Row, Col } from 'react-bootstrap';
import CreateOrEdit from './CreateOrEdit';
import axios from 'axios';
import Cookies from 'js-cookie';
import ExcelJS from "exceljs";


import { PlusCircleOutlined, MinusCircleOutlined, RightOutlined, EditOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

function recordsReducer(state, action){
    switch (action.type) {
      case 'toggle': { return { ...state, [action.fieldName]: action.payload } }
      case 'create': {
        return {
            ...state,
            create: true,
            visible: true,
        }
      }
      case 'edit': {
        return {
            ...state,
            edit: true,
            visible: true,
        }
      }
      case 'modalOff': {
        return {
            ...state,
            visible: false,
            create: false,
            edit: false
        }
      }
      default: return state 
    }
}

const initialState = {
    records: [],
    load:true,
    visible:false,
    create:false,
    edit:false,
    
    // Createing Records
    selectedMainId:'',
    selectedParentId:'',
    title:'',
    isParent:false,
    subCategory:"General",
    parentRecords: [],
    
    // Editing Records
    selectedRecordId:'',
    selectedRecord:{}
};

const ChartOFAccount = ({accountsData}) => {

    const [ state, dispatch ] = useReducer(recordsReducer, initialState);
    const { records, visible } = state;
    useEffect(() => { 
        getAccounts(accountsData)
     }, []);

    async function getAccounts(data){
        let tempState = [];
        let tempStateTwo = [];
        data.result.forEach((x, index) => {
            tempState[index]={
                ...x,
                check:false
            }
            x.Parent_Accounts.forEach((y, indexTwo) => {
                tempState[index].Parent_Accounts[indexTwo]={
                    ...y,
                    check:false
                }
                tempStateTwo.push(y)
            })
        });
        dispatch({ type: 'toggle', fieldName: 'records', payload: tempState })
        dispatch({ type: 'toggle', fieldName: 'parentRecords', payload: tempStateTwo })
    }

    const updateCodeParents = async () => {
        let tempState = [...state.records];
        let p = 0;
        let c = 0;
    
        for (let x of tempState) {
            p = parseInt(x.id * 100);
            for (let y of x.Parent_Accounts) {
                p++;
                let codeP = Cookies.get('companyId').toString() + p.toString();
                try {
                    const response = await axios.post(process.env.NEXT_PUBLIC_CLIMAX_POST_CODE_PARENT_ACCOUNT, {
                        id: y.id,
                        title: y.title,
                        AccountId: y.AccountId,
                        CompanyId: Cookies.get('companyId'),
                        code: codeP.toString()
                    });
                } catch (error) {
                    console.error("Error updating parent account:", error);
                }
    
    
                c = p * 10000;
                for (let z of y.Child_Accounts) {
                    c++;
                    let codeC = Cookies.get('companyId').toString() + c.toString();
                    try {
                        const response = await axios.post(process.env.NEXT_PUBLIC_CLIMAX_POST_CODE_CHILD_ACCOUNT, {
                            id: z.id,
                            title: z.title,
                            ParentAccountId: y.id,
                            CompanyId: Cookies.get('companyId'),
                            code: codeC.toString()
                        });
                    } catch (error) {
                        console.error("Error updating child account:", error);
                    }
                }
    
                c = 0;
            }
    
            p = 0;
        }
    
    };

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
      
        // Column definitions
        worksheet.columns = [
          { header: 'Code', key: 'code', width: 15 },
          { header: 'Account Title', key: 'title', width: 35  },
          { header: 'Type', key: 'type', width: 15  },
          { header: 'Category', key: 'cat', width: 15  },
          { header: 'Sub Category', key: 'subCat', width: 15  },
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
            bold: true,
          };
        
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle'
          };
        });

        let data1 = []

        records.forEach((x, i)=>{
            data1.push({
                index: i + 1,
                code: x.code,
                title: x.title,
                type: "Group"
            })
            x.Parent_Accounts.forEach((y, index)=>{
                data1.push({
                    index: i + 1,
                    code: y.code,
                    title: y.title,
                    type: "Parent",
                    cat: x.title
                })
                y.Child_Accounts.forEach((z, indexTwo)=>{
                    data1.push({
                        index: i + 1,
                        code: z.code,
                        title: z.title,
                        type: "Child",
                        cat: x.title,
                        subCat: z.subCategory
                    })
                })
            })
        })
        
        console.log(data1)
          worksheet.addRows(data1);
          worksheet.insertRow(1, ['']);
          worksheet.insertRow(1, ['']);
        //   worksheet.insertRow(1, ['', '', '', 'Date: From: ' + query.from + ' To: ' + query.to,]);
          worksheet.insertRow(1, ['', '', 'House# D-213, DMCHS, Siraj Ud Daula Road, Karachi']);
          Cookies.get('companyId')=='1' && worksheet.insertRow(1, ['', '', 'Seanet Shipping & Logistics']);
          Cookies.get('companyId')=='2' && worksheet.insertRow(1, ['', '', 'Air Cargo Services']);
        //   Cookies.get('companyId')!='1' && query.company!='2' && worksheet.insertRow(1, ['', '', '', 'Seanet Shipping & Logistics & Air Cargo Services']);
          worksheet.insertRow(1, ['']);
          worksheet.insertRow(1, ['']);
    
        worksheet.getCell('C3').font = {
          size: 16,  // Increase font size
          bold: true  // Make the text bold
        };
        worksheet.getCell('C4').font = {
          size: 16,  // Increase font size
          bold: true  // Make the text bold
        };
    
        const imageUrl = Cookies.get('companyId')=='1' ? '/seanet-colored.png' : Cookies.get('companyId')=='2' ? '/acs-colored.png' : '/sns-acs.png';
    
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
          link.download = 'ChartOfAccounts.xlsx';
          link.click();
          window.URL.revokeObjectURL(url);
        }catch(e){
          console.log(e)
          console.error(e)
        }
      
        
      };

    console.log(records)

return (
    <div className='dashboard-styles'>
    <div className='base-page-layout'>
    <div className='account-styles'>
        <Row>
            <Col><h5>Accounts</h5></Col>
            <Col>   
                {/* <button className='btn-custom right' onClick={()=>updateCodeParents()}>
                    Update Codes
                </button>            */}
                <button className='btn-custom right' onClick={()=>{ dispatch({ type: 'create'}) }}>
                    Create
                </button>
                <button className="btn-custom-green px-3 py-1 mx-2 float-end" onClick={exportToExcel}>
                    Export to Excel
                </button>
            </Col>
        </Row>
        <hr className='my-2' />
        <Row style={{maxHeight:'69vh',overflowY:'auto', overflowX:'hidden'}}>
        {
        records.map((x, index)=>{
        return(
            <div key={x.id} className='parent'>
            <div className='child icon' onClick={()=>{
                let tempState = [...records];
                tempState.forEach((i)=>{
                    if(i.id==x.id){
                        i.check=!i.check
                    }
                })
                dispatch({ type: 'toggle', fieldName: 'records', payload: tempState })
            }}>
                {x.check?<MinusCircleOutlined />:<PlusCircleOutlined />}
            </div>
            <div className='child title'>{x.id +" "+ x.title}</div>
            {x.check &&
            <>{x.Parent_Accounts.map((y, indexTwo)=>{
                return(
                <div key={y.id} className='mx-4 parent'>
                <div className='child icon' onClick={()=>{
                    let tempState = [...records];
                    tempState[index].Parent_Accounts.forEach((j)=>{
                        if(j.id==y.id){
                            j.check=!j.check
                        }
                    })
                    dispatch({ type: 'toggle', fieldName: 'records', payload: tempState })
                }}>
                    {y.check?<MinusCircleOutlined />:<PlusCircleOutlined />}
                </div>
                    <div className='child title'>{y.code+" "+ y.title}</div>

                    {y.editable==1&&<div className='child edit-icon' onClick={()=>{
                        dispatch({ type: 'toggle', fieldName: 'selectedRecord', payload: y })
                        dispatch({ type: 'toggle', fieldName: 'isParent', payload: true })
                        dispatch({ type: 'edit'})
                    }}
                    ><EditOutlined />
                    </div>}
                    {y.check && <>
                    {
                    y.Child_Accounts.map((z)=>{
                        return(
                        <div key={z.id} className='mx-4 parent'>
                            <div className='child icon'><RightOutlined /></div>
                            <div className='child title'>{z.code+" "+ z.title}</div>
                            {z.editable==1&&<div className='child edit-icon' onClick={()=>{
                                dispatch({ type: 'toggle', fieldName: 'selectedRecord', payload: z })
                                dispatch({ type: 'toggle', fieldName: 'isParent', payload: false })
                                dispatch({ type: 'edit'})
                                }}><EditOutlined /></div>}
                        </div>
                        )
                    })
                    }
                    </>}
                </div>
                )
                })
            }</>
            }
            </div>
        )
        })}
        </Row>
        <Modal open={visible} 
            onOk={() => dispatch({ type: 'modalOff' })} 
            onCancel={() => dispatch({ type: 'modalOff' })}
            width={600}
            footer={false}
            centered={false}
        >
            <CreateOrEdit state={state} dispatch={dispatch} getAccounts={getAccounts} />
        </Modal>
    </div>
    </div>
    </div>
  )
}
export default React.memo(ChartOFAccount)