import { getNetInvoicesAmount } from '/functions/amountCalculations';
import { getAccounts, totalRecieveCalc, getInvoices, getTotal } from './states';
import openNotification from '/Components/Shared/Notification';
import TransactionInfo from './TransactionInfo';
import { Empty, InputNumber, Checkbox, Radio, Input, DatePicker, Select, Modal } from 'antd';
import { Spinner, Table, Col, Row } from 'react-bootstrap';
import React, { useEffect, useReducer, useState } from 'react';
import { CloseCircleOutlined } from '@ant-design/icons';
import { incrementTab } from '/redux/tabs/tabSlice';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import Gl from './Gl';
import moment from 'moment';
import { setField } from '/redux/paymentReciept/paymentRecieptSlice';

const commas = (a) => a == 0 ? '0' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const BillComp = ({back, companyId, state, dispatch}) => {
  const [firstCall, setFirstCall] = useState(true);
  const router =  useRouter()

  // useEffect(()=>{
  //   console.log("STATE INVOICES", state.invoices)
  // }, [state.invoices])

  useEffect(() => {
    if(state.autoKnockOff){
      // console.log("KnockOff useEffect")
      let remaining = state.knockOffAmount;
    
      const updatedInvoices = state.invoices.map((invoice, index) => {
        let maxReceivable = 0.0
        // console.log(invoice.total, invoice.recieved, invoice.paid, invoice.constReceiving)
        if(!state.editing && !state.edit){
          maxReceivable = invoice.payType === "Recievable"
            ? (parseFloat(invoice.total) - parseFloat(invoice.constReceiving)) - (parseFloat(invoice.recieved) - parseFloat(invoice.constReceiving))
            : (parseFloat(invoice.total) - parseFloat(invoice.constReceiving)) - (parseFloat(invoice.paid) - parseFloat(invoice.constReceiving));
          }else{
          maxReceivable = invoice.payType === "Recievable"
            ? (parseFloat(invoice.total)) - (parseFloat(invoice.recieved) - parseFloat(invoice.constReceiving))
            : (parseFloat(invoice.total)) - (parseFloat(invoice.paid) - parseFloat(invoice.constReceiving));
        }
    
        let receiving = 0;
    
        if (remaining > 0) {
          if (index === state.invoices.length - 1) {
            receiving = remaining;
            remaining = 0;
          } else {
            receiving = Math.min(maxReceivable, remaining);
            remaining -= receiving;
          }
        }
    
        return {
          ...invoice,
          receiving
        };
      });
    
      dispatch(setField({ field: 'invoices', value: updatedInvoices }));
    }
  }, [state.knockOffAmount]);
  

  useEffect(() => {
    console.log("STATE: ", state)
  }, [state])
  
  

  const fetchInvoices = async () => {
    try{
      // console.log("INVOICES FETCHED!!!!!")
      await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_INVOICE_BY_PARTY_ID, {
        headers: {
          id: state.selectedAccount,
          companyid: companyId,
          invoicecurrency: state.currency,
          pay: state.payType,
          type: state.type,
          // edit: false
        }
      }).then((x) => {
        // console.log("Invoices", x.data.result)
        let temp = []
        !state.edit?temp  = x.data.result.filter(y => parseFloat(y.total)-parseFloat(y.recieved) != 0.0 && parseFloat(y.total)-parseFloat(y.paid) != 0.0):
        temp = x.data.result
        // console.log("Invoices>>", temp)
        temp.forEach((x) => {
          x.receiving = 0.0;
          console.log(x)
          if(x.payType=="Payble"){
            x.constReceiving = x.paid
          }else{
            x.constReceiving = x.recieved
          }
        });
        // console.log("Fetch Invoice Function")
        dispatch(setField({ field: 'invoices', value: temp }))
        dispatch(setField({ field: 'load', value: false }))
      })
    }catch(e){
      console.log(e)
    }
  }
  const [ first, setFirst] = useState(false)
  useEffect(() => {
    if(state.selectedAccount && !state.edit && (state.invoices.length == 0 || (state.invoices.length > 0 && state.invoices[0].party_Id != state.selectedAccount) || (state.invoices.length > 0 && state.invoices[0].currency != state.currency) || (state.invoices.length > 0 && state.invoices[0].payType != state.payType))){
      fetchInvoices()
      setFirst(true)
    }
    if(state.currency=="PKR"){
      dispatch(setField({ field: 'exRate', value: 1.0 }))
    }
  }, [state.selectedAccount, state.payType, state.currency])

  // useEffect(()=>{
  //   if(state.selectedAccount && !state.edit && state.invoices.length>0 && state.currency != state.invocies[0].currency){
  //     fetchInvoices()
  //   }
  // },[state.currency])

  useEffect(() => {
    // console.log(state.receivingAccounts)
    const fetchreceivingAccount = async () => {
      dispatch(setField({ field: 'load', value: true }))
      try{
        // console.log(state)
        // console.log(companyId)
        await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ACCOUNT_FOR_TRANSACTION, {
          headers: {
            type: state.transactionMode,
            companyid: companyId,
          }
        }).then((x) => {
          // console.log(x.data.result)
          dispatch(setField({ field: 'receivingAccounts', value: x.data.result }))
          dispatch(setField({ field: 'load', value: false }))
        })
      }catch(e){
        console.log(e)
      }
    }
    fetchreceivingAccount()
  }, [state.transactionMode])

  useEffect(() => {
    const fetchreceivingAccount = async () => {
      dispatch(setField({ field: 'load', value: true }))
      try{
        await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ACCOUNT_FOR_TRANSACTION, {
          headers: {
            type: "Adjust",
            companyid: companyId,
          }
        }).then((x) => {
          dispatch(setField({ field: 'adjustAccounts', value: x.data.result }))
          dispatch(setField({ field: 'load', value: false }))
        })
      }catch(e){
        console.log(e)
      }
    }
    fetchreceivingAccount()
  }, [state.transactionMode])

  const [ total, setTotal ] = useState(0.0)
  const [ isFirst, setIsFirst ] = useState(true)

  useEffect(() => {
    if((state.advance || state.edit) && isFirst){
      setTotal(state.totalReceivable)
      setIsFirst(false)
    }
    // if(state.advance && isFirst){
    //   setTotal(state.totalReceivable)
    //   setIsFirst(false)
    // }
    let temp = 0.0
    let gainLoss = 0.0
    state.invoices.forEach((x) => {
      // console.log("Invoice: ", x)
      x.payType=="Recievable"?
      temp = parseFloat(x.receiving)!=0?temp+parseFloat(x.receiving):temp:
      temp = parseFloat(x.receiving)!=0?temp-parseFloat(x.receiving):temp
      if(x.currency!="PKR"){
        // console.log("X:",x)
        const receiving = x.payType=="Recievable"?parseFloat(x.receiving) != 0 ? parseFloat(x.receiving) : parseFloat(x.recieved):parseFloat(x.receiving) != 0 ? parseFloat(x.receiving) : parseFloat(x.paid)
        // console.log(parseFloat(x.receiving), parseFloat(x.recieved), receiving)
        const exRate = parseFloat(x.ex_rate) || 0;
        const stateRate = parseFloat(state.exRate) || 0;

        if (x.payType !== "Payble") {
          gainLoss += (receiving * stateRate) - (receiving * exRate);
        } else {
          gainLoss += (receiving * exRate) - (receiving * stateRate);
        }
      }
    })
    // if(state.edit && temp == 0){
    //   temp = total
    // }
    // console.log("GainLoss Amount: ", gainLoss)
    if(state.invoices.length>0){
      // setTotal(temp)
      dispatch(setField({ field: 'totalReceivable', value: temp }))
      dispatch(setField({ field: 'gainLossAmount', value: gainLoss }))
      
    }
  },[state.invoices, state.exRate])

  useEffect(() => {
    let temp = 0.0
    if(state.percent){
      state.totalReceivable>0?
      temp = state.totalReceivable*(state.taxPercent/100):
      temp = (state.totalReceivable*-1)*(state.taxPercent/100)
      dispatch(setField({ field: 'taxAmount', value: temp }))
    }
  },[state.taxPercent, state.invoices])

  const submitTransaction = async () => {
    try{
        console.log("Make Transaction:", state)
        await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/makeTransaction`, {
          transactions: state.transactions,
          invoices: state.invoices,
          gainLoss: state.gainLossAmount,
          totalReceiving: state.totalReceivable,
          partyId: state.selectedAccount,
          partyName: state.type=="client"?state.accounts.find((x) => x.Client_Associations[0].ChildAccountId === state.selectedAccount)?.name || "N/A":state.accounts.find((x) => x.Vendor_Associations[0].ChildAccountId === state.selectedAccount)?.name || "N/A",
          partyType: state.type,
          type: state.onAccount,
          transactionMode: state.transactionMode,
          payType: state.payType,
          currency: state.currency,
          checkNo: state.checkNo,
          checkDate: state.checkDate,
          transactionMode: state.transactionMode,
          subType: state.subType,
          exRate: state.exRate,
          date: state.date,
          companyId: companyId,
          tranDate: state.date,
          edit: state.edit,
          advance: state.advance,
          voucherId: state.voucherId,
          narration: state.voucherNarration
        }).then((x) => {
          x.data.status=="success"?back():null
          x.data.status=="success"?openNotification('Success', `Transaction Saved`, 'green'):openNotification('Error', `Error saving transaction`, 'red')
          dispatch(setField({ field: 'modal', value: false }))
        })

      }catch(e){
        console.error(e)
      }
  }

  useEffect(()=>{
    // console.log("Change in GainLoss", state.gainLossAmount)
  },[state.gainLossAmount])

  const makeTransaction = () => {
    if(state.currency!="PKR" && state.exRate<=50){
      openNotification('Failure', `Select Proper ExChange Rate`, 'red')
      return
    }
    if(state.totalReceivable==0){
      openNotification('Failure', `No transaction selected`, 'red')
      return
    }
    if(state.receivingAccount==undefined){
      openNotification('Failure', `Select Receiving Account`, 'red')
      return
    }
    if(state.transactionMode!="Cash"&&state.checkNo==""){
      openNotification('Failure', `Enter Cheque No.`, 'red')
      return
    }
    if((state.gainLossAmount!=0&&state.gainLossAmount!=undefined) && state.gainLossAccount==undefined){
      openNotification('Failure', `Select Gain Loss Account`, 'red')
      return
    }
    if(state.bankChargesAmount!=0 && state.bankChargesAccount==undefined){
      openNotification('Failure', `Select Bank Charges Account`, 'red')
      return
    }
    if((state.taxAmount!=0&&state.taxAmount!=undefined) && state.taxAccount==undefined){
      openNotification('Failure', `Select Tax Account`, 'red')
      return
    }

    // console.log(state.totalReceivable)
    let temp = []
    if(!state.advance){
      if(state.totalReceivable!=0){
        temp.push({
          partyId: state.selectedAccount,
          accountType: "partyAccount",
          accountName: state.type=="client"?state.accounts.find((x) => x.Client_Associations[0].ChildAccountId === state.selectedAccount)?.name || "N/A":state.accounts.find((x) => x.Vendor_Associations[0].ChildAccountId === state.selectedAccount)?.name || "N/A",
          debit: state.totalReceivable<0?state.totalReceivable*-1:0,
          credit: state.totalReceivable>0?state.totalReceivable:0,
          type: state.totalReceivable<0?'debit':'credit'
        })
      }
      let accountAmount = state.totalReceivable<0?state.totalReceivable*-1:state.totalReceivable
      accountAmount = state.totalReceivable>0?accountAmount-state.bankChargesAmount:accountAmount+state.bankChargesAmount
      accountAmount = state.totalReceivable>0?accountAmount-state.taxAmount:accountAmount+state.taxAmount
      // accountAmount = state.totalReceivable<0?(state.gainLossAmount/state.exRate)>0?accountAmount+(state.gainLossAmount/state.exRate):accountAmount-(state.gainLossAmount/state.exRate):(state.gainLossAmount/state.exRate)<0?accountAmount+(state.gainLossAmount/state.exRate):accountAmount-(state.gainLossAmount/state.exRate)
      if(state.totalReceivable!=0){
        temp.push({
          partyId: state.receivingAccount,
          accountType: "payAccount",
          accountName: state.receivingAccounts.find((x) => x.id === state.receivingAccount)?.title || "N/A",
          debit: state.totalReceivable>0?accountAmount:0,
          credit: state.totalReceivable<0?accountAmount:0,
          type: state.totalReceivable>0?'debit':'credit'
        })
      }
      if(state.gainLossAmount!=0){
        temp.push({
          partyId: state.gainLossAccount,
          accountType: "Gain/Loss Account",
          accountName: state.adjustAccounts.find((x) => x.id === state.gainLossAccount)?.title || "N/A",
          credit: state.gainLossAmount>0?state.gainLossAmount/state.exRate:0,
          debit: state.gainLossAmount<0?(state.gainLossAmount*-1)/state.exRate:0,
          type: state.gainLossAmount<0?'debit':'credit'
        })
        temp.push({
          partyId: state.selectedAccount,
          accountType: "Gain/Loss Account",
          accountName: state.type=="client"?state.accounts.find((x) => x.Client_Associations[0].ChildAccountId === state.selectedAccount)?.name || "N/A":state.accounts.find((x) => x.Vendor_Associations[0].ChildAccountId === state.selectedAccount)?.name || "N/A",
          debit: state.gainLossAmount>0?state.gainLossAmount/state.exRate:0,
          credit: state.gainLossAmount<0?(state.gainLossAmount*-1)/state.exRate:0,
          type: state.gainLossAmount>0?'debit':'credit'
        })
      }
      if(state.bankChargesAmount!=0){
        temp.push({
          partyId: state.bankChargesAccount,
          accountType: state.transactionMode=="Cash"?"Cash Charges Account":state.transactionMode=="Cash"?"Bank Charges Account":"Adjust Charges Account",
          accountName: state.adjustAccounts.find((x) => x.id === state.bankChargesAccount)?.title || "N/A",
          debit: Math.abs(state.bankChargesAmount),
          credit: 0,
          type: 'debit'
        })
      }
      if(state.taxAmount!=0){
        temp.push({
          partyId: state.taxAccount,
          accountType: "Tax Account",
          accountName: state.adjustAccounts.find((x) => x.id === state.taxAccount)?.title || "N/A",
          debit: state.taxAmount,
          credit: 0,
          type: 'debit'
        })
      }
    }else{
      if(state.totalReceivable!=0){
        temp.push({
          partyId: state.selectedAccount,
          accountType: "partyAccount",
          accountName: state.type=="client"?state.accounts.find((x) => x.Client_Associations[0].ChildAccountId === state.selectedAccount)?.name || "N/A":state.accounts.find((x) => x.Vendor_Associations[0].ChildAccountId === state.selectedAccount)?.name || "N/A",
          debit: state.payType!="Recievable"?state.totalReceivable:0,
          credit: state.payType=="Recievable"?state.totalReceivable:0,
          type: state.payType!="Recievable"?'debit':'credit'
        })
      }
      let accountAmount = state.totalReceivable<0?state.totalReceivable*-1:state.totalReceivable
      accountAmount -= state.bankChargesAmount
      accountAmount -= state.taxAmount
      accountAmount -= state.gainLossAmount/state.exRate
      // console.log(accountAmount)
      if(state.totalReceivable!=0){
        temp.push({
          partyId: state.receivingAccount,
          accountType: "payAccount",
          accountName: state.receivingAccounts.find((x) => x.id === state.receivingAccount)?.title || "N/A",
          debit: state.payType=="Recievable"?accountAmount:0,
          credit: state.payType!="Recievable"?accountAmount:0,
          type: state.payType=="Recievable"?'debit':'credit'
        })
      }
    if(state.gainLossAmount!=0){
      temp.push({
        partyId: state.gainLossAccount,
        accountType: "Gain/Loss Account",
        accountName: state.adjustAccounts.find((x) => x.id === state.gainLossAccount)?.title || "N/A",
        debit: state.payType=="Recievable"?state.gainLossAmount>0.0?state.gainLossAmount/state.exRate:0:state.gainLossAmount<0?(state.gainLossAmount*-1)/state.exRate:0,
        credit: state.payType!="Recievable"?state.gainLossAmount>0.0?state.gainLossAmount/state.exRate:0:state.gainLossAmount<0?(state.gainLossAmount*-1)/state.exRate:0,
        type: state.payType!="Recievable"?state.gainLossAmount>0.0?'credit':'debit':state.gainLossAmount<0?'credit':'debit'
      })
    }
    if(state.bankChargesAmount!=0){
      temp.push({
        partyId: state.bankChargesAccount,
        accountType: state.transactionMode=="Cash"?"Cash Charges Account":state.transactionMode=="Cash"?"Bank Charges Account":"Adjust Charges Account",
        accountName: state.adjustAccounts.find((x) => x.id === state.bankChargesAccount)?.title || "N/A",
        debit: state.payType=="Recievable"?state.bankChargesAmount:0,
        credit: state.payType!="Recievable"?state.bankChargesAmount:0,
        type: state.payType=="Recievable"?'debit':'credit'
      })
    }
    if(state.taxAmount!=0){
      temp.push({
        partyId: state.taxAccount,
        accountType: "Tax Account",
        accountName: state.adjustAccounts.find((x) => x.id === state.taxAccount)?.title || "N/A",
        debit: state.payType=="Recievable"?state.taxAmount:0,
        credit: state.payType!="Recievable"?state.taxAmount:0,
        type: state.payType=="Recievable"?'debit':'credit'
      })
    }
    }
    let totalDebit = 0.0
    let totalCredit = 0.0
    temp.forEach((x)=>{
      totalDebit+=x.debit
      totalCredit+=x.credit
    })
    temp.push({
      accountType: "",
      accountName: "Total",
      debit: totalDebit,
      credit: totalCredit
    })
    dispatch(setField({ field: 'transactions', value: temp }))
    dispatch(setField({ field: 'modal', value: true }))

  }

  const calculateColor = (invoice) => {
    const amountDue = invoice.payType === "Recievable"
      ? (state.edit === false
          ? invoice.total - invoice.recieved - invoice.receiving
          : invoice.receiving === 0
            ? invoice.total - invoice.recieved
            : invoice.total - invoice.receiving)
      : (state.edit === false
          ? invoice.total - invoice.paid - invoice.receiving
          : invoice.receiving === 0
            ? invoice.total - invoice.paid
            : invoice.total - invoice.receiving);
  
    if (amountDue > 0) {
      return 'green';
    } else if (amountDue < 0) {
      return 'red';
    } else {
      return 'black';
    }
  };
  

  return (
  <>
  <Row>

    <Col md={7}>
      <Row>
        <Col md={5}>
          <span style={{marginLeft: '5px'}}>Transaction Mode</span>
          <Radio.Group style={{display: 'flex', marginLeft: '5px', marginTop: '5px'}} value={state.transactionMode} onChange={(e) => {dispatch(setField({ field: 'transactionMode', value: e.target.value })); e.target.value=="Cash"?dispatch(setField({ field: 'subType', value: "Cash" })):dispatch(setField({ field: 'subType', value: "Cheque" })); dispatch(setField({field: "receivingAccount", value: undefined}))}}>
            <Radio value={"Cash"}>  Cash  </Radio>
            <Radio value={"Bank"}>  Bank  </Radio>
            <Radio value={"Adjust"}>Adjust</Radio>
          </Radio.Group>
        </Col>
        <Col md={2}>
        <span style={{marginLeft: '5px'}}>Date</span>
          <DatePicker allowClear={false} style={{width: '100%'}} value={moment(state.date)} onChange={(e) => {dispatch(setField({ field: 'date', value: moment(e) }))}}></DatePicker>
        </Col>
        <Col md={2}>
        <span style={{marginLeft: '5px'}}>SubType</span>
          <Select style={{width: '100%'}} value={state.subType} onChange={(e) => dispatch(setField({ field: 'subType', value: e }))}>
            <Select.Option value="Cheque">Cheque</Select.Option>
            <Select.Option value="Credit Cart">Credit Card</Select.Option>
            <Select.Option value="Online Transfer">Online Transfer</Select.Option>
            <Select.Option value="Wire Transfer">Wire Transfer</Select.Option>
            <Select.Option value="Cash">Cash</Select.Option>
          </Select>
        </Col>
      </Row>
      <Row style={{marginTop: '25px'}}>
        <Col md={3}>
          <span style={{marginLeft: '5px'}}>Cheque/Tran #</span>
          <Input disabled={state.transactionMode=="Cash"} value={state.checkNo} onChange={(e) => dispatch(setField({ field: 'checkNo', value: e.target.value }))}></Input>
        </Col>
        <Col md={2}>
        <span style={{marginLeft: '5px', width: '100%'}}>Cheque Date</span>
          <DatePicker disabled={state.transactionMode=="Cash"} style={{width: '100%'}} value={state.checkDate} onChange={(e) => dispatch(setField({ field: 'checkDate', value: e }))}></DatePicker>
        </Col>
        <Col md={4}>
        <span style={{marginLeft: '5px'}}>{state.payType!="Recievable"?"Paying":"Receiving"} Account*</span>
        <Select
          allowClear
          showSearch
          style={{ width: '100%' }}
          placeholder={`Select Account`}
          value={state.receivingAccount}
          options={state.receivingAccounts.map((account) => ({
            label: `(${account.code}) ${account.title}`,
            value: account.id,
          }))}
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
          onChange={(e) => {dispatch(setField({ field: 'receivingAccount', value: e }))}}
        />
        </Col>
        <Col md={3}>
        <span style={{marginLeft: '5px'}}>On Account</span>
          <Select value={state.onAccount} onChange={(e)=>{dispatch(setField({field: 'onAccount', value: e.target.value}))}} style={{width: '100%'}}>
            <Select.Option value="client">Client</Select.Option>
            <Select.Option value="shipper">Shipper</Select.Option>
            <Select.Option value="importer">Importer</Select.Option>
            <Select.Option value="clearingAgent">Clearing Agent</Select.Option>
          </Select>
        </Col>
      </Row>
      <Row style={{marginTop: '10px'}}>
        <Col md={8}>
        <span style={{marginLeft: '5px'}}>Narration</span>
        <Input value={state.voucherNarration} onChange={(e)=>{
          dispatch(setField({ field: 'voucherNarration', value: e.target.value }))
        }}/>
        </Col>
      </Row>
      <Row style={{marginTop: '10px'}}>
        <Col md={3}>
        <span style={{marginLeft: '5px'}}>Bank Charges</span>
        <InputNumber
        disabled={state.bankChargesAccount==undefined}
        formatter={(value) =>
          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') // Add commas as thousands separators
        }
        parser={(value) =>
          value?.replace(/,/g, '') // Remove commas for the actual value
        }
        style={{width: '100%'}} value={state.bankChargesAmount} onChange={(e) => dispatch(setField({ field: 'bankChargesAmount', value: e }))}></InputNumber>
        </Col>
        <Col md={6}>
        <span style={{marginLeft: '5px'}}>Bank Charges Account</span>
        <Select
          allowClear
          showSearch
          style={{ width: '100%' }}
          placeholder={`Select Account`}
          value={state.bankChargesAccount}
          options={state.adjustAccounts.map((account) => ({
            label: `(${account.code}) ${account.title}`,
            value: account.id,
          }))}
          filterOption={(input, option) =>
            option?.label.toLowerCase().includes(input.toLowerCase())
          }
          onChange={(e) => {dispatch(setField({ field: 'bankChargesAccount', value: e })); e==undefined?dispatch(setField({ field: 'bankChargesAmount', value: 0.0 })):null}}
        />
        </Col>
      </Row>
    </Col>
    
    <Col md={5} style={{borderLeft: '1px solid #dee2e6', paddingLeft: '10px'}}>
        {/* <span style={{marginLeft: '5px'}}>Auto KnockOff</span> */}
        <Row>
          <Col md={3}>
            <span style={{marginLeft: '5px', fontWeight: 'bold'}}>Ex. Rate</span>
            <InputNumber disabled={state.currency=='PKR'} style={{width: '100%'}} value={state.exRate} onChange={(e) => dispatch(setField({ field: 'exRate', value: e }))}></InputNumber>
          </Col>
          <Col md={4}>
          {state.totalReceivable<0||(state.advance&&state.payType=='Payble')?<span style={{fontWeight: 'bold'}}>Total Payable Amount</span>:<span style={{fontWeight: 'bold'}}>Total Receivable Amount</span>}
          {!state.advance&&!state.autoKnockOff&&<span style={{width: '100%', height: '60%', display: 'flex', justifyContent: 'left', alignItems: 'center', border: '1px solid #d7d7d7', paddingLeft: '10px'}}>{state.totalReceivable>=0?commas(state.totalReceivable):commas(state.totalReceivable*-1)}</span>}
          {(state.advance||state.autoKnockOff)&&<InputNumber
          value={state.autoKnockOff?state.knockOffAmount:state.totalReceivable}
          onChange={(e) => {
            // console.log(state.advance)
            // console.log(state.autoKnockOff)
            if(state.advance){
              dispatch(setField({ field: 'totalReceivable', value: e }))
            }else if(state.autoKnockOff){
              dispatch(setField({ field: 'knockOffAmount', value: e }))
            }
          }}
          style={{width: '100%'}}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') // Add commas as thousands separators
          }
          parser={(value) =>
            value?.replace(/,/g, '') // Remove commas for the actual value
          }
          >
          </InputNumber>}
          </Col>
          <Col md={5} style={{float: 'right'}}>
            <button onClick={()=>{makeTransaction()}} style={{ fontSize: 14, marginTop: '20px', width: "65%", display: "flex", justifyContent: "center", alignItems: "center", height: "60%", backgroundColor: "#1f2937", color: "white", borderRadius: 20 }}>Make Transaction</button>
          </Col>
        </Row>
        <Row style={{marginTop:'10px'}}>
          <Col md={3}>
            <Checkbox style={{marginTop: '25px'}} onChange={(e) => {dispatch(setField({ field: 'autoKnockOff', value: e.target.checked }))}} checked={state.autoKnockOff}>Auto KnockOff</Checkbox>
          </Col>
          <Col md={3}>
            {state.editing&&<span style={{marginLeft: '5px'}}>Current Payment:</span>}
            {state.editing&&<span style={{width: '100%', height: '60%', display: 'flex', justifyContent: 'left', alignItems: 'center', border: '1px solid #d7d7d7', paddingLeft: '10px'}}>{commas(total)}</span>}
          </Col>
          <Col md={3}>
            {state.editing&&<span style={{marginLeft: '5px'}}>Current Balance:</span>}
            {state.editing&&<span style={{width: '100%', height: '60%', display: 'flex', justifyContent: 'left', alignItems: 'center', border: '1px solid #d7d7d7', paddingLeft: '10px'}}>{state.totalReceivable>=0?commas(parseFloat(total)-state.totalReceivable):commas(parseFloat(total)-(state.totalReceivable*-1))}</span>}
          </Col>
        </Row>
        <Row>

        </Row>
        <Row style={{display: 'flex', alignItems: 'center'}}>
          <Col md={3} style={{marginTop: '10px'}}>
            <span style={{marginLeft: '5px'}}>Tax Amount</span>
            <InputNumber
            disabled={state.percent}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') // Add commas as thousands separators
            }
            parser={(value) =>
              value?.replace(/,/g, '') // Remove commas for the actual value
            }
            style={{width: '100%'}} value={state.taxAmount} onChange={(e) => {
              // e<0?e = e *-1:null
              const value = e || 0;
              dispatch(setField({ field: 'taxAmount', value: value }))
            }}></InputNumber>
          </Col>
          <Col md={1} style={{ paddingTop: '5%'}}>
            <Checkbox checked={state.percent} onChange={(e) => {dispatch(setField({ field: 'percent', value: e.target.checked })); dispatch(setField({ field: 'taxPercent', value: 0 })); dispatch(setField({ field: 'taxAmount', value: 0 }))}}>%</Checkbox>
          </Col>
          <Col md={2} style={{marginTop: '10px'}}>
            <span style={{marginLeft: '5px'}}>Tax %</span>
            <InputNumber value={state.taxPercent} onChange={(e) => {
              dispatch(setField({ field: 'taxPercent', value: e }))
            }} disabled={!state.percent} style={{width: '100%'}}></InputNumber>
          </Col>
          <Col md={6} style={{marginTop: '10px'}}>
            <span style={{marginLeft: '5px'}}>Tax Account</span>
            <Select
              allowClear
              showSearch
              style={{ width: '100%' }}
              placeholder={`Select Account`}
              value={state.taxAccount}
              options={state.adjustAccounts.map((account) => ({
                label: `(${account.code}) ${account.title}`,
                value: account.id,
              }))}
              filterOption={(input, option) =>
                option?.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(e) => {dispatch(setField({ field: 'taxAccount', value: e })), e==undefined?dispatch(setField({ field: 'taxAmount', value: 0.0 })):null}}
            />
          </Col>
        </Row>
        <Row>
          <Col md={3} style={{marginTop: '10px'}}>
            <span style={{marginLeft: '5px', color: state.gainLossAmount > 0.00 ? 'green' : 'black', fontWeight: state.gainLossAmount > 0.00 ? 'bold' : 'normal'}}>Gain</span>
            <span style={{marginLeft: '5px'}}>/</span>
            <span style={{marginLeft: '5px', color: state.gainLossAmount < 0.00 ? 'red' : 'black', fontWeight: state.gainLossAmount < 0.00 ? 'bold' : 'normal'}}>Loss</span>
            <span style={{width: '100%', height: '60%', display: 'flex', justifyContent: 'left', alignItems: 'center', border: '1px solid #d7d7d7', paddingLeft: '10px'}}>{commas(state.gainLossAmount)}</span>
            </Col>
          <Col md={6} style={{marginTop: '10px'}}>
            <span style={{marginLeft: '5px', color: state.gainLossAmount != 0.00 && state.gainLossAccount == null ? 'red' : 'black', fontWeight: state.gainLossAmount != 0.00 ? 'bold' : 'normal'}}>Gain/Loss Account {state.gainLossAmount!=0.00?"*":null}</span>
            <Select
              allowClear
              showSearch
              disabled={state.advance}
              style={{ width: '100%' }}
              placeholder={`Select Account`}
              value={state.gainLossAccount}
              options={state.adjustAccounts.map((account) => ({
                label: `(${account.code}) ${account.title}`,
                value: account.id,
              }))}
              filterOption={(input, option) =>
                option?.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(e) => {dispatch(setField({ field: 'gainLossAccount', value: e }))}}
            />
          </Col>
        </Row>
    </Col>
  </Row>
    {!state.advance&&<Col md={12} style={{marginTop: '25px'}}>
          <table style={{width: '100%'}}>
            <thead style={{backgroundColor: '#f3f3f3'}}>
              <tr>
                <th style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>#</th>
                <th style={{width: '8%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>Job #</th>
                <th style={{width: '8%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>Inv/Bill #</th>
                <th style={{width: '8%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>HBL</th>
                <th style={{width: '8%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>MBL</th>
                <th style={{width: '5%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>Curr</th>
                <th style={{width: '7%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>Ex. Rate</th>
                <th style={{width: '5%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>Type</th>
                <th style={{width: '12%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>Amount</th>
                <th style={{width: '12%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>Recieving Amount</th>
                <th style={{width: '12%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>Balance</th>
                <th style={{width: '3%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>-</th>
                <th style={{width: '10%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', borderRight: '1px solid #dee2e6', padding: '10px 10px'}}>Container</th>
              </tr>
            </thead>
            <tbody>
              {state.invoices.length>0&&state.invoices.map((invoice, index) => (
                <tr key={index} style={{borderBottom: '1px solid #dee2e6', padding: '10px 0px'}}>
                  <td style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>{index + 1}</td>
                  <td className='row-hov blue-txt' style={{width: '8%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}
                  onClick={()=>{
                    let type = invoice.SE_Job?.operation;
                    let id = invoice.SE_Job?.id
                    // console.log(type)
                    // console.log(invoice.SE_Job.id)
                    if(invoice?.SE_Job?.jobNo){
                      dispatch(incrementTab({
                      "label":type=="SE"?"SE JOB":type=="SI"?"SI JOB":type=="AE"?"AE JOB":"AI JOB",
                      "key":type=="SE"?"4-3":type=="SI"?"4-6":type=="AE"?"7-2":"7-5",
                      "id":id
                      }))
                      router.push(type=="SE"?`/seaJobs/export/${id}`:type=="SI"?`/seaJobs/import/${id}`:
                        type=="AE"?`/airJobs/export/${id}`:`/airJobs/import/${id}`
                      )
                    }
                  }
                }
                  ><b>{invoice.SE_Job?.jobNo}</b></td>
                  <td className='row-hov blue-txt' style={{width: '8%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}
                    onClick={()=>{
                      // console.log(invoice)
                      if(invoice?.id){
                        dispatch(incrementTab({ "label": "Invoice Details", "key": "2-11", "id":`${invoice.id}`}))
                        router.push(`/reports/invoice/${invoice.id}`)
                      }
                    }
                  }
                  ><b>{invoice.invoice_No}</b></td>
                  <td style={{width: '8%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>{invoice.SE_Job?.Bl?.hbl}</td>
                  <td style={{width: '8%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>{invoice.SE_Job?.Bl?.mbl}</td>
                  <td style={{width: '5%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>{invoice.currency}</td>
                  <td style={{width: '7%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>{invoice.ex_rate}</td>
                  <td className='blue-txt' style={{width: '5%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}><b>{invoice.payType=="Recievable"?"DN":"CN"}</b></td>
                  <td style={{width: '12%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>{commas(invoice.total)}</td> 
                  {/* {console.log("Invoice!!!:", invoice)} */}
                  <td style={{width: '12%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>{
                    <InputNumber style={{width: '100%'}} value={parseFloat(invoice.receiving)}
                    // disabled={invoice.payType=="Payble"?invoice.total - invoice.paid == 0:invoice.total - invoice.recieved == 0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') 
                    }
                    parser={(value) =>
                      value?.replace(/,/g, '')
                    }
                    onChange={(e) => {
                      e<0?e = e *-1:null
                      const value = e || 0; 
                      const updatedInvoiceList = [...state.invoices]; 
                      updatedInvoiceList[index] = {
                        ...updatedInvoiceList[index], 
                        receiving: value, 
                      };
                      // console.log("Input Number")
                      dispatch(setField({ field: 'invoices', value: updatedInvoiceList })); 
                    }}
                    ></InputNumber>
                    }</td>
                    {/* {console.log(invoice)} */}
                  <td
                    style={{
                      width: '12%',
                      paddingLeft: '5px',
                      borderLeft: '1px solid #dee2e6',
                      padding: '10px 10px',
                      color: calculateColor(invoice),
                    }}
                  >
                    {/* {console.log("Invoice>>>",state)} */}
                    {invoice.payType=="Recievable"?(state.edit==false?
                    commas(parseFloat(invoice.total) - parseFloat(invoice.recieved) - parseFloat(invoice.receiving)):
                    // parseFloat(invoice.receiving)==0?
                    commas(parseFloat(invoice.total) - (parseFloat(invoice.recieved) - parseFloat(invoice.constReceiving)) - parseFloat(invoice.receiving))):
                    // commas(parseFloat(invoice.total) - parseFloat(invoice.receiving))):
                    (state.edit==false?
                      commas(parseFloat(invoice.total) - parseFloat(invoice.paid) - parseFloat(invoice.receiving)):
                      // parseFloat(invoice.receiving)==0?
                      commas(parseFloat(invoice.total) - (parseFloat(invoice.paid) - parseFloat(invoice.constReceiving)) - parseFloat(invoice.receiving))
                      // commas(parseFloat(invoice.total) - parseFloat(invoice.receiving))
                    )
                    }
                  </td>
                  <td style={{width: '3%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px'}}>
                    <input type="checkbox" checked={invoice.payType=="Payble"?invoice.total - invoice.paid - invoice.receiving == 0:invoice.total - invoice.recieved - invoice.receiving == 0} onChange={(e) => {
                      let value = 0
                      if(e.target.checked){
                        if(state.edit){
                          value = invoice.total
                        }else{
                          value = invoice.total - invoice.recieved;
                        }
                      }else{
                        value = 0
                      }
                      const updatedInvoiceList = [...state.invoices];
                      updatedInvoiceList[index] = {
                        ...updatedInvoiceList[index],
                        receiving: value, 
                      };
                      // console.log("Another input")
                      dispatch(setField({ field: 'invoices', value: updatedInvoiceList }));
                    }} />
                  </td>
                  <td style={{width: '10%', paddingLeft: '5px', borderLeft: '1px solid #dee2e6', padding: '10px 10px', borderRight: '1px solid #dee2e6'}}>{invoice.container}</td>
                </tr>
              ))}
            </tbody>
          </table>
    </Col>}
    <Modal title={`Proceed with transaction?`} open={state.modal} onOk={()=>dispatch(setField({ field: 'modal', value: false }))} 
        onCancel={()=>dispatch(setField({ field: 'modal', value: false }))} footer={false} maskClosable={false} width={'80%'} centered
      >
        <span style={{float:'right'}}>Ex Rate: <b>{state.exRate}</b> Currency: <b>{state.currency}</b></span>
        <table style={{width: '100%'}}>
          <thead style={{backgroundColor: '#d7d7d7'}}>
            <tr style={{borderBottom: '1px solid #d7d7d7', padding: '10px 0px'}}>
              <th style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', padding: '10px 10px'}}>Account Type</th>
              <th style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', padding: '10px 10px'}}>Account Name</th>
              <th style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', padding: '10px 10px'}}>Debit</th>
              <th style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', borderRight: '1px solid #d7d7d7', padding: '10px 10px'}}>Credit</th>
              <th style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', borderRight: '1px solid #d7d7d7', padding: '10px 10px'}}>Type</th>
            </tr>
          </thead>
          <tbody>
            {/* {console.log(state.transactions)} */}
            {state.transactions.map((x)=>(
              <tr key={x.partyId} style={{borderBottom: '1px solid #d7d7d7', padding: '10px 0px'}}>
                <td style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', padding: '10px 10px'}}>{x.accountType}</td>
                <td style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', padding: '10px 10px'}}>{x.accountName}</td>
                <td style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', padding: '10px 10px'}}>{commas(x.debit)}</td>
                <td style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', borderRight: '1px solid #d7d7d7', padding: '10px 10px'}}>{commas(x.credit)}</td>
                <td style={{width: '2%', paddingLeft: '5px', borderLeft: '1px solid #d7d7d7', borderRight: '1px solid #d7d7d7', padding: '10px 10px'}}>{x.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={()=>{submitTransaction()}} style={{border: '1px solid #1d1d1f', borderRadius: '15px', marginTop: '10px', backgroundColor: '#1d1d1f', color: '#f3f3f3', padding: '2px 10px'}}>Approve & Save</button>
    </Modal>
  </>
  )
}

export default React.memo(BillComp)