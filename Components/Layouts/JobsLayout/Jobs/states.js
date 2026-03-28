import * as yup from "yup";
import axios from "axios";
import moment from "moment";
import { delay } from "/functions/delay";
import openNotification from "../../../Shared/Notification";
import Cookies from "js-cookie";

const SignupSchema = yup.object().shape({
  ClientId: yup.string().required("Client is required"),
  consigneeId: yup.string().required("Consignee is required"),
});

function recordsReducer(state, action){
  switch (action.type) {
    case 'toggle': {
      return { ...state, [action.fieldName]: action.payload } 
    }
    case 'set': {
      return {
          ...state, ...action.payload
      }
    }
    case 'voyageSelection': {
      let temp = state.fields.vessel.filter((x)=> x.id == action.payload)[0].Voyages;
      let newTemp = [];
      temp.forEach((x)=> {
        newTemp.push({...x, check:false, employeeId: Cookies.get("loginId")})
      });
      return {
        ...state,
        voyageVisible: true,
        voyageList:newTemp,
      }
    }
    default: return state 
  }
};

const baseValues = {
  //Basic Info
  id:'',
  customerRef:'',
  fileNo:'',
  jobNo:'',
  costCenter:'KHI',
  shipStatus:'Booked',
  jobDate:moment(),
  jobType:'Direct',
  jobKind:'Current',
  subType:'FCL',
  dg:'non-DG',
  pkgUnit:'',
  shipDate:moment(),
  freightType:'Prepaid',
  nomination:'Free Hand',
  incoTerms:'',
  ClientId:'',
  shipperId:'',
  consigneeId:'',
  commodityId:'',
  overseasAgentId:'',
  salesRepresentatorId:'',
  por: '',
  pol:'PKKHI',
  pod:'',
  fd:'',
  customCheck:[],
  customAgentId:'',
  transportCheck:[],
  transporterId:'',
  forwarderId:'',
  localVendorId:'',
  localVendorId:'',
  airLineId:'',
  shippingLineId:'',
  vesselId:'',
  VoyageId:'',
  cutOffDate:'',
  cutOffTime:'',
  eta:'',
  etd:'',
  cbkg:'',

  aesDate:'',
  aesTime:'',
  siCutOffDate:'',
  siCutOffTime:'',
  eRcDate:'',
  eRcTime:'',
  eRlDate:'',
  eRlTime:'',
  doorMove:'',
  vgmCutOffDate:'',
  vgmCutOffTime:'',

  weight:'',
  weightUnit:'',
  bkg:'',
  container:'',
  shpVol:'',
  billVol:'',
  teu:'',
  pcs:'',
  vol:'',
  volWeight:'',

  cwtLine:'',
  cwtClient:'',

  delivery:'',
  terminal:'',
  freightPaybleAt:'',
  polDate:'',
  podDate:'',
  companyId:'',
  exRate:'1',
  approved:[],
  canceled: false,
  flightNo:'',
  arrivalDate:'',  
  arrivalTime:'',
  departureDate:'',
  departureTime:''
};

const initialState = {
  fetched: false,
  records: [],
  load:false,
  chargeLoad:false,
  visible:false,
  headVisible:false,
  voyageVisible:false,
  edit:false,
  popShow:false,
  viewHistory:false,
  invoiceData : [],
  InvoiceList : [],

  selection:{
    partyId:null,
    InvoiceId:null
  },

  paybleCharges:[],
  reciveableCharges:[],

  payble:{ pp:0.0, cc:0.0, total:0.0, tax:0.0 },
  reciveable:{ pp:0.0, cc:0.0, total:0.0, tax:0.0 },
  netAmount:0.0,

  vendorParties:[],
  clientParties:[],

  headIndex:"",

  values:baseValues,

  title:"",
  note:"",
  notes:[],
  deleteList:[],

  chargesTab:'1',
  selectedInvoice:'',
  loadingProgram:'',
  do:'',
  invoiceData:{},
  exRate:1.00,
  
  voyageList:[],
  consigneeList:[],
  shipperList:[],
  forwarderList:[],
  salesRepList:[],
  carrierList:[
    { id:'Emirates', name:'Emirates' },
    { id:'Elton', name:'Elton' },
  ],
  equipments:[
    {id:'', size:'', qty:'', dg:'', gross:'', teu:''}
  ],
  tabState:"1",
  vendorList:[],
  overseasAgentList:[],
  history:[],
  fields:{
    chargeList:[],
    party:{
      shipper:[],
      consignee:[],
      notify:[],
      client:[]
    },
    vendor:{
      transporter:[],
      forwarder:[],
      overseasAgent:[],
      chaChb:[],
      airLine:[],
      sLine:[],
      localVendor:[]
    },
    commodity:[],
    vessel:[],
    sr:[]
  },
  // Editing Records
  selectedRecord:{},
  oldRecord:{},
};

const memoize = (fn) => {
  let cache = {};
  return (...args) => {
    let n = args[0];
    if (n in cache) {
      return cache[n];
    }
    else {
      let result = fn(n);
      cache[n] = result;
      return result;
    }
  }
}

const getClients = memoize(async(id) => {
  const result = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_CLIENTS_FOR_CHARGES, {
    headers:{id:id} 
  })
  .then((x)=>x.data.result);
  return result;
})

const getVendors = memoize(async(id) => {
  const result = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_VENDORS_FOR_CHARGES, {
    headers:{id:id}, employeeId: Cookies.get("loginId")
  })
  .then((x) => x.data.result)
  return result;
})

const getHeadsNew = async(id, dispatch, reset) => {
  console.log("getHeadsNew from states is running<<<")
  dispatch({type:'toggle', fieldName:'chargeLoad', payload:true})
  let paybleCharges = [];
  let reciveableCharges = [];
  await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_SE_HEADS_NEW,{
    headers:{"id": `${id}`, employeeId: Cookies.get("loginId")}
  }).then(async(x)=>{
    if(x.data.status=="success"){

      let tempChargeHeadsArray = await calculateChargeHeadsTotal([...reciveableCharges, ...paybleCharges], "full");    
      await reset({chargeList:[...x.data.result]});
      dispatch({type:'set', 
      payload:{
        chargeLoad:false,
        ...tempChargeHeadsArray
      }})
    }
  });
}

const saveHeads = async(charges, state, dispatch, reset) => {

  const result = await axios.post(process.env.NEXT_PUBLIC_CLIMAX_SAVE_SE_HEADS_NEW, 
    { charges, deleteList:state.deleteList, id:state.selectedRecord.id, exRate:state.exRate, employeeId: Cookies.get("loginId") }
  ).then(async(x)=>{
    if(x.data.status=="success"){
      await delay(500)
      await getHeadsNew(state.selectedRecord.id, dispatch, reset)
      // await getHeadsNew(state.selectedRecord.id, dispatch, reset)
    }
  })
}

const approve = async(data) => {
  try{
    console.log(data.newInv)
    await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/approve`,{
      id:data.newInv.id, employeeId: Cookies.get("loginId")
    }).then(async(x)=>{
      if(x.data.status=="success"){
        // await getHeadsNew(state.selectedRecord.id, dispatch, reset)
      }
    })
  }catch(e){
    console.error(e)
  }
  
};

const approveHeads = async(charges, state, dispatch, reset) => {
  console.log(charges)
  for(let x of charges){
    console.log(x)
    await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/approveHeads`,{
      id:x.id, employeeId: Cookies.get("loginId")
    }).then(async(x)=>{
      if(x.data.status=="success"){
        // await getHeadsNew(state.selectedRecord.id, dispatch, reset)
      }
    })
    
  }
  await delay(500)
  await getHeadsNew(state.selectedRecord.id, dispatch, reset)
}

async function getChargeHeads (id) {
  let charges = [];
  await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_SE_HEADS_NEW,{
    headers:{"id": `${id}`, employeeId: Cookies.get("loginId")}
  }).then((x)=>{
    if(x.data.status=="success"){
      charges = x.data.result;
    }
  });
  let tempChargeHeadsArray = await calculateChargeHeadsTotal([...charges], "full");    
  return {
    charges,
    ...tempChargeHeadsArray
  }
}

const calculateChargeHeadsTotal = (chageHeads, type) => {
  let rec_ccCharges = 0, pay_ccCharges = 0;
  let rec_ppCharges = 0, pay_ppCharges = 0;
  let rec_tax = 0      , pay_tax = 0;      
  if(chageHeads.length!=0){
    type!="Payble"?chageHeads.forEach((x)=>{
      if(x.pp_cc=="CC"){
        x.type=="Recievable"?rec_ccCharges = rec_ccCharges + parseFloat(x.local_amount):null;
      }else if(x.pp_cc=="PP"){
        x.type=="Recievable"?rec_ppCharges = rec_ppCharges + parseFloat(x.local_amount):null;
      }
      if(x.tax_apply){
        x.type=="Recievable"?rec_tax = rec_tax + parseFloat(x.tax_amount*x.ex_rate):null;
      }
    }):null
    type!="Recievable"?chageHeads.forEach((x)=>{
      if(x.pp_cc=="CC"){
        x.type!="Recievable"?pay_ccCharges = pay_ccCharges + parseFloat(x.local_amount):null;
      }else if(x.pp_cc=="PP"){
        x.type!="Recievable"?pay_ppCharges = pay_ppCharges + parseFloat(x.local_amount):null;
      }
      if(x.tax_apply){
        x.type!="Recievable"?pay_tax = pay_tax + parseFloat(x.tax_amount*x.ex_rate):null;
      }
    }):null
  }
  let obj = {
    payble:{
      pp:pay_ppCharges.toFixed(2) - (pay_tax).toFixed(2),
      cc:pay_ccCharges.toFixed(2),
      total:(pay_ppCharges+pay_ccCharges).toFixed(2),
      tax:(pay_tax).toFixed(2)
    },
    reciveable:{
      pp:rec_ppCharges.toFixed(2) - (rec_tax).toFixed(2),
      cc:rec_ccCharges.toFixed(2),
      total:(rec_ppCharges+rec_ccCharges).toFixed(2),
      tax:(rec_tax).toFixed(2)
    },
  }
  type=="Recievable"?delete obj.payble:null
  type=="Payble"?delete obj.reciveable:null
  return obj
}

const autoInvoice = async (
  list,
  companyId,
  reset,
  invoiceType,
  dispatch,
  state,
  setInvoiceBuffer
) => {
  const tempList = list.filter(x => x.check);

  const grouped = tempList.reduce((acc, item) => {
    acc[item.partyId] ||= [];
    acc[item.partyId].push(item);
    return acc;
  }, {});

  for (const group of Object.values(grouped)) {
    try {
      let tag = "";
      let detectedType = "";

      const seen = new Set();

      for (const charge of group) {
        if (seen.has(charge.charge)) {
          tag = charge.particular;
          if (charge.partyType === "agent") {
            detectedType = "agent";
          }
          break;
        }
        seen.add(charge.charge);
      }

      if (tag && detectedType !== "agent") {
        openNotification(
          "Error",
          `Two instances of the same charge: ${tag}`,
          "red"
        );
        continue;
      }
      await makeInvoice(
        group,
        companyId,
        reset,
        invoiceType,
        dispatch,
        state,
        setInvoiceBuffer
      );
    } catch (e) {
      console.error("AutoInvoice Error:", e);
    }
  }
};

const makeInvoice = async (
  list,
  companyId,
  reset,
  type,
  dispatch,
  state,
  setInvoiceBuffer
) => {
  const tempList = list.map(x => ({ ...x }));

  for (const x of tempList) {
    const amount = Math.abs(parseFloat(x.amount || 0));
    const net = Math.abs(parseFloat(x.net_amount || 0));
    const local = Math.abs(parseFloat(x.local_amount || 0));

    if (x.description && x.invoiceType?.includes("Invoice") && x.type === "Payble") {
      x.amount = -amount;
      x.net_amount = -net;
      x.local_amount = -local;
    }

    if (x.description && x.invoiceType?.includes("Bill") && x.type === "Recievable") {
      x.amount = -amount;
      x.net_amount = -net;
      x.local_amount = -local;
    }
  }

  try {
    if (!tempList.length) return;

    const res = await axios.post(
      process.env.NEXT_PUBLIC_CLIMAX_POST_CREATE_INVOICE_NEW,
      {
        chargeList: tempList,
        companyId,
        type,
        employeeId: Cookies.get("loginId"),
      }
    );

    if (res.data?.status === "success") {
      approve(res.data.result);
      await delay(500);
      await getHeadsNew(state.selectedRecord.id, dispatch, reset);
      alert("Invoice Created Successfully");
    }
    setInvoiceBuffer(false);
  } catch (e) {
    console.error("MakeInvoice Error:", e);
  } finally {
    dispatch({ type: "toggle", fieldName: "chargeLoad", payload: false });
  }
};

const getInvoices = async(id, dispatch) => {
  let result = [];
  await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_IVOICES_TYPES, 
    {headers:{id:id}, employeeId: Cookies.get("loginId")
  }).then((x)=>{
    result = x.data.status=="success"? x.data.result : [];
    dispatch({type:'set', payload:{"InvoiceList":result}})
  })
  //return result;
} 

const getStatus = (val) => {
  return val[0]=="1"?true:false
};
const getStatusCopy = (app, can) => {
  if(app[0]=="1" || can){
    return true
  }else{
    return false
  }
  // return app[0]=="1"?true:false
};

const setHeadsCache = async(chargesData, dispatch, reset) => {
  
  await chargesData?.data?.charges?.length>0?
    reset({chargeList:[ ...chargesData.data.charges ]}):
    null;
  dispatch({type:'set', payload:{
    chargeLoad:false,
    selection:{InvoiceId:null, partyId:null}
  }})
}

export {
  recordsReducer, initialState, baseValues,
  SignupSchema, getClients, getVendors,
  saveHeads, getHeadsNew, getStatus,
  calculateChargeHeadsTotal,
  makeInvoice, getInvoices,
  setHeadsCache, approveHeads, autoInvoice
};