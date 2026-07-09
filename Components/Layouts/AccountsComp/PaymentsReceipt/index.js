import React, { useState, useRef, useEffect, useMemo, useCallback, useReducer } from 'react';
import { SearchOutlined, CloseCircleOutlined, SyncOutlined, PrinterOutlined, RollbackOutlined, PlusCircleOutlined, PlusOutlined, ArrowLeftOutlined, DollarOutlined } from "@ant-design/icons";
import { MdDeleteForever, MdHistory } from "react-icons/md";
import { Input, List, Radio, Modal, Select, Alert } from 'antd';
import { recordsReducer, initialState, getNewInvoices } from './states';
import { useSelector, useDispatch } from 'react-redux';
import { incrementTab } from 'redux/tabs/tabSlice';
import { Row, Col, Table } from 'react-bootstrap';
import Router, { useRouter } from 'next/router';
import BillComp from './BillComp';
import PrintTransaction from './PrintTransaction';
import moment from 'moment';
import axiosClient from 'apis/axiosClient';
import { AgGridReact } from 'ag-grid-react';
import ReactToPrint from 'react-to-print';
import DeleteVoucher from './DeleteVoucher';
import Pagination from '../../../Shared/Pagination';
import openNotification from "../../../Shared/Notification";
import {checkEditAccess} from "functions/checkEditAccess";
import {checkEmployeeAccess} from "functions/checkEmployeeAccess";
import { setPRField, resetState } from 'redux/paymentReciept/paymentRecieptSlice';
import Cookies from "js-cookie";

const commas = (a) => a == 0 ? '0' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
const PaymentsReceipt = ({ id, voucherData, q }) => {
  // console.log("Query: ", q)
  const dispatch = useDispatch();
  const state = useSelector((state) => state.paymentReciept);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState(state.search || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setPRField({ field: "search", value: searchInput }));
    }, 500); // 👈 delay in ms

    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchOldVouchers = async (pageNum = 1) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_OLD_PAY_REC_VOUCHERS, {
        params: {
          companyid: Cookies.get("companyId"),
          page: pageNum,
          limit: 50,
          search: state.search || ""
        }
      });

      const { result, totalPages, total } = response.data;
      setTotalPages(totalPages);
      setPage(pageNum);

      console.log("Fetched Old Vouchers:", result);

      const temp = [];
      result.forEach((x) => {
        x.invoice.forEach((y) => {
          y.receiving = 0;
          x.Invoice_Transactions.forEach((z) => {
            if (z.InvoiceId == y.id) y.receiving += parseFloat(z.amount);
          });
          y.constReceiving = y.receiving;
        });
      });

      if (result.length > 0) {
        temp.push(
          result.map((x) => ({
            id: x.id,
            voucherNo: x.voucher_Id,
            name: x.partyName,
            party: x.partyType,
            type: x.vType,
            data: x.createdAt,
            currency: x.currency,
            amount:
              x.Voucher_Heads
                ?.filter(
                  y =>
                    ["partyAccount", "General", "Admin Expense"].includes(y.accountType) &&
                    y.ChildAccountId === x.clientAssociation?.ChildAccountId
                )
                .reduce((sum, y) => sum + Number(y.amount || 0), 0) || 0,
            partyId: x.partyId,
            x: x,
          }))
        );
      }

      if (temp.length > 0) {
        dispatch(setPRField({ field: "oldVouchers", value: temp[0] }));
      }
    } catch (error) {
      console.error("Error fetching old vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOldVouchers(1);
  }, []);

  useEffect(() => {
    setPage(1);
    fetchOldVouchers(1);
  }, [state.search]);

  const fetchAccounts = async () => {
    console.log("Fetching Accounts for type:", state.type)
    const accounts = await axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/misc/parties/getPartiesbyType`,
      { headers:{companyid: Cookies.get('companyId'), type: state.type} }
    ).then((x) => {
      console.log(">>>>>>>>>>>.", x.data.result)
      dispatch(setPRField({ field: 'PRaccounts', value: x.data.result }));
    })
  }

  useEffect(() => {
    fetchAccounts();
  }, [state.type])

  const columnDefs = [
    { title: "Voucher No.", dataIndex: "voucherNo", key: "voucherNo" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Party", dataIndex: "party", key: "party" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Currency", dataIndex: "currency", key: "currency" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
  ]

  const back = async () => {
    dispatch(resetState())
    Router.push(`/accounts/paymentReceipt/undefined`);
    fetchOldVouchers();
    fetchAccounts();
  }

  const refresh = async () =>{
    try{
      await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_INVOICE_BY_PARTY_ID, {
        headers: {
          id: state.selectedAccount,
          companyid: Cookies.get('companyId'),
          invoicecurrency: state.currency,
          pay: state.payType,
          type: state.type,
          edit: true,
        }
      }).then((x) => {
        console.log("Invoices", x.data.result)
        let temp = []
        state.edit?temp  = x.data.result.filter(y => parseFloat(y.total)-parseFloat(y.recieved) != 0.0 && parseFloat(y.total)-parseFloat(y.paid) != 0.0):
        temp = x.data.result;
        let temp2 = [...state.invoices];
        console.log("TEMP>>", temp)
        console.log("TEMP2>>", temp2)
        const map = new Map();
        temp2.forEach(item => map.set(item.id, item));
        temp.forEach(item => {
          console.log("Item:", item)
          console.log("State:", state)
          item.receiving = 0
          item.Invoice_Transactions.forEach((tran)=>{
            if(tran.VoucherId.toString()==state.voucherId){
              item.receiving += parseFloat(tran.amount)
            }
          })
          item.constReceiving = item.receiving
          console.log("ITEM: ", item)
          map.set(item.id, item);
        });

        // Get the union as an array
        const union = Array.from(map.values());
        console.log(union)
        dispatch(setPRField({ field: 'editing', value: true }))
        dispatch(setPRField({ field: 'advance', value: false }))
        dispatch(setPRField({ field: 'invoices', value: union }))
      })
    }catch(e){
      console.log(e)
    }
  }

  const deleteVoucher = () => {
    axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_POST_DELETE_PAY_REC,{
      id: state.voucherId,
      employeeId: Cookies.get("loginId")
    }).then((x) => {
      // console.log(x.data.status)
      if(x.data.status=="success"){
        back()
      }
    })
    
  }

  const openOldVouchers = (x) => {

    console.log("CONSOLE: ", x.x)
    console.log("Selected Account>>", x.x.invoice);
    dispatch(setPRField({ field: 'type', value: x.party }))
    dispatch(setPRField({ field: 'edit', value: true }))
    dispatch(setPRField({ field: 'selectedAccount', value: parseInt(x.partyId) }))
    dispatch(setPRField({ field: 'currency', value: x.currency }))
    dispatch(setPRField({ field: 'date', value: x.data }))
    dispatch(setPRField({ field: 'checkNo', value: x.x.chequeNo }))
    dispatch(setPRField({ field: 'checkDate', value: moment(x.x.chequeDate) }))
    dispatch(setPRField({ field: 'exRate', value: x.x.exRate }))
    dispatch(setPRField({ field: 'subType', value: x.x.subType }))
    dispatch(setPRField({ field: 'voucherId', value: x.id }))
    if(x.x.invoice.length == 0){
      dispatch(setPRField({ field: 'advance', value: true }))
    }else{
      let temp = x.x.invoice.map((inv) => {
      let newInv = { ...inv } // create a shallow copy
      x.x.Invoice_Transactions.forEach((invT) => {
        if (invT.InvoiceId == inv.id) {
          newInv.Invoice_Transactions = invT
        }
      })
        return newInv
      })
      console.log("TEMP: ", temp)
      dispatch(setPRField({ field: 'invoices', value: temp }))
    }
    // console.log("Invoice in P/R", x.x.invoice)
    dispatch(setPRField({ field: 'voucherNarration', value: x.x.voucherNarration }))
    x.x.Voucher_Heads.forEach((y) => {
      console.log("Voucher Heads: ", y)
      if(y.accountType=="payAccount"){
        dispatch(setPRField({ field: 'receivingAccount', value: y.ChildAccountId }));
        dispatch(setPRField({ field: 'receivingAmount', value: parseFloat(y.amount) }))
      }
      if(y.accountType=="partyAccount"||y.accountType=="General"||y.accountType=="Admin Expense"){
        // dispatch(setPRField({ field: 'voucherNarration', value: y.narration }))
        dispatch(setPRField({ field: 'totalReceivable', value: parseFloat(y.amount) }));
        // dispatch(setPRField({ field: 'selectedAccount', value: parseInt(y.ChildAccountId) }))
      }
      if((y.accountType=="Gain/Loss Account") && y.ChildAccountId != x.x.Voucher_Heads.find((x)=>x.accountType=="partyAccount").ChildAccountId){
        y.type!='debit'?
        dispatch(setPRField({ field: 'gainLossAmount', value: parseFloat(y.amount)*parseFloat(x.x.exRate) })):
        dispatch(setPRField({ field: 'gainLossAmount', value: (parseFloat(y.amount)*-1)*parseFloat(x.x.exRate) }))
        dispatch(setPRField({ field: 'gainLossAccount', value: y.ChildAccountId }))
      }
      if(y.accountType.includes('Charges Account')){
        dispatch(setPRField({ field: 'bankChargesAmount', value: parseFloat(y.amount) }));
        dispatch(setPRField({ field: 'bankChargesAccount', value: y.ChildAccountId }))
      }
      if(y.accountType.includes('Tax Account')){
        dispatch(setPRField({ field: 'taxAmount', value: parseFloat(y.amount) }));
        dispatch(setPRField({ field: 'taxAccount', value: y.ChildAccountId }))
      }

    })

    if(x.type.includes('P')){
      dispatch(setPRField({ field: 'payType', value: 'Payble' }))
    }else{
      dispatch(setPRField({ field: 'payType', value: 'Recievable' }))
    }
    if(x.type.includes('C')){
      dispatch(setPRField({ field: 'transactionMode', value: 'Cash' }))
      dispatch(setPRField({ field: 'subType', value: 'Cash' }))
    }else if(x.type.includes('B')){
      dispatch(setPRField({ field: 'transactionMode', value: 'Bank' }))
      dispatch(setPRField({ field: 'subType', value: 'Cheque' }))
    }else if(x.type.includes('ADJ')){
      console.log("Caught Adjust")
      dispatch(setPRField({ field: 'transactionMode', value: 'Adjust' }))
      dispatch(setPRField({ field: 'subType', value: 'Cheque' }))
    }
  }

  useEffect(() => {
    // console.log("State ID Check>>>", id, state.voucherId)
    (id!=undefined&&state.selectedAccount==undefined)||id!=state.voucherId?state.oldVouchers.find((x) => x.id == id)?openOldVouchers(state.oldVouchers.find((x) => x.id == id)):null:null
  }, [id])

  useEffect(() => {
    if(q.partyId){
      dispatch(setPRField({ field: 'type', value: q.partyType }));
      dispatch(setPRField({ field: 'payType', value: q.payType }));
      dispatch(setPRField({ field: 'selectedAccount', value: q.partyId.toString() }));
    }else{
      console.log("No query")
    }
  }, [q])

  // console.log("State>", state)

  return (
    <div className='base-page-layout'>
      <div>
        <h5>Payment / Receipt</h5>
        <hr></hr>
      </div>
      <Row style={{ height: '30px'}}>
        <Col md={3}>
          <b>Type</b>
          <Radio.Group style={{marginLeft: 10}} value={state.type} onChange={(e)=>{
            if(e.target.value == 'client'){
              dispatch(setPRField({ field: 'type', value: e.target.value }));
              dispatch(setPRField({ field: 'payType', value: 'Recievable' }));
              dispatch(setPRField({ field: 'currency', value: 'PKR' }));
              dispatch(setPRField({ field: 'selectedAccount', value: undefined}));
            }
            if(e.target.value == 'vendor'){
              dispatch(setPRField({ field: 'type', value: e.target.value }));
              dispatch(setPRField({ field: 'payType', value: 'Payble' }));
              dispatch(setPRField({ field: 'currency', value: 'PKR' }));
              dispatch(setPRField({ field: 'selectedAccount', value: undefined }));
            }
            if(e.target.value == 'agent'){
              dispatch(setPRField({ field: 'type', value: e.target.value }));
              dispatch(setPRField({ field: 'payType', value: 'Payble' }));
              dispatch(setPRField({ field: 'currency', value: 'USD' }));
              dispatch(setPRField({ field: 'selectedAccount', value: undefined }));
            }
          }}>
            <Radio value={'client'}>Client</Radio>
            <Radio value={'vendor'}>Vendor</Radio>
            <Radio value={'agent'}>Agent</Radio>
          </Radio.Group>
        </Col>
        <Col md={3}>
          <b>Pay Type</b>
          <Radio.Group style={{marginLeft: 10}} disabled={state.type == 'agent' && !state.advance ? true : false} value={state.payType} onChange={(e)=>{dispatch(setPRField({ field: 'payType', value: e.target.value }))}}>
            <Radio value={'Payble'}>Payable</Radio>
            <Radio value={'Recievable'}>Receivable</Radio>
          </Radio.Group>
        </Col>
        <Col md={6}>
          <Row style={{ display: "flex", justifyContent: "flex-end", height: '30px' }}>
            {(!(state.selectedAccount==""||state.selectedAccount==undefined)&&state.edit)&&<Col md={2}>
              <button style={{ fontSize: 14, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "100%", backgroundColor: "#921a12", color: "white", borderRadius: 20 }}
              onClick={()=>{
                dispatch(setPRField({ field: 'delete', value: true }))
              }}
              ><span style={{marginRight: 5}}>Delete</span> <MdDeleteForever style={{ fontSize: 16 }}/></button>
            </Col>}
            {((state.selectedAccount!=""&&state.selectedAccount!=undefined)&&!state.edit)&&<Col md={3}>
              <button onClick={()=>{dispatch(setPRField({ field: 'advance', value: true }))}} style={{ fontSize: 14, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "100%", backgroundColor: "#1f2937", color: "white", borderRadius: 20 }}><span style={{marginRight: 5}}>Advance Tran.</span> <DollarOutlined  style={{ fontSize: 16 }}/></button>
            </Col>}
            {(!(state.selectedAccount==""||state.selectedAccount==undefined)&&state.edit)&&<Col md={2}>
              <button onClick={() =>{
                refresh()
              }} style={{ fontSize: 14, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "100%", backgroundColor: "#438995", color: "white", borderRadius: 20 }}><span style={{marginRight: 5}}>Refresh</span> <SyncOutlined style={{ fontSize: 16 }}/></button>
            </Col>}
            {!(state.selectedAccount==""||state.selectedAccount==undefined)&&<Col md={2}>
              <button onClick={()=>{back()}} style={{ fontSize: 14, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "100%", backgroundColor: "#438995", color: "white", borderRadius: 20 }}><ArrowLeftOutlined style={{ fontSize: 16 }}/><span style={{marginLeft: 5}}>Back</span></button>
            </Col>}
          </Row>
        </Col>
      </Row>
      <Row style={{marginTop: 10}}>
        <Col md={6}>
        <Select
          allowClear
          showSearch
          style={{ width: '90%' }}
          placeholder={`Select ${state.type.toUpperCase()}`}
          value={state.selectedAccount}
          options={state.PRaccounts?.map((account) => ({
            label: account.name,
            // label: `(${account.Client_Associations?account.Client_Associations[0].Child_Account.code:account.Vendor_Associations?account.Vendor_Associations[0].Child_Account.code:account.code}) ${account.name}`,
            value: account.id,
          }))}
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
          onChange={(e) => {
            if(e==undefined){
              dispatch(resetState()); 
              fetchOldVouchers();
              fetchAccounts();
            }else{
              console.log("Selected Account:",e)
              dispatch(setPRField({ field: 'selectedAccount', value: e }))
            }
          }}
        />

        </Col>
        <Col md={1}>
          <Select 
            style={{ width: '90%' }}
            placeholder={`Curr`}
            value={state.currency}
            disabled={state.type != 'agent' ? true : false}
            onChange={(e)=>{dispatch(setPRField({ field: 'currency', value: e }))}}
          >
            <Select.Option value="PKR">PKR</Select.Option>
            <Select.Option value="USD">USD</Select.Option>
            <Select.Option value="EUR">EUR</Select.Option>
            <Select.Option value="GBP">GBP</Select.Option>
            <Select.Option vlaue="AED">AED</Select.Option>
            <Select.Option value="OMR">OMR</Select.Option>
            <Select.Option value="BDT">BDT</Select.Option>
            <Select.Option value="CHF">CHF</Select.Option>
          </Select>
        </Col>
        <Col md={5}>        
        <Input
          placeholder="Search..."
          value={searchInput}
          disabled={state.selectedAccount !== "" && state.selectedAccount !== undefined}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        </Col>
      </Row>
      <hr></hr>
      <div style={{overflowY: 'auto', maxHeight: '500px', width: '100%'}}>
      {(state.selectedAccount==""||state.selectedAccount==undefined)&&<table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead className='sticky-header' style={{backgroundColor: '#f3f3f3', color: 'black'}}>
          <tr>
            <th style={{ width: '10%', padding: 10 }}>Voucher No</th>
            <th style={{ width: '30%', padding: 10 }}>Name</th>
            <th style={{ width: '10%', padding: 10 }}>Party</th>
            <th style={{ width: '10%', padding: 10 }}>Type</th>
            <th style={{ width: '10%', padding: 10 }}>Date</th>
            <th style={{ width: '10%', padding: 10 }}>Currency</th>
            <th style={{ width: '10%', padding: 10 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {state.oldVouchers.length > 0 && state.oldVouchers.map((x, i) => {
            return (
              <tr key={i} style={{borderBottom: '1px solid #d7d7d7', cursor: 'pointer'}} onClick={()=>{
                openOldVouchers(x)

                }}>
                <td className='blue-txt fw-6 fs-12' style={{ padding: 10 }}>{x.voucherNo}</td>
                <td style={{ padding: 10 }}>{x.name}</td>
                <td style={{ padding: 10 }}>{x.party}</td>
                <td style={{ padding: 10 }}>{x.type}</td>
                <td style={{ padding: 10 }}>{moment(x.data).format("DD-MM-YYYY")}</td>
                <td style={{ padding: 10 }}>{x.currency}</td>
                <td style={{ padding: 10 }}>{commas(x.amount)}</td>
              </tr>
            )
          })}
        </tbody>
        {state.oldVouchers.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan="7" style={{ textAlign: "center", paddingTop: "20px" }}>
              </td>
            </tr>
          </tfoot>
        )}
      </table>}
      </div>
      {(state.selectedAccount==""||state.selectedAccount==undefined)&&(
        <div style={{ textAlign: "center", paddingTop: "20px" }}>
          <Pagination noOfPages={totalPages} currentPage={page} setCurrentPage={fetchOldVouchers}/>
        </div>
      )}
      {!(state.selectedAccount==""||state.selectedAccount==undefined)&&<BillComp back={back} companyId={Cookies.get('companyId')} state={state} dispatch={dispatch} />}
      <Modal 
        open={state.delete}
        onOk={()=>dispatch(setPRField({ field: 'delete', value: false }))}
        onCancel={()=> dispatch(setPRField({ field: 'delete', value: false }))}
        footer={false}
        maskClosable={false}
        title={<>Delete Voucher</>}
      >   
        <div>
          <h4>Are you sure?</h4>
          <div className='flex '>
            <button className='btn-red' onClick={()=>{
              deleteVoucher()
              dispatch(setPRField({ field: 'delete', value: false }))
            }}>Confirm</button>
            <button className='btn-custom mx-2 px-3'  onClick={() => dispatch(setPRField({ field: 'delete', value: false }))}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default React.memo(PaymentsReceipt)
