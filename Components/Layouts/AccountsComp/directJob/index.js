import { DeleteOutlined, DollarOutlined, EditOutlined, LoadingOutlined, PlusOutlined, SaveOutlined, SearchOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Pagination, InputNumber, Select, DatePicker, Checkbox, Modal } from "antd";
import PopConfirm from 'Components/Shared/PopConfirm';
import { incrementTab, removeTabNew } from 'redux/tabs/tabSlice';
import moment from "moment";
import Router from 'next/router';
import { useEffect, useState } from "react";
import { setDJField, resetDirectJob, updateDirectJobItem } from 'redux/directJob/directJobSlice';
import { useDispatch, useSelector } from "react-redux";
import openNotification from 'Components/Shared/Notification';
import axios from "axios";
import Cookies from "js-cookie";
import Operation from "antd/lib/transfer/operation";

const commas = (a) => a == 0 ? '0.00' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const DirectJob = ({ id }) => {

    const state = useSelector((state) => state.directJob);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/getDirectJob`,
                {
                    headers: {
                    id: id   // <-- whatever your ID value is
                    }
                }
                );
                console.log("Data Fetched", res.data.result)
                dispatch(resetDirectJob());
                dispatch(setDJField({ field: "directJob_Id", value: res.data.result.id.toString() }));
                dispatch(setDJField({ field: "directJob_Account", value: res.data.result.Account_No.toString() }));
                dispatch(setDJField({ field: "directJob_ChequeDate", value: res.data.result.Cheque_Date }));
                dispatch(setDJField({ field: "directJob_ChequeNo", value: res.data.result.Cheque_No }));
                dispatch(setDJField({ field: "directJob_Currency", value: res.data.result.Currency }));
                dispatch(setDJField({ field: "directJob_DrawnAt", value: res.data.result.Drawn_At }));
                dispatch(setDJField({ field: "directJob_EntryNumber", value: res.data.result.Entry_No }));
                dispatch(setDJField({ field: "directJob_ExRate", value: res.data.result.Ex_Rate }));
                dispatch(setDJField({ field: "directJob_JobType", value: res.data.result.Job_Type }));
                dispatch(setDJField({ field: "directJob_Operation", value: res.data.result.Operation }));
                dispatch(setDJField({ field: "directJob_PaidTo", value: res.data.result.Paid_To.toString() }));
                dispatch(setDJField({ field: "directJob_Reference", value: res.data.result.Reference_No }));
                dispatch(setDJField({ field: "directJob_SubType", value: res.data.result.SubType }));
                dispatch(setDJField({ field: "directJob_EntryDate", value: res.data.result.Entry_Date }));
                dispatch(setDJField({ field: "directJob_TransMode", value: res.data.result.Tran_Mode }));
                dispatch(setDJField({ field: "directJob_Type", value: res.data.result.Type }));
                dispatch(setDJField({ field: "directJob_EntryDate", value: res.data.result.updatedAt }));
                // dispatch(setDJField({ field: "directJob_Remarks", value: res.data.result.Remarks }));
                dispatch(setDJField({ field: "directJob_VoucherNumber", value: res.data.result.Associations[0].Voucher.voucher_Id }));
                dispatch(setDJField({ field: "directJob_VoucherId", value: res.data.result.Associations[0].Voucher.id }));
                let ass = []
                res.data.result.Associations.forEach((x, i) => {
                    ass.push({
                        id: x.id,
                        JobId: x.Job_Id,
                        JobNumber: x.Job_No,
                        Charge: parseInt(x.Charge_Name),
                        FileNumber: x.File_No,
                        Basis: x.Basis,
                        Currency: x.Currency,
                        RateGroup: x.Rate_Group,
                        SizeType: x.Size_Type,
                        Quantity: x.Quantity,
                        Rate: x.Amount,
                        Amount: x.Amount * x.Quantity,
                        Discount: x.Discount,
                        NetAmount: (x.Amount * x.Quantity) - x.Discount,
                        TaxApply: x.Tax_Apply,
                        TaxAmount: x.Tax_Amount,
                        VATCategory: x.VAT_Category,
                        NetIncTaxAmount: (x.Amount * x.Quantity) - x.Discount - x.Tax_Amount,
                        ExRate: x.Ex_Rate,
                        LocalAmount: ((x.Amount * x.Quantity) - x.Discount - x.Tax_Amount) * x.Ex_Rate,
                        Description: x.Description,
                    },)
                });
                dispatch(setDJField({ field: "directJob", value: ass }));
            }catch(e){
                console.log(e)
            }
        }

        if(state.directJob_Charges.length > 0 && id != null){
            fetchData();
        }
    }, [id, state.directJob_Charges ])

    const deleteData = async (id) => {
        try {
            PopConfirm(
            "Confirmation",
            "Are You Sure You Want To Delete This?",
            async () => {
                setLoading(true);

                console.log(id); // use the id parameter

                // Call backend
                await axiosClient.post(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/deleteDirectJob`,
                {}, // body
                { headers: { id: parseInt(id), employeeId: Cookies.get("loginId") } } // send the id in headers
                );

                // Run after deletion
                dispatch(resetDirectJob());
                openNotification('Success', `Direct Job Deleted`, 'green');
                setLoading(false);
                dispatch(removeTabNew('3-15')); // just pass the number directly
                await Router.push(`/accounts/directJobList`)
            }
            );
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    };


    const [ loading, setLoading ] = useState(false);
    const [ show, setShow ] = useState(false);
    const [ selector, setSelector ] = useState({
        type: "",
        index: 0
    });
    const dispatch = useDispatch();

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const totalRecords = state.directJob_Total || 0;

    // const handleSave = async (edit) => {
    //     try{
    //         let companyId = Cookies.get('companyId')
    //         let user = Cookies.get('username')
    //         console.log("Saving", user)
    //         let direct_Job = {
    //             Entry_No: state.directJob_EntryNumber,
    //             Entry_Date: state.directJob_EntryDate,
    //             Type: state.directJob_Type,
    //             Reference_No: state.directJob_Reference,
    //             Operation: state.directJob_Operation,
    //             Job_Type: state.directJob_JobType,
    //             SubType: state.directJob_SubType,
    //             Cheque_No: state.directJob_ChequeNo,
    //             Cheque_Date: state.directJob_ChequeDate,
    //             Currency: state.directJob_Currency,
    //             Ex_Rate: state.directJob_Currency == 'PKR' ? 1 : state.directJob_JobType == 'single' ? state.directJob[0].ExRate: state.directJob_ExRate,
    //             Tran_Mode: state.directJob_TransMode,
    //             Drawn_At: state.directJob_DrawnAt,
    //             Account_No: state.directJob_Account,
    //             Paid_To: state.directJob_PaidTo,
    //             Paid_Name: state.directJob_PaidTo ? state.directJob_CAccounts.find((x) => x.id == state.directJob_PaidTo).name : '',
    //             Narration: state.directJob_Remarks,
    //             companyId,
    //             Add_By: user,
    //         }
    //         let direct_Job_Association = [];
    //         for(let job of state.directJob){
    //             direct_Job_Association.push({
    //                 Job_No: job.JobNumber,
    //                 File_No: job.FileNumber,
    //                 Charge_Name: job.Charge,
    //                 Basis: job.Basis,
    //                 Rate_Group: job.RateGroup,
    //                 Size_Type: job.SizeType,
    //                 Quantity: job.Quantity,
    //                 Currency: job.Currency,
    //                 Ex_Rate: job.ExRate,
    //                 Amount: job.Rate,
    //                 Discount: job.Discount,
    //                 Tax_Apply: job.TaxApply,
    //                 Tax_Amount: job.TaxAmount,
    //                 VAT_Catagory: job.VATCategory,
    //                 Description: job.Description,
    //                 Job_Id: job.JobId,
    //             })
    //         }
    //         console.log("Direct Job to be saved", { direct_Job, direct_Job_Association })
    //         if(!edit){
    //             const result = axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/createDirectJob`,
    //                 { direct_Job, direct_Job_Association }
    //             ).then((x) => {
    //                 dispatch(setDJField({ field: 'directJob_EntryNumber', value: x.data.result.Entry_Number }));
    //                 dispatch(setDJField({ field: 'directJob_VoucherNumber', value: x.data.result.Voucher_Number }));
    //                 console.log(x.data.result)
    //                 Router.push(`/accounts/directJob/${x.data.result.id}`)
    //                 setLoading(false);
    //             }).catch((e) => {
    //                 console.log(e)
    //                 setLoading(false);
    //                 openNotification('Error', 'Something went wrong', 'red');
    //             });
    //             // Router.push(`/accounts/directJob/${result.data.result.Voucher_Number}`);
    //         }else{
    //             const result = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/updateDirectJob`, { direct_Job, direct_Job_Association });

    //         }
    //     }catch(e){
    //         console.log(e)
    //     }
    // }


    const handleSave = async () => {
  try {
    setLoading(true);

    const companyId = Cookies.get('companyId');
    const user = Cookies.get('username');

    let direct_Job = {
      Entry_No: state.directJob_EntryNumber,
      Entry_Date: state.directJob_EntryDate,
      Type: state.directJob_Type,
      Reference_No: state.directJob_Reference,
      Operation: state.directJob_Operation,
      Job_Type: state.directJob_JobType,
      SubType: state.directJob_SubType,
      Cheque_No: state.directJob_ChequeNo,
      Cheque_Date: state.directJob_ChequeDate,
      Currency: state.directJob_Currency,
      Ex_Rate:
        state.directJob_Currency == 'PKR'
          ? 1
          : state.directJob_JobType == 'single'
          ? state.directJob[0]?.ExRate
          : state.directJob_ExRate,
      Tran_Mode: state.directJob_TransMode,
      Drawn_At: state.directJob_DrawnAt,
      Account_No: state.directJob_Account,
      Paid_To: state.directJob_PaidTo,
      Paid_Name: state.directJob_PaidTo
        ? state.directJob_CAccounts.find((x) => x.id == state.directJob_PaidTo)?.name || ''
        : '',
      Narration: state.directJob_Remarks,
      companyId,
      Add_By: user,
    };

    if (id && id != 'new') {
      direct_Job.id = parseInt(state.directJob_Id);
      direct_Job.Voucher_Id = parseInt(state.directJob_VoucherId);
    }

    const direct_Job_Association = state.directJob.map((job) => ({
      Job_No: job.JobNumber,
      File_No: job.FileNumber,
      Charge_Name: job.Charge,
      Basis: job.Basis,
      Rate_Group: job.RateGroup,
      Size_Type: job.SizeType,
      Quantity: job.Quantity,
      Currency: job.Currency,
      Ex_Rate: job.ExRate,
      Amount: job.Rate,
      Discount: job.Discount,
      Tax_Apply: job.TaxApply,
      Tax_Amount: job.TaxAmount,
      VAT_Catagory: job.VATCategory,
      Description: job.Description,
      Job_Id: job.JobId,
    }));

    console.log("API Payload", { direct_Job, direct_Job_Association });

    const result = await axiosClient.post(
      `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/saveDirectJob`,
      {
        direct_Job,
        direct_Job_Association,
        employeeId: Cookies.get("loginId"),
      }
    );

    console.log("API Response", result.data);

    const savedId = result?.data?.result?.id;

    openNotification(
      'Success',
      state.directJob_Id ? 'Direct Job Updated' : 'Direct Job Created',
      'green'
    );

    if (savedId) {
      Router.push(`/accounts/directJob/${savedId}`);
    } else {
      console.warn("ID not returned from API");
    }

    setLoading(false);

  } catch (e) {
  console.log("FULL ERROR:", e);
  console.log("SERVER ERROR:", e?.response?.data);
  
  setLoading(false);
  openNotification(
    'Error',
    e?.response?.data?.message || 'Something went wrong',
    'red'
  );
}
};

    useEffect(() => {
        console.log("state.directJob", state.directJob)
        let tempAmount = 0.0;
        let tempDiscount = 0.0;
        let tempTaxAmount = 0.0;
        let tempNetAmount = 0.0;
        let tempNetAmountIncTax = 0.0;
        let tempLocalAmount = 0.0;
        for(let job of state.directJob){
            tempAmount += job.Amount;
            tempDiscount += job.Discount;
            tempTaxAmount += job.TaxAmount;
            tempNetAmount += job.NetAmount;
            console.log("Job Net Amount Including Tax: ", job.NetIncTaxAmount)
            tempNetAmountIncTax += job.NetIncTaxAmount || 0;
            tempLocalAmount += job.LocalAmount;
        }
        console.log("Total Net Amount Including Tax: ", tempNetAmountIncTax)
        dispatch(setDJField({ field: 'directJob_TotalAmount', value: tempAmount }));
        dispatch(setDJField({ field: 'directJob_TotalDiscount', value: tempDiscount }));
        dispatch(setDJField({ field: 'directJob_TotalTaxAmount', value: tempTaxAmount }));
        dispatch(setDJField({ field: 'directJob_TotalNetAmount', value: tempNetAmount }));
        dispatch(setDJField({ field: 'directJob_TotalNetAmountIncTax', value: tempNetAmountIncTax }));
        dispatch(setDJField({ field: 'directJob_TotalLocalAmount', value: tempLocalAmount }));
    }, [state.directJob])

    useEffect(() => {
    const getData = async () => {
        try {
            console.log("Fetching Required Data")
        const res = await axiosClient.get( process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CHILD_ACCOUNTS );
            const accounts = res?.data?.result || []; // only update if data exists
            if (accounts.length > 0) {
            dispatch(setDJField({ field: 'directJob_CAccounts', value: accounts }));
        }
        const result = await axiosClient.get( process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CHARGES );
        const charges = result?.data?.result || []; // only update if data exists
        if (charges.length > 0) {
            dispatch(setDJField({ field: 'directJob_Charges', value: charges }));
        }
        console.log("Fetched Required Data")
        const jobsRes = await axiosClient.get(
            `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/getJobNumbers`,
            {
            params: {
                page: currentPage,
                limit: pageSize,
                search
            }
            }
        );

        dispatch(setDJField({
            field: "directJob_Jobs",
            value: jobsRes.data.data || []
        }));

        dispatch(setDJField({
            field: "directJob_Total",
            value: jobsRes.data.pagination.totalRecords
        }));

        } catch (err) {
        console.error("Failed to fetch jobs", err);
        }
    };

    getData();
    }, [currentPage, search]); // 🔥 re-fetch on search & page

    useEffect(() => {
    const fetchreceivingAccount = async () => {
        try{
        await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ACCOUNT_FOR_TRANSACTION, {
            headers: {
            type: state.directJob_TransMode,
            }
        }).then((x) => {
            dispatch(setDJField({ field: 'directJob_SettlementAccounts', value: x.data.result }))
        })
        }catch(e){
        console.log(e)
        }
    }
    fetchreceivingAccount()
    }, [])

    console.log(state)

    return (
        <div className='base-page-layout'>
            <Row style={{ width: '100%', justifyContent: 'space-between', alignItems: 'end', borderBottom: '2px solid black', paddingBottom: '10px'}}>
                <Col md={10}>
                    <h4 style={{margin: '0', padding: '0'}}>{id == 'new' ? 'Add ' : 'Edit '}Direct Job Expense / Revenue</h4>
                </Col>
                <Col md={5}></Col>
                <Col md={6}>
                    <Row style={{alignItems: 'end'}}>
                        <h5 style={{margin: '0', padding: '0'}}>Voucher #</h5>
                        <h6 style={{margin: '0', padding: '0', marginLeft: '10px'}}> {' ' + state.directJob_VoucherNumber}</h6>
                    </Row>
                </Col>
                <Col md={1} style={{textAlign: 'right'}}>
                    {id != 'new' && <Button
                        className="delete-btn1"
                        disabled={loading}
                        onClick={() => {
                                deleteData(state.directJob_Id)
                        }}
                    >   
                        {loading && <LoadingOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '20px' }} />}
                        {!loading && <DeleteOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '20px' }} />}
                    </Button>}
                </Col>
                <Col md={1} style={{textAlign: 'right'}}>
                    <Button
                        className="edit-btn1"
                        disabled={loading}
                        onClick={() => {
                            setLoading(true)
                            if(state.directJob_EntryNumber){
                                handleSave(true)
                            }else{
                                handleSave(false)
                            }
                            // console.log("Reset Direct Job State")
                            // dispatch(resetDirectJob())
                            // dispatch(setDJField({ field: 'directJob_Id', value: 'new' }))
                            // setShow(true)
                        }}
                    >
                        {loading && <LoadingOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '20px' }} />}
                        {!loading && <SaveOutlined className="edit-icon" style={{ color: '#1f2937', fontSize: '20px' }} />}
                    </Button>
                </Col>
                <Col md={1} style={{textAlign: 'right'}}>
                    <Button
                        className="delete-btn1"
                        disabled={loading}
                        onClick={() => {
                            console.log("Reset Direct Job State")
                            // dispatch(resetDirectJob())
                            // dispatch(setDJField({ field: 'directJob_Id', value: 'new' }))
                            // setShow(true)
                            dispatch(resetDirectJob());
                        }}
                    >
                        {loading && <LoadingOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '20px' }} />}
                        {!loading && <WarningOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '20px' }} />}
                    </Button>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '20px' }}>
                <Col md={4}>
                    <label className="custom-label">Entry #</label>
                    <div style={{
                        width: '90%',
                        height: '30px',
                        border: '1px solid #d7d7d7',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'start',
                        padding: '15px 10px'
                    }}>{state.directJob_EntryNumber}</div>
                    <label className="custom-label">Job #</label>
                    <div style={{
                        width: '90%',
                        height: '30px',
                        border: '1px solid #d7d7d7',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'start',
                        padding: '15px 10px',
                        backgroundColor: state.directJob_JobType != 'single' ? '#f5f5f5' : 'white',
                    }}
                    onClick={() => {
                        if(state.directJob_JobType == 'single'){
                            setShow(true)
                            setSelector({type: 'single', index: 0})                            
                        }
                    }}
                    >{state.directJob_JobType == 'single' ? state.directJob[0].JobNumber : ''}</div>
                    <label className="custom-label">File #</label>
                    <Input disabled={state.directJob_JobType != 'single'} style={{width: '90%'}} placeholder="File #" value={state.directJob_JobType == 'single' ? state.directJob[0].FileNumber : ''}
                    onChange={(e) => {
                        dispatch(setDJField({ field: 'directJob_FileNumber', value: e.target.value}))
                        }}/>
                </Col>
                <Col md={4}>
                    <label className="custom-label">Entry Date*</label>    
                    <DatePicker format={'DD-MM-YYYY'} style={{width: '90%'}} value={moment(state.directJob_EntryDate)} onChange={(e) => {dispatch(setDJField({ field: 'directJob_EntryDate', value: e}))}}/>
                    <label className="custom-label">Tran Mode*</label>
                    <Select style={{width: '90%'}} placeholder="Tran Mode" value={state.directJob_TransMode} onChange={(e) => {dispatch(setDJField({ field: 'directJob_TransMode', value: e}))}}>
                        <Select.Option value="Bank">Bank</Select.Option>
                        <Select.Option value="Cash">Cash</Select.Option>
                        <Select.Option value="Adjust">Adjustment</Select.Option>
                    </Select>
                    <label className="custom-label">Ex-Rate</label>
                    <InputNumber disabled={state.directJob_Currency == 'PKR'} style={{width: '90%'}} placeholder="Ex-Rate..." value={state.directJob_Currency == 'PKR' ? 1 : state.directJob_JobType == 'single' ? state.directJob[0].ExRate: state.directJob_ExRate}
                    onChange={(value) => {
                        if(state.directJob_JobType == 'single'){
                            const index = 0
                            const quantity = state.directJob[0].Quantity || 0;
                            const rate = state.directJob[0].Rate || 0;
                            const discount = state.directJob[0].Discount || 0;
                            const tax = state.directJob[0].TaxAmount || 0;
                            const exRate = value || 0; 
    
                            const amount = rate * quantity;
                            const netAmount = amount - discount;
                            const netAmountIncTax = netAmount - tax;
                            const local = netAmountIncTax * exRate;

                            console.log("Net Amount Including Tax:", netAmountIncTax)
    
                            // The value being changed
                            dispatch(updateDirectJobItem({
                            index,
                            field: 'ExRate',
                            value: exRate
                            }));
    
                            dispatch(updateDirectJobItem({
                            index,
                            field: 'Amount',
                            value: amount
                            }));
    
                            dispatch(updateDirectJobItem({
                            index,
                            field: 'NetAmount',
                            value: netAmount
                            }));
    
                            dispatch(updateDirectJobItem({
                            index,
                            field: 'NetIncTaxAmount',
                            value: netAmountIncTax
                            }));
    
                            dispatch(updateDirectJobItem({
                            index,
                            field: 'LocalAmount',
                            value: local
                            }));
                        }else{
                            dispatch(setDJField({ field: 'directJob_ExRate', value: e}))
                        }
                        }}/>
                </Col>
                <Col md={8}>
                    <Row>
                        <Col md={12}>
                            <label className="custom-label">Type*</label>
                            <Select style={{width: '90%'}} placeholder="Entry #" value={state.directJob_Type} onChange={(e) => {dispatch(setDJField({ field: 'directJob_Type', value: e}))}}>
                                <Select.Option value="revenue">Revenue</Select.Option>
                                <Select.Option value="expense">Expense</Select.Option>
                            </Select>
                            <label className="custom-label">SubType*</label>
                            <Select style={{width: '90%'}} placeholder="Entry #" value={state.directJob_SubType} onChange={(e) => {dispatch(setDJField({ field: 'directJob_SubType', value: e}))}}>
                                <Select.Option value="wire transfer">Wire Transfer</Select.Option>
                                <Select.Option value="online transfer">Online Transfer</Select.Option>
                                <Select.Option value="credit card">Credit Card</Select.Option>
                                <Select.Option value="cheque">Cheque</Select.Option>
                                <Select.Option value="po">PO</Select.Option>
                                <Select.Option value="tt">TT</Select.Option>
                                <Select.Option value="cash">Cash</Select.Option>
                            </Select>
                        </Col>
                        <Col md={12}>
                            <label className="custom-label">Reference #</label>
                            <Input style={{width: '90%'}} placeholder="Reference #" value={state.directJob_Reference} onChange={(e) => {dispatch(setDJField({ field: 'directJob_Reference', value: e.target.value}))}}/>
                            <label className="custom-label">Cheque #</label>
                            <Input style={{width: '90%'}} placeholder="Cheque #" value={state.directJob_ChequeNo} onChange={(e) => {dispatch(setDJField({ field: 'directJob_ChequeNo', value: e.target.value}))}}/>
                        </Col>
                    </Row>
                    <Col md={24} style={{padding: '0'}}>
                            <label className="custom-label">Account #</label>
                            {state.directJob_SettlementAccounts.length > 0 && <Select
                                showSearch
                                optionFilterProp="children"
                                style={{ width: '95%' }}
                                placeholder="Account #"
                                value={state.directJob_Account}
                                onChange={(value) => {
                                    dispatch(setDJField({ field: 'directJob_Account', value }))
                                }}
                                >
                                {state.directJob_SettlementAccounts.map(item => (
                                    <Select.Option key={item.id} value={item.id}>
                                    {`${item.title} - ${item.code}`}
                                    </Select.Option>
                                ))}
                            </Select>}
                        <Row>
                        </Row>
                    </Col>
                </Col>
                <Col md={8}>
                    <Row>
                        <Col md={12}>
                            <label className="custom-label">Operation*</label>
                            <Select style={{width: '90%'}} placeholder="Entry #" value={state.directJob_Operation} onChange={(e) => {dispatch(setDJField({ field: 'directJob_Operation', value: e}))}}>
                                <Select.Option value="logistics">Logistics</Select.Option>
                                <Select.Option value="other">Other</Select.Option>
                            </Select>
                            <label className="custom-label">Cheq Date*</label>
                            <DatePicker format={'DD-MM-YYYY'} style={{width: '90%'}} value={moment(state.directJob_ChequeDate)} onChange={(e) => {dispatch(setDJField({ field: 'directJob_ChequeDate', value: e}))}}/>
                        </Col>
                        <Col md={12}>
                            <label className="custom-label">Job Type*</label>
                            <Select style={{width: '90%'}} placeholder="Job Type" value={state.directJob_JobType}
                            onChange={(e) => {
                                if (e == 'single') {
                                    const temp = [...state.directJob];
                                    temp.splice(1, temp.length - 1);
                                    dispatch(setDJField({ field: 'directJob', value: temp }))
                                }else{
                                    dispatch(setDJField({ field: 'directJob_JobId', value: 0 }));
                                    dispatch(setDJField({ field: 'directJob_JobNumber', value: "" }));
                                }
                                dispatch(setDJField({ field: 'directJob_JobType', value: e}))
                                }}>
                                <Select.Option value="single">Single</Select.Option>
                                <Select.Option value="multiple">Multiple</Select.Option>
                            </Select>
                            <label className="custom-label">Currency</label>
                            <Select style={{width: '90%'}} placeholder="Currency" value={state.directJob_Currency} onChange={(e) => {dispatch(setDJField({ field: 'directJob_Currency', value: e}))}}>
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
                    </Row>
                    <Col md={24} style={{padding: '0'}}>
                            <label className="custom-label">Paid to</label>
                            {state.directJob_CAccounts.length > 0 && <Select
                                showSearch
                                optionFilterProp="children"
                                style={{ width: '95%' }}
                                placeholder="Paid to..."
                                value={state.directJob_PaidTo}
                                onChange={(value) => {
                                    dispatch(setDJField({ field: 'directJob_PaidTo', value }))
                                }}
                                >
                                {state.directJob_CAccounts.map(item => (
                                    <Select.Option key={item.id} value={item.id}>
                                    {`${item.title} - ${item.code}`}
                                    </Select.Option>
                                ))}
                            </Select>}
                        <Row>
                        </Row>
                    </Col>
                </Col>
            </Row>
            <Row>
                <Col md={8}>
                    <label className="custom-label">Drawn At</label>
                    <Input style={{width: '93%'}} placeholder="Drawn At" value={state.directJob_DrawnAt} onChange={(e) => {dispatch(setDJField({ field: 'directJob_DrawnAt', value: e.target.value}))}}/>
                </Col>
            </Row>
            <Row>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '3000px', marginTop: '20px', borderCollapse: 'collapse', borderSpacing: 0 }}>
                        <thead style={{ backgroundColor: '#d6dbeb', height: '50px' }}>
                        <tr>
                            <th style={{ width: '2%', borderTopLeftRadius: '25px' }}>
                                <Button
                                    disabled={state.directJob_JobType == 'single'}
                                    onClick={async () => {
                                        const temp = [...state.directJob];
                                        temp.push({
                                            id: 0,
                                            JobNumber: '',
                                            Charge: '',
                                            FileNumber: '',
                                            Basis: '',
                                            Currency: 'PKR',
                                            RateGroup: 'None',
                                            SizeType: '',
                                            Quantity: 0.0,
                                            Rate: 0.0,
                                            Amount: 0.0,
                                            Discount: 0.0,
                                            NetAmount: 0.0,
                                            TaxApply: false,
                                            TaxShare: 0.0,
                                            TaxAmount: 0.0,
                                            VATCategory: '',
                                            NetIncTaxAmount: 0.0,
                                            ExRate: 1.0,
                                            LocalAmount: 0.0,
                                            Description: '',
                                        })
                                        await dispatch(setDJField({ field: 'directJob', value: temp }));
                                    }}
                                    style={{
                                        width: '35px',
                                        height: '35px',
                                        padding: 0,
                                        marginLeft: '5px',
                                        backgroundColor: state.directJob_JobType == 'single' ? '#d6dbea' : '#1f2937',
                                        color: 'white',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: 'none',
                                    }}
                                    >
                                        <PlusOutlined style={{ color: 'white', fontSize: '20px' }} />
                                </Button>
                            </th>
                            <th style={{ width: '5%' }}>Job #</th>
                            <th style={{ width: '10%' }}>Charges Name</th>
                            <th style={{ width: '5%' }}>File #</th>
                            <th style={{ width: '5%' }}>Basis</th>
                            <th style={{ width: '5%' }}>Currency</th>
                            <th style={{ width: '5%' }}>Rate Group</th>
                            <th style={{ width: '3%' }}>Size Type</th>
                            <th style={{ width: '3%' }}>Quantity</th>
                            <th style={{ width: '2.5%' }}>Rate</th>
                            <th style={{ width: '5%' }}>Amount</th>
                            <th style={{ width: '5%' }}>Discount</th>
                            <th style={{ width: '5%' }}>Net Amount</th>
                            <th style={{ width: '3%' }}>Tax Apply</th>
                            {/* <th style={{ width: '3%' }}>Tax Share</th> */}
                            <th style={{ width: '5%' }}>Tax Amount</th>
                            <th style={{ width: '7%' }}>VAT Category</th>
                            <th style={{ width: '5%' }}>Net Inc Tax Amount</th>
                            <th style={{ width: '5%' }}>Exchange Rate</th>
                            <th style={{ width: '5%' }}>Local Amount</th>
                            <th style={{ width: '12%', borderTopRightRadius: '25px' }}>Description</th>
                        </tr>
                        </thead>
                        <tbody>
                            {state.directJob.map((item, index) => <tr key={index} style={{ height: '40px', borderBottom: '1px solid #d7d7d7' }}>
                                <td className="table-row number-cell">
                                    <span className="number">{index + 1}</span>
                                    <button className="delete-btn" onClick={() => {
                                        if(state.directJob.length > 1){
                                            const temp = [...state.directJob];
                                            temp.splice(index, 1);
                                            dispatch(setDJField({ field: 'directJob', value: temp }));
                                        }else{
                                            openNotification('Warning', `Cannot remove all items`, 'orange')
                                        }
                                    }}>
                                        <DeleteOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '20px' }} />
                                    </button>
                                </td>
                                <td className="table-row">
                                    <div style={{
                                        width: '90%',
                                        height: '30px',
                                        border: '1px solid #d7d7d7',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'start',
                                        padding: '15px 10px'
                                    }}
                                    onClick={() => {
                                        setShow(true)
                                        setSelector({type: 'multiple', index: index})
                                    }}
                                    >{item.JobNumber}</div>
                                </td>
                                <td className="table-row">
                                    {state.directJob_Charges.length > 0 && <Select
                                    showSearch
                                    optionFilterProp="children"
                                    value={item.Charge}
                                    style={{ width: '90%' }}
                                    placeholder="Charges Name..."
                                    onChange={(value, option) => {
                                        console.log(value, option)
                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Charge',
                                        value
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Basis',
                                        value: option.calculationType == 'Per Unit' ? 'unit' : 'shipment'
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Currency',
                                        value: option.currency
                                        }));
                                    }}
                                    >
                                    {state.directJob_Charges.map(charge => (
                                        <Select.Option
                                        key={charge.id}
                                        value={charge.id}
                                        calculationType={charge.calculationType}
                                        currency={charge.currency}
                                        >
                                        {`(${charge.code}) - ${charge.name} - ${charge.short}`}
                                        </Select.Option>
                                    ))}
                                    </Select>}
                                    </td>
                                <td className="table-row"><Input  value={item.FileNumber} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'FileNumber', value: e.target.value}))}} style={{ width: '90%' }} placeholder="File #"/></td>
                                <td className="table-row"><Select value={item.Basis} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'Basis', value: e}))}} style={{ width: '90%' }} placeholder="Basis...">
                                        <Select.Option value="unit">Per Unit</Select.Option>
                                        <Select.Option value="shipment">Per Shipment</Select.Option>
                                    </Select></td>
                                <td className="table-row"><Select value={item.Currency} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'Currency', value: e}))}} style={{ width: '90%' }} placeholder="Currency...">
                                        <Select.Option value="PKR">PKR</Select.Option>
                                        <Select.Option value="USD">USD</Select.Option>
                                        <Select.Option value="EUR">EUR</Select.Option>
                                        <Select.Option value="GBP">GBP</Select.Option>
                                        <Select.Option value="AED">AED</Select.Option>
                                        <Select.Option value="OMR">OMR</Select.Option>
                                        <Select.Option value="BDT">BDT</Select.Option>
                                        <Select.Option value="CHF">CHF</Select.Option>
                                    </Select></td>
                                <td className="table-row">
                                    <Select value={item.RateGroup} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'RateGroup', value: e}))}} style={{ width: '90%' }} placeholder="Rate Group...">
                                        <Select.Option value="None">None</Select.Option>
                                        <Select.Option value="Rate1">Rate1</Select.Option>
                                        <Select.Option value="Rate2">Rate2</Select.Option>
                                    </Select>
                                    </td>
                                <td className="table-row">
                                    <Select showSearch value={item.SizeType} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'SizeType', value: e}))}} style={{ width: '90%' }} placeholder="Size Type">
                                        <Select.Option value="20BK">20BK</Select.Option>
                                        <Select.Option value="20FR">20FR</Select.Option>
                                        <Select.Option value="20OT">20OT</Select.Option>
                                        <Select.Option value="20RE">20RE</Select.Option>
                                        <Select.Option value="20SD">20SD</Select.Option>
                                        <Select.Option value="20TK">20TK</Select.Option>
                                        <Select.Option value="40FR">40FR</Select.Option>
                                        <Select.Option value="40BK">40BK</Select.Option>
                                        <Select.Option value="40HC">40HC</Select.Option>
                                        <Select.Option value="40HCRF">40HCRF</Select.Option>
                                        <Select.Option value="40OT">40OT</Select.Option>
                                        <Select.Option value="40SD">40SD</Select.Option>
                                        <Select.Option value="40VH">40VH</Select.Option>
                                        <Select.Option value="45BK">45BK</Select.Option>
                                        <Select.Option value="45HC">45HC</Select.Option>
                                        <Select.Option value="45OT">45OT</Select.Option>
                                        <Select.Option value="45TK">45TK</Select.Option>
                                        <Select.Option value="45VH">45VH</Select.Option>
                                        <Select.Option value="M3">M3</Select.Option>
                                    </Select>
                                    </td>
                                <td className="table-row"><InputNumber
                                    value={item.Quantity === 0 ? null : item.Quantity}
                                    style={{ width: '90%' }}
                                    placeholder="Quantity"
                                    onChange={(value) => {
                                        const quantity = value || 0;
                                        const rate = item.Rate || 0;
                                        const discount = item.Discount || 0;
                                        const tax = item.TaxAmount || 0;
                                        const exRate = item.ExRate || 0;

                                        const amount = rate * quantity;
                                        const netAmount = amount - discount;
                                        const netAmountIncTax = netAmount - tax;
                                        const local = netAmountIncTax * exRate;

                                        // The value being changed
                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Quantity',
                                        value: quantity
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Amount',
                                        value: amount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetAmount',
                                        value: netAmount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetIncTaxAmount',
                                        value: netAmountIncTax
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'LocalAmount',
                                        value: local
                                        }));
                                    }}
                                    /></td>
                                <td className="table-row"><InputNumber
                                    value={item.Rate === 0 ? null : item.Rate}
                                    style={{ width: '90%' }}
                                    placeholder="Rate"
                                    onChange={(value) => {
                                        const quantity = item.Quantity || 0;
                                        const rate = value || 0;
                                        const discount = item.Discount || 0;
                                        const tax = item.TaxAmount || 0;
                                        const exRate = item.ExRate || 0;

                                        const amount = rate * quantity;
                                        const netAmount = amount - discount;
                                        const netAmountIncTax = netAmount - tax;
                                        const local = netAmountIncTax * exRate;

                                        // The value being changed
                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Rate',
                                        value: rate
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Amount',
                                        value: amount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetAmount',
                                        value: netAmount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetIncTaxAmount',
                                        value: netAmountIncTax
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'LocalAmount',
                                        value: local
                                        }));
                                    }}
                                    />
                                </td>
                                <td className="table-row"><InputNumber disabled value={item.Amount == 0 ? null : item.Amount} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'Amount', value: e}))}} style={{ width: '90%' }} placeholder="Amount"/></td>
                                <td className="table-row"><InputNumber value={item.Discount == 0 ? null : item.Discount}
                                onChange={(value) => {
                                        const quantity = item.Quantity || 0;
                                        const rate = item.Rate || 0;
                                        const discount = value || 0;
                                        const tax = item.TaxAmount || 0;
                                        const exRate = item.ExRate || 0;

                                        const amount = rate * quantity;
                                        const netAmount = amount - discount;
                                        const netAmountIncTax = netAmount - tax;
                                        const local = netAmountIncTax * exRate;

                                        // The value being changed
                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Discount',
                                        value: discount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Amount',
                                        value: amount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetAmount',
                                        value: netAmount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetIncTaxAmount',
                                        value: netAmountIncTax
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'LocalAmount',
                                        value: local
                                        }));
                                    }}
                                    style={{ width: '90%' }} placeholder="Discount"/></td>
                                <td className="table-row"><InputNumber disabled value={item.NetAmount == 0 ? null : item.NetAmount} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'NetAmount', value: e}))}} style={{ width: '90%' }} placeholder="Net Amount"/></td>
                                <td className="table-row">
                                    <Checkbox style={{marginLeft: '25px'}} checked={item.TaxApply} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'TaxApply', value: e.target.checked}))}} />
                                </td>
                                {/* <td className="table-row"><InputNumber disabled={!item.TaxApply} value={item.TaxShare == 0 ? null : item.TaxShare} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'TaxShare', value: e}))}} style={{ width: '90%' }} placeholder="Tax Share"/></td> */}
                                <td className="table-row"><InputNumber disabled={!item.TaxApply} value={item.TaxAmount == 0 ? null : item.TaxAmount}
                                onChange={(value) => {
                                        const quantity = item.Quantity || 0;
                                        const rate = item.Rate || 0;
                                        const discount = item.Discount || 0;
                                        const tax = value || 0;
                                        const exRate = item.ExRate || 0;

                                        const amount = rate * quantity;
                                        const netAmount = amount - discount;
                                        const netAmountIncTax = netAmount - tax;
                                        const local = netAmountIncTax * exRate;

                                        // The value being changed
                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'TaxAmount',
                                        value: tax
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Amount',
                                        value: amount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetAmount',
                                        value: netAmount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetIncTaxAmount',
                                        value: netAmountIncTax
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'LocalAmount',
                                        value: local
                                        }));
                                    }}
                                style={{ width: '90%' }} placeholder="Tax Amount"/></td>
                                <td className="table-row"><InputNumber value={item.VATCategory} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'VATCategory', value: e}))}} style={{ width: '90%' }} placeholder="VAT Category"/></td>
                                <td className="table-row"><InputNumber disabled value={item.NetIncTaxAmount == 0 ? '' : item.NetIncTaxAmount} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'NetIncTaxAmount', value: e}))}} style={{ width: '90%' }} placeholder="Net Inc Tax Amount"/></td>
                                <td className="table-row"><InputNumber disabled={item.Currency == 'PKR'} value={item.ExRate == 0 ? '' : item.ExRate}
                                onChange={(value) => {
                                        const quantity = item.Quantity || 0;
                                        const rate = item.Rate || 0;
                                        const discount = item.Discount || 0;
                                        const tax = item.TaxAmount || 0;
                                        const exRate = value || 0;

                                        const amount = rate * quantity;
                                        const netAmount = amount - discount;
                                        const netAmountIncTax = netAmount - tax;
                                        const local = netAmountIncTax * exRate;

                                        // The value being changed
                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'ExRate',
                                        value: exRate
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'Amount',
                                        value: amount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetAmount',
                                        value: netAmount
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'NetIncTaxAmount',
                                        value: netAmountIncTax
                                        }));

                                        dispatch(updateDirectJobItem({
                                        index,
                                        field: 'LocalAmount',
                                        value: local
                                        }));
                                    }}
                                    style={{ width: '90%' }} placeholder="Exchange Rate"/></td>
                                <td className="table-row"><InputNumber disabled value={item.LocalAmount == 0 ? '' : item.LocalAmount} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'LocalAmount', value: e}))}} style={{ width: '90%' }} placeholder="Local Amount"/></td>
                                <td className="table-row"><Input value={item.Description} onChange={(e) => {dispatch(updateDirectJobItem({ index: index, field: 'Description', value: e.target.value}))}} style={{ width: '90%' }} placeholder="Description"/></td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </Row>
            <Row>
                <Col md={12}>
                    <label className="custom-label">Remarks</label>
                    <Input.TextArea value={state.directJob_Remarks} onChange={(e) => {dispatch(setDJField({ field: 'directJob_Remarks', value: e.target.value}))}} name="Remarks" rows={4} style={{ width: '95%', height: '135px' }} placeholder="Remarks..." />
                </Col>
                <Col md={12}>
                    <div className="totals-box">
                    <div className="totals-label">Totals</div>
                    <Row>
                        <Col md={12}>
                            <div>
                                <p style={{marginTop:5}}><b>Total Amount:</b> <span>{commas(state.directJob_TotalAmount)}</span></p>
                                <p style={{marginTop:5}}><b>Net Amount:</b> <span>{commas(state.directJob_TotalNetAmount)}</span></p>
                                <p style={{marginTop:5}}><b>Net Amount Inc Tax:</b> <span>{commas(state.directJob_TotalNetAmountIncTax)}</span></p>
                            </div>
                        </Col>
                        <Col md={12}>
                            <div>
                                <p style={{marginTop:5}}><b>Discount:</b> <span>{commas(state.directJob_TotalDiscount)}</span></p>
                                <p style={{marginTop:5}}><b>Tax Amount:</b> <span>{commas(state.directJob_TotalTaxAmount)}</span></p>
                                <p style={{marginTop:5}}><b>Local Amount:</b> <span>{commas(state.directJob_TotalLocalAmount)}</span></p>
                            </div>
                        </Col>
                    </Row>
                    <div className="totals-content">
                    </div>
                    </div>
                </Col>
            </Row>
            <Modal
                open={show}
                onOk={() => {
                    setCurrentPage(1); // reset page
                    setSearch("")
                    setShow(false)
                }}
                onCancel={() => {
                    setCurrentPage(1); // reset page
                    setSearch("")
                    setShow(false)
                }}
                width={1000}
                footer={false}
                centered={false}
            >
                <div style={{ height: '70vh'}}>
                    <Row>
                        <Col md={15}>
                            <h3>Job Selection</h3>
                        </Col>
                        <Col md={9}>
                            <Input
                                placeholder="Search Job / Client / BL"
                                value={search}
                                style={{ width: '90%' }}
                                onChange={(e) => {
                                    setCurrentPage(1); // reset page
                                    setSearch(e.target.value);
                                }}
                            />
                        </Col>
                    </Row>
                    <Row style={{borderBottom: '2px solid #1d1d1f', paddingBottom: '10px', marginTop: '10px'}}>
                        <Col md={24} style={{justifyContent: 'center', display: 'flex'}}>
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={totalRecords}
                                onChange={(page) => setCurrentPage(page)}
                                showSizeChanger={false}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', borderSpacing: 0 }}>
                            <thead style={{ backgroundColor: '#d6dbeb', height: '40px' }}>
                                <tr>
                                    <th style={{ width: '5%', paddingLeft: '10px', borderTopLeftRadius: '25px' }}>#</th>
                                    <th style={{ width: '15%', paddingLeft: '10px' }}>Job #</th>
                                    <th style={{ width: '20%', paddingLeft: '10px' }}>HBL</th>
                                    <th style={{ width: '20%', paddingLeft: '10px' }}>MBL</th>
                                    <th style={{ width: '20%', paddingLeft: '10px' }}>Client</th>
                                    <th style={{ width: '20%', paddingLeft: '10px', borderTopRightRadius: '25px' }}>Consignee</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.directJob_Jobs.map((record, index) => {
                                    const rowNumber = (currentPage - 1) * pageSize + index + 1;

                                    return (
                                        <tr
                                            key={record.id}
                                            style={{ height: '40px', borderBottom: '1px solid #d7d7d7', cursor: 'pointer' }}
                                            onClick={() => {
                                                if (selector.type === 'single') {
                                                    // dispatch(setDJField({ field: 'directJob_JobId', value: record.id }));
                                                    // dispatch(setDJField({ field: 'directJob_JobNumber', value: record.jobNo }));
                                                    dispatch(updateDirectJobItem({ index: 0, field: 'JobId', value: record.id }));
                                                    dispatch(updateDirectJobItem({ index: 0, field: 'JobNumber', value: record.jobNo }));
                                                    dispatch(updateDirectJobItem({ index: 0, field: 'FileNumber', value: record.fileNo }));
                                                    setShow(false);
                                                } else if (selector.type === 'multiple') {
                                                    dispatch(updateDirectJobItem({ index: selector.index, field: 'JobId', value: record.id }));
                                                    dispatch(updateDirectJobItem({ index: selector.index, field: 'JobNumber', value: record.jobNo }));
                                                    dispatch(updateDirectJobItem({ index: selector.index, field: 'FileNumber', value: record.fileNo }));
                                                    setShow(false);
                                                }
                                            }}
                                        >
                                            <td className="table-row1">{rowNumber}</td>
                                            <td className="table-row1">{record.jobNo}</td>
                                            <td className="table-row1">{record.Bl?.hbl}</td>
                                            <td className="table-row1">{record.Bl?.mbl}</td>
                                            <td className="table-row1">{record.Client?.name}</td>
                                            <td className="table-row1">{record.consignee?.name}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Row>
                </div>
            </Modal>
        </div>
    );
};

export default DirectJob
