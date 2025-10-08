import openNotification from "/Components/Shared/Notification";
import { Col, Row, Spinner } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from 'react-redux';
import Router from "next/router";
import Cookies from 'js-cookie';
import VoucherPrint from "./VoucherPrint";
import Print from "./Print";
import { setField, resetState } from '/redux/vouchers/voucherSlice';
import { DatePicker, Input, InputNumber, Select } from "antd";
import { FaPrint } from "react-icons/fa6";
import { CloseCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { delay } from "../../../../functions/delay";
import ReactToPrint from "react-to-print";
import { useRef } from "react";

const Voucher = ({ id }) => {
  let inputRef = useRef(null);
  const [voucherBuffer, setVoucherBuffer] = useState(false)
  const commas = (a) => a == 0 ? '0' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  const state  = useSelector((state) => state.vouchers);
  const dispatch = useDispatch();
  const [ CompanyId, setCompanyId] = useState(Cookies.get('companyId'))
  const box = { border: '1px solid silver', paddingLeft: 10, paddingTop: 5, paddingBottom: 3, minHeight: 31 }
  const [ voucher, setVoucher ]  = useState({})
  const fetchVoucherData = async () => {
    return axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_VOUCHER_BY_ID, { 
        headers:{ "id": `${id}` }
    }).then((x)=>{
      console.log("Id ka Result:", x.data.result)
      setVoucher(x.data.result)
      dispatch(setField({ field: 'edit', value: true }))
      dispatch(setField({ field: 'id', value: x.data.result.id }))
      dispatch(setField({ field: 'voucher_id', value: x.data.result.voucher_Id }))
      dispatch(setField({ field: 'voucher_No', value: x.data.result.voucher_No }))
      x.data.result.chequeDate?dispatch(setField({ field: 'chequeDate', value: moment(x.data.result.chequeDate.toString()) })):null
      dispatch(setField({ field: 'date', value: moment(x.data.result.createdAt?.toString()) }))
      dispatch(setField({ field: 'vType', value: x.data.result.vType }))
      setCompanyId(x.data.result.CompanyId)
      dispatch(setField({ field: 'chequeNo', value: x.data.result.chequeNo }))
      dispatch(setField({ field: 'currency', value: x.data.result.currency }))
      dispatch(setField({ field: 'exRate', value: x.data.result.exRate }))
      let temp = []
      x.data.result.Voucher_Heads.forEach((x)=>{
        if(x.accountType=="payAccount"){
          dispatch(setField({ field: 'settleVoucherHead', value: x }));
          dispatch(setField({ field: 'settlementAccount', value: x.ChildAccountId }));
          dispatch(setField({ field: 'voucherNarration', value: x.narration }));
        }else{
          temp.push(x)
        }
      })
      dispatch(setField({ field: 'Voucher_Heads', value: temp }))
      dispatch(setField({ field: 'edit', value: true }))
      console.log(">>>>>>>", x.data.result)
        // console.log(x)
    });
  }

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CHILD_ACCOUNTS, {
        headers: {
          CompanyId: CompanyId,
        },
      });
      dispatch(setField({ field: 'cAccounts', value: response.data.result }));
    } catch (error) {
      console.error("Error fetching child accounts:", error);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect( () => {
    if(state.vType=="BPV" || state.vType=="BRV" || state.vType=="CPV" || state.vType=="CRV"){
      if(state.Voucher_Heads.length<1){
        let temp = [...state.Voucher_Heads]
        let Type = ""
        Type = state.vType=="CPV"||state.vType=="BPV"?"debit":state.vType=="CRV"||state.vType=="BRV"?"credit":""
        temp.push({
          defaultAmount: 0.0,
          amount: 0.0,
          type: Type,
          narration: "",
          settlement: "",
          accountType: "",
          ChildAccountId: undefined,
          createdAt: moment()
        })
        let temp1 = {
          ...state.settleVoucherHead,
          type: Type=="debit"?"credit":"debit"
        }
        dispatch(setField({ field: 'settleVoucherHead', value: temp1 }))
        dispatch(setField({ field: 'Voucher_Heads', value: temp }))
      }
    }else{
      if(state.Voucher_Heads.length<1){
        let temp = [...state.Voucher_Heads]
        let Type = ""
        // Type = state.vType=="CPV"||state.vType=="BPV"?"debit":state.vType=="CRV"||state.vType=="BRV"?"credit":""
        temp.push({
          defaultAmount: 0.0,
          amount: 0.0,
          type: "debit",
          narration: "",
          settlement: "",
          accountType: "",
          ChildAccountId: undefined,
          createdAt: moment()
        })
        // temp.push({
        //   defaultAmount: 0.0,
        //   amount: 0.0,
        //   type: "credit",
        //   narration: "",
        //   settlement: "",
        //   accountType: "",
        //   ChildAccountId: undefined,
        //   createdAt: moment()
        // })
        dispatch(setField({ field: 'Voucher_Heads', value: temp }))
      }
    }
  },[state.vType])

  const fetchreceivingAccount = async () => {
    let y = "";
  switch (state.vType) {
    case "BPV":
    case "BRV":
      y = "Bank";
      break;
    case "CPV":
    case "CRV":
      y = "Cash";
      break;
    case "TV":
      y = "Bank";
      break;
    default:
      y = "All"
      break;
  }
    dispatch(setField({ field: 'load', value: true }))
    try{
      await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ACCOUNT_FOR_TRANSACTION_VOUCHER, {
        headers: {
          type: y,
          companyid: CompanyId,
        }
      }).then((x) => {
        console.log(x.data.result)
        dispatch(setField({ field: 'settlementAccounts', value: x.data.result }))
        dispatch(setField({ field: 'load', value: false }))
      })
    }catch(e){
      console.log(e)
    }
  }
  useEffect(() => {
    fetchreceivingAccount()
  }, [state.vType])

  useEffect(() => {
    if(id!="new"){
      dispatch(resetState())
      fetchVoucherData()
      dispatch(setField({ field: 'edit', value: true }))
    }
  }, [id])

  useEffect(() => {
    console.log("STATE:", state)
  },[state])

  const handleDelete = (id) => {
    axios.post(process.env.NEXT_PUBLIC_CLIMAX_POST_DELETE_BASE_VOUCHER, {
      id: id
    }).then((x) => {
      Router.push("/accounts/voucherList")
    })
  };

  const save = async () => {
    await setVoucherBuffer(true)
    await delay(500)
    if(voucherBuffer){
      openNotification('Please Wait', `Already Saving`, 'Orange')
      return
    }
    if(state.vType==""||state.vType==undefined){
      openNotification('Error', `Type not Selected`, 'red')
      await setVoucherBuffer(false)
      return
    }
    // state.vType==""||state.vType==undefined?openNotification('Error', `Type not Selected`, 'red'):null
    if(state.vType!="JV"&&state.vType!="TV"){
      if(state.settlementAccount==""||state.settlementAccount==undefined){
        openNotification('Error', `Settlement Account not Selected`, 'red')
        await setVoucherBuffer(false)
        return
      }
    }else {
      if(state.Voucher_Heads.length<2){
        openNotification('Error', "Must have atleast two accoutns", 'orange')
        await setVoucherBuffer(false)
        return
      }else{
        let d = false
        let c = false
        state.Voucher_Heads.forEach((vh) => {
          vh.type=='debit'?d=true:null
          vh.type=='credit'?c=true:null
        })
        if(!d && !c){
          openNotification('Error', 'Must have a credit and debit Account', 'orange')
          await setVoucherBuffer(false)
          return
        }
      }
    }
    state.debitTotal==0.0||state.debitTotal==undefined?openNotification('Error', `No amount entered`, 'red'):null
    state.Voucher_Heads.forEach((x)=>{
      x.ChildAccountId==""||x.ChildAccountId==undefined?openNotification('Error', `Account not Selected`, 'red'):null
    })
    let narration  = ""
    if(state.vType=="BPV"){
      narration = `Bank Payment ${state.chequeNo!=""?"on Cheque No: "+state.chequeNo+"Date: "+moment(state.chequeDate).format("DD-MM-YYYY"):""}from `
      state.Voucher_Heads.forEach((x)=>{
        narration = narration + `${state.cAccounts.find(y=>y.id==x.ChildAccountId).title}, `
      })
      narration = narration + `to ${state.settlementAccounts.find(x=>x.id==state.settlementAccount).title}`
    }
    if(state.vType=="BRV"){
      narration = `Bank Receipt ${state.chequeNo!=""?"on Cheque No: "+state.chequeNo+", "+"Date: "+moment(state.chequeDate).format("DD-MM-YYYY")+", ":""}from `
      state.Voucher_Heads.forEach((x)=>{
        narration = narration + `${state.cAccounts.find(y=>y.id==x.ChildAccountId).title}, `
      })
      narration = narration + `to ${state.settlementAccounts.find(x=>x.id==state.settlementAccount).title}`
    }
    if(state.vType=="CPV"){
      narration = `Cash Payment ${state.chequeNo!=""?"on Cheque No: "+state.chequeNo+", "+"Date: "+moment(state.chequeDate).format("DD-MM-YYYY")+", ":""}from `
      state.Voucher_Heads.forEach((x)=>{
        narration = narration + `${state.cAccounts.find(y=>y.id==x.ChildAccountId).title}, `
      })
      narration = narration + `to ${state.settlementAccounts.find(x=>x.id==state.settlementAccount).title}`
    }
    if(state.vType=="CRV"){
      narration = `Cash Receipt ${state.chequeNo!=""?"on Cheque No: "+state.chequeNo+", "+"Date: "+moment(state.chequeDate).format("DD-MM-YYYY")+", ":""}from `
      state.Voucher_Heads.forEach((x)=>{
        narration = narration + `${state.cAccounts.find(y=>y.id==x.ChildAccountId).title}, `
      })
      narration = narration + `to ${state.settlementAccounts.find(x=>x.id==state.settlementAccount).title}`
    }
    if(state.vType=="JV"){
      narration = `Journal Transaction ${state.chequeNo!=""?"on Cheque No: "+state.chequeNo+", "+"Date: "+moment(state.chequeDate).format("DD-MM-YYYY")+", ":""}between `
      state.Voucher_Heads.forEach((x)=>{
        narration = narration + `${state.cAccounts.find(y=>y.id==x.ChildAccountId).title}, `
      })
    }
    if(state.vType=="TV"){
      narration = `Transfer ${state.chequeNo!=""?"on Cheque No: "+state.chequeNo+", "+"Date: "+moment(state.chequeDate).format("DD-MM-YYYY")+", ":""}between `
      state.Voucher_Heads.forEach((x)=>{
        narration = narration + `${state.cAccounts.find(y=>y.id==x.ChildAccountId).title}, `
      })
    }

    
      let voucher = {
        type: `${state.vType=="CRV"||state.vType=="BRV"?"Receipt":state.vType=="CPV"||state.vType=="BPV"?"Payment":state.vType=="JV"?"Journal":"Transfer"} Voucher`,
        vType: state.vType,
        currency: state.currency,
        exRate: state.exRate,
        chequeNo: state.chequeNo,
        chequeDate: state.chequeDate,
        costCenter: 'KHI',
        tranDate: state.date,
        subType: state.vType=="CPV"||state.vType=="CRV"?"Cash":state.vType=="BPV"||"BRV"?"Bank":state.vType=="JV"?"Journal":"Transfer",
        CompanyId: CompanyId,
        createdAt: state.date
      }
      if(state.edit){
        voucher.voucher_No = state.voucher_No
        voucher.voucher_Id = state.voucher_id
      }
      let temp = []
      state.Voucher_Heads.forEach((x)=>{
        temp.push({
          ...x,
          narration: x.narration==""?narration:x.narration,
          createdAt: state.date,
          accountType: 'partyAccount',
          defaultAmount: x.amount*state.exRate
        })
      })
      if(state.vType!="JV"&&state.vType!="TV"){
        let abc = {
          ...state.settleVoucherHead,
          createdAt: state.date,
          narration: state.voucherNarration==""?narration:state.voucherNarration,
          accountType: 'payAccount',
          defaultAmount: state.settleVoucherHead.amount*state.exRate,
          ChildAccountId: state.settlementAccount.toString()
        }
        temp.push(abc)
      }
      voucher.Voucher_Heads = temp
      console.log("Vouchers", voucher)
      let result
      if(state.edit && id!="new"){
        // voucher = {
        //   id: state.id,
        //   ...voucher
        // }
        result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/updateVoucher`, {
          id: state.id,
          ...voucher
        }).then((x) => {
          openNotification('Success', `Voucher Updated Successfully`, 'green')
          dispatch(setField({ field: 'edit', value: true }))
          fetchVoucherData()
          // Router.push(`/accounts/vouchers/${x.data.result[0].id}`);
        });
      }else{
        result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/createVoucher`, voucher).then((x) => {
          openNotification('Success', `Voucher Saved Successfully`, 'green')
          dispatch(setField({ field: 'edit', value: true }))
          Router.push(`/accounts/vouchers/${x.data.result.id}`);
        });
      }
      await setVoucherBuffer(false)
      // dispatch(incrementTab({ "label": "Voucher", "key": "3-5", "id": `${result.data.result.id}` }));

    
  }

  useEffect(()=>{
    let debittotal = 0.0
    let credittotal = 0.0
    state.Voucher_Heads.forEach((x)=>{
      if(x.type=="debit"){
        debittotal = debittotal + parseFloat(x.amount)
      }else{
        credittotal = credittotal + parseFloat(x.amount)
      }
    })
    if(state.vType!="JV"&&state.vType!="TV"){
      if(state.settleVoucherHead.type=="debit"){
        debittotal = debittotal + parseFloat(state.settleVoucherHead.amount)
      }else{
        credittotal = credittotal + parseFloat(state.settleVoucherHead.amount)
      }
    }
    dispatch(setField({ field: 'debitTotal', value: debittotal }))
    dispatch(setField({ field: 'creditTotal', value: credittotal }))
  },[state.settleVoucherHead])

  useEffect(()=>{
    if(state.settlementAccount!=undefined){
      // console.log(state.settlementAccounts.find((x)=>x.id==state.settlementAccount).title)
      console.log(state.settlementAccount)
      axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_VOUCEHR_LEDGER_FOR_CLOSING,{
        headers:{
          currency:'PKR',
          id:state.settlementAccount,
        }
      }).then((x)=>{
        if(x?.data?.status=="success"){
          let closingBalance = 0;
          x?.data?.result?.forEach((x)=>{
            x.type == "debit" ?
            closingBalance = closingBalance + parseFloat(x.defaultAmount): 
            closingBalance = closingBalance - parseFloat(x.defaultAmount)
          })
          // setClosing(closingBalance)
          console.log("Closing Balance:", closingBalance)
          dispatch(setField({ field: 'closingBalance', value: closingBalance }))
        }
      })
    }else{
      dispatch(setField({ field: 'closingBalance', value: 0 }))
    }
  },[state.settlementAccount])

  return(
    <div className="base-page-layout fs-11">
      <Row>

        <Col md={6}>
          <Row>
            <Col md={5}>
              <span>Voucher No</span>
              <div style={box}>{state.voucher_id}</div>
            </Col>
            <Col md={4}>
              <span>Date:</span>
              <DatePicker value={moment(state.date)} onChange={(e)=>{dispatch(setField({ field: 'date', value: e }))}} style={{width: '100%'}}></DatePicker>
            </Col>
            <Col md={3}>
              <span>Type</span>
              <Select value={state.vType} onChange={(e)=>{
                  dispatch(setField({ field: 'vType', value: e }))
                  let Type = ""
                  console.log("E>>", e)
                  // Type = e=="CRV"||e=="BRV"?"credit":""
                  Type = e=="CPV"||e=="BPV"?"debit":e=="CRV"||e=="BRV"?"credit":""
                  e=="JV"||e=="TV"?Type="debit":null
                  console.log("Type>>", Type)
                  const updatedInvoiceList = [...state.Voucher_Heads];
                  updatedInvoiceList.forEach((x, index)=>{
                    updatedInvoiceList[index] = {
                      ...updatedInvoiceList[index], 
                      type: Type, 
                    };
                  })
                  const updatedVoucherHead = {
                    ...state.settleVoucherHead,
                    type: Type === "debit" ? "credit" : "debit",
                  };
                  dispatch(setField({ field: 'settlementAccount', value: undefined }))
                  dispatch(setField({ field: 'chequeNo', value: "" }))
                  dispatch(setField({ field: 'chequeDate', value: moment() }))
                  dispatch(setField({ field: 'currency', value: "PKR" }))
                  dispatch(setField({ field: 'exRate', value: "1.00" }))
                  dispatch(setField({ field: 'voucherNarration', value: "" }))
                  dispatch(setField({ field: 'settleVoucherHead', value: {
                    defaultAmount: 0.0,
                    amount: 0.0,
                    type: "",
                    narration: "",
                    settlement: "",
                    accountType: "payAccount",
                    createdAt: moment()
                  } }))
                  dispatch(setField({ field: 'Voucher_Heads', value: [] })); 
                  dispatch(setField({ field: 'settlementAccount', value: undefined }))
                }} style={{width: '100%'}}>
                <Select.Option value="CRV">CRV</Select.Option>
                <Select.Option value="CPV">CPV</Select.Option>
                <Select.Option value="BRV">BRV</Select.Option>
                <Select.Option value="BPV">BPV</Select.Option>
                <Select.Option value="JV">JV</Select.Option>
                <Select.Option value="TV">TV</Select.Option>
              </Select>
            </Col>
          </Row>
          <Row style={{marginTop: '2%'}}>
            <Col md={6}>
              <span>Company</span>
              <div style={{...box, fontSize: 12}}>{CompanyId == "1"?"SEANET SHIPPING & LOGISTICS":"AIR CARGO SERVICES"}</div>
            </Col>
            <Col md={6}>
              <span>Settlement Account</span>
              <Select
                disabled={state.vType=="JV"||state.vType=="TV"}
                allowClear
                showSearch
                style={{ width: '100%' }}
                placeholder={`Select Account`}
                value={state.settlementAccount}
                options={state.settlementAccounts.map((account) => ({
                  label: `(${account.code}) ${account.title}`,
                  value: account.id,
                }))}
                filterOption={(input, option) =>
                  option?.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(e) => {dispatch(setField({ field: 'settlementAccount', value: e }))}}
              />
            </Col>
          </Row>
          <Row style={{marginTop: '2%'}}>
            <Col md={3}>
              <span>Cheque No</span>
              <Input disabled={state.vType=="CRV"||state.vType=="CPV"} value={state.chequeNo} onChange={(e)=>{dispatch(setField({ field: 'chequeNo', value: e.target.value }))}} style={{width: '100%'}}></Input>
            </Col>
            <Col md={3}>
              <span>Cheque Date</span>
              <DatePicker disabled={state.vType=="CRV"||state.vType=="CPV"} value={moment(state.chequeDate)} onChange={(e)=>{dispatch(setField({ field: 'chequeDate', value: e }))}} style={{width: '100%'}}></DatePicker>
            </Col>
            <Col md={3}>
              <span>Currency</span>
              <Select value={state.currency} onChange={(e)=>{dispatch(setField({ field: 'currency', value: e })); dispatch(setField({ field: 'exRate', value: 1 }))}} style={{width: '100%'}}>
                <Select.Option value="PKR">PKR</Select.Option>
                <Select.Option value="USD">USD</Select.Option>
                <Select.Option value="EUR">EUR</Select.Option>
                <Select.Option value="GBP">GBP</Select.Option>
                <Select.Option value="AED">AED</Select.Option>
                <Select.Option value="OMR">OMR</Select.Option>
                <Select.Option value="BDT">BDT</Select.Option>
                <Select.Option value="CHF">CHF</Select.Option>
              </Select>
            </Col>
            <Col md={3}>
              <span>Ex Rate</span>
              <InputNumber disabled={state.currency=='PKR'} value={state.exRate} onChange={(e)=>{dispatch(setField({ field: 'exRate', value: e }))}} style={{width: '100%'}}></InputNumber>
            </Col>
          </Row>
          <Row style={{marginTop: '2%'}}>
            <Col md={12}>
              <span>Settlement Account Narration</span>
              <Input value={state.voucherNarration} onChange={(e)=>{dispatch(setField({ field: 'voucherNarration', value: e.target.value }))}} style={{width: '100%'}}></Input>
              <span style={{color: 'grey'}}>Auto generated if empty, if account narrations are empty same will be entered there</span>
            </Col>
          </Row>
        </Col>
        <Col md={3} style={{borderLeft: '1px solid silver', paddingLeft: 10}}>
          <Row>
            <Col md={8}>
              <span>Debit Total</span>
              <div style={box}>{commas(state.debitTotal)}</div>
            </Col>
          </Row>
          <Row style={{marginTop: '2%'}}>
            <Col md={8}>
              <span>Credit Total</span>
              <div style={box}>{commas(state.creditTotal)}</div>
            </Col>
          </Row>
          <Col md={8}>
            <hr></hr>
          </Col>
          <Row>
            <Col md={8}>
              <span>Closing Balance</span>
              <div style={box}>{commas(state.closingBalance)}</div>
            </Col>
          </Row>
        </Col>
        <Col md={3} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'top', alignItems: 'end'}}>
            <button disabled={state.Voucher_Heads.length==0 && !voucherBuffer} onClick={()=>{save()}} style={{width: '35%', fontSize: '12px', padding: '2.5px 0px', backgroundColor: '#1d1d1f', color: "#d7d7d7", borderRadius: '15px'}}>Save</button>
            <button disabled={state.Voucher_Heads.length==0} onClick={()=>{dispatch(resetState()); fetchAccounts(); fetchreceivingAccount()}} style={{marginTop: '10px', width: '35%', fontSize: '12px', padding: '2.5px 0px', backgroundColor: '#1d1d1f', color: "#d7d7d7", borderRadius: '15px'}}>New Voucher</button>
            {/* <button disabled={state.Voucher_Heads.length==0} onClick={()=>{dispatch(resetState()); fetchAccounts(); fetchreceivingAccount()}} style={{marginTop: '10px', width: '35%', fontSize: '12px', padding: '2.5px 0px', backgroundColor: '#1d1d1f', color: "#d7d7d7", borderRadius: '15px'}}>Print Voucher</button> */}
            <ReactToPrint
              content={() => inputRef}
              trigger={() => (
                <div className="btn-custom fs-11 px-4 my-1 mx-0 d-flex" style={{ minWidth: '100px', maxWidth: '100px'}}><FaPrint/> Print</div>
              )}
            />
        </Col>
      </Row>
      <Col md={12} style={{marginTop: '15px'}}>
        <button
        //  disabled={state.vType!="JV"&&state.vType!="TV"} 
         onClick={()=>{
          let temp = [...state.Voucher_Heads]
          let Type = ""
          Type = state.vType=="CPV"||state.vType=="BPV"?"debit":state.vType=="CRV"||state.vType=="BRV"?"credit":"credit"
          temp.push({
            defaultAmount: 0.0,
            amount: 0.0,
            type: Type,
            narration: "",
            settlement: "",
            accountType: "",
            ChildAccountId: undefined,
            createdAt: moment()
          })
          dispatch(setField({ field: 'Voucher_Heads', value: temp }))
        }} style={{float: 'right', marginBottom: '10px',width: '7.5%', fontSize: '12px', padding: '2.5px 0px', backgroundColor: '#1d1d1f', color: "#d7d7d7", borderRadius: '15px', cursor: 'pointer'}}>Add Row</button>
        <table style={{width: '100%'}}>
          <thead style={{backgroundColor: '#d7d7d7'}}>
            <tr>
              <th style={{paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', border: '1px solid grey'}}>Account</th>
              <th style={{paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', border: '1px solid grey'}}>Type</th>
              <th style={{paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', border: '1px solid grey'}}>Amount</th>
              <th style={{paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', border: '1px solid grey'}}>Amount (LC)</th>
              <th style={{paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', border: '1px solid grey'}}>Narration</th>
              <th style={{paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', border: '1px solid grey'}}></th>
            </tr>
          </thead>
          <tbody>
            {state.Voucher_Heads.map((item, index) => (
              <tr key={index} style={{borderBottom: '1px solid grey'}}>
                <td style={{ width: '25%', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', paddingRight: '10px', border: '1px solid grey'}}>
                <Select
                  allowClear
                  showSearch
                  style={{ width: '100%' }}
                  placeholder={`Select Account`}
                  value={item.ChildAccountId}
                  options={state.cAccounts.map((account) => ({
                    label: `(${account.code}) ${account.title}`,
                    value: account.id,
                  }))}
                  filterOption={(input, option) =>
                    option?.label.toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(e) => {
                    const updatedInvoiceList = [...state.Voucher_Heads]; 
                    updatedInvoiceList[index] = {
                      ...updatedInvoiceList[index], 
                      ChildAccountId: e, 
                    };
                    dispatch(setField({ field: 'Voucher_Heads', value: updatedInvoiceList })); 
                  }}
                />
                </td>
                <td style={{ width: '7.5%', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', paddingRight: '10px', border: '1px solid grey'}}>
                  <Select disabled={state.vType!="JV"&&state.vType!="TV"} style={{width: '100%'}} value={item.type} onChange={(e)=>{
                    // const updatedInvoiceList = [...state.Voucher_Heads]; 
                    // updatedInvoiceList[index] = {
                    //   ...updatedInvoiceList[index], 
                    //   type: e, 
                    // };
                    // dispatch(setField({ field: 'Voucher_Heads', value: updatedInvoiceList })); 
                    const updatedInvoiceList = state.Voucher_Heads.map((voucherHead, i) => ({
                      ...voucherHead,
                      type: i === index ? e : e === 'debit' ? 'credit' : 'debit',
                    }));
                    
                    dispatch(setField({ field: 'Voucher_Heads', value: updatedInvoiceList }));
                    
                  }}>
                    <Select.Option value="debit">Debit</Select.Option>
                    <Select.Option value="credit">Credit</Select.Option>
                  </Select>
                </td>
                <td style={{ width: '10%', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', paddingRight: '10px', border: '1px solid grey'}}>
                  <InputNumber value={item.amount} onChange={async (e) => {
                    e<0?e = e *-1:null
                    const value = e || 0; 
                    const updatedInvoiceList = [...state.Voucher_Heads]; 
                    if(state.vType!="JV"&&state.vType!="TV"){
                      updatedInvoiceList[index] = {
                        ...updatedInvoiceList[index], 
                        amount: value, 
                      };
                      await dispatch(setField({ field: 'Voucher_Heads', value: updatedInvoiceList }));
                    }else{
                      if(state.Voucher_Heads.length<3){
                        const asd = updatedInvoiceList.map((voucherHead) => ({
                          ...voucherHead,
                          amount: value,
                        }));
                        await dispatch(setField({ field: 'Voucher_Heads', value: asd }));
                      }else{
                        const asd = updatedInvoiceList.map((voucherHead, i) => ({
                          ...voucherHead,
                          amount: i==index?value:voucherHead.amount,
                        }));
                        await dispatch(setField({ field: 'Voucher_Heads', value: asd }));
                        
                      }
                    }
                    let total = 0.0
                    state.Voucher_Heads.forEach((x, i)=>{
                      console.log(value, x.amount, total, i, index)
                      // total = total + parseFloat(x.amount)
                      i!=index?total = parseFloat(total) + parseFloat(x.amount):total = parseFloat(total) + parseFloat(value)
                    })
                    console.log(total)
                    const updatedVoucherHead = {
                      ...state.settleVoucherHead,
                      amount: total,
                    };
                    
                    dispatch(setField({ field: 'settleVoucherHead', value: updatedVoucherHead }))
                  }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') 
                  }
                  parser={(value) =>
                    value?.replace(/,/g, '')
                  }
                  style={{width: '100%'}}></InputNumber>
                </td>
                <td style={{ width: '10%', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', paddingRight: '10px', border: '1px solid grey', fontSize: '14px'}}>
                  {commas(item.amount*state.exRate)}
                </td>
                <td style={{ paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', paddingRight: '10px', border: '1px solid grey'}}>
                  <Input value={item.narration} onChange={(e)=>{
                    // const updatedInvoiceList = [...state.Voucher_Heads]; 
                    
                    // updatedInvoiceList[index] = {
                      //   ...updatedInvoiceList[index], 
                      //   defaultAmount: value, 
                      // };
                    const updatedInvoiceList = [...state.Voucher_Heads]; 
                    if(state.vType!="JV"&&state.vType!="TV"){
                      updatedInvoiceList[index] = {
                        ...updatedInvoiceList[index], 
                        narration: e.target.value, 
                      };
                      dispatch(setField({ field: 'Voucher_Heads', value: updatedInvoiceList }));
                    }else{
                      const asd = updatedInvoiceList.map((voucherHead) => ({
                        ...voucherHead,
                        narration: e.target.value,
                      }));
                      dispatch(setField({ field: 'Voucher_Heads', value: asd }));
                    }
                  }}/>
                </td>
                <td style={{ width: '2.5%', paddingTop: '5px', paddingBottom: '5px', paddingLeft: '10px', border: '1px solid grey'}}><CloseCircleOutlined style={{cursor: 'pointer', fontSize: '14px'}} onClick={()=>{
                  let temp = [...state.Voucher_Heads]
                  temp.splice(index, 1)
                  dispatch(setField({ field: 'Voucher_Heads', value: temp }))
                }}/></td>
              </tr>
              ))}
          </tbody>
        </table>
      </Col>
      <div style={{
        display: 'none'
      }}>
        <div ref={(response) => (inputRef = response)}>
          {console.log(voucher)}
          {
            id !== "new" ? 
            ( <Print compLogo={CompanyId} voucherData={voucher} /> )
            :null
          }
        </div>
      </div>
    </div>
  )
  
};

export default Voucher;