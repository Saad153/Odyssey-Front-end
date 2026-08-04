import axiosClient from 'apis/axiosClient';
import * as yup from "yup";
import { Tabs } from "antd";
import moment from 'moment';
import Cookies from 'js-cookie';
import Router from 'next/router';
import React, { useEffect ,useState} from 'react';
import { getJobValues } from 'apis/jobs';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { createHistory } from './historyCreation';
import { Row, Col, Spinner } from 'react-bootstrap';
import { yupResolver } from "@hookform/resolvers/yup";
import DateComp from 'Components/Shared/Form/DateComp';
import { useForm, useFormContext, useWatch } from "react-hook-form";
import InputComp from 'Components/Shared/Form/InputComp';
import SelectComp from 'Components/Shared/Form/SelectComp';
import SelectSearchComp from 'Components/Shared/Form/SelectSearchComp';
import openNotification from 'Components/Shared/Notification';
import CheckGroupComp from 'Components/Shared/Form/CheckGroupComp';
import { isValidEmailList } from 'functions/emailList';
import { checkPartyCreateAccess } from 'functions/checkPartyCreateAccess';

const emailListSchema = () => yup.string().test(
    'email-list',
    'Enter valid email(s), separated by ; if more than one',
    (value) => isValidEmailList(value)
);

const SignupSchema = yup.object().shape({
    // code: yup.string().required('Required'),
    name: yup.string().required('Required'),
    //registerDate: yup.string().required('Required'),
    //bankAuthorizeDate: yup.string(),
    //person1: yup.string().required('Required'),
    //person2: yup.string().required('Required'),
    //mobile1:yup.string().min(11, 'Must be 11 Digits!').max(11, 'Must be 11 Digits!').required('Required'),
    //mobile2:yup.string().min(11, 'Must be 11 Digits!').max(11, 'Must be 11 Digits!').required('Required'),
    //ntn: yup.string().required('Required'),
    //strn: yup.string().required('Required'),
    //address1: yup.string().required('Required'),
    //address2: yup.string().required('Required'),
    city: yup.string().required('Required'),
    // zip: yup.string().required('Required'),
    //telephone1: yup.string().required('Required'),
    //telephone2: yup.string().required('Required'),
    infoMail: emailListSchema(),
    accountsMail: emailListSchema(),
    types: yup.array().required('Atleast 1 Type Required!').min(1, "Atleast 1 Type Required!"),
    operations: yup.array().required('Atleast 1 Operation Required!').min(1, "Atleast 1 Operation Required!"),
    // Non-GL party (name only, no ledger). When unchecked the party gets a
    // ledger, so a Parent Account becomes required.
    nonGl: yup.boolean(),
    parentAccount: yup.mixed().when('nonGl', {
        is: (val) => val === false,
        then: yup.mixed().test(
            'parent-required',
            'Parent Account is required to create a ledger',
            (v) => v !== undefined && v !== null && v !== ''
        ),
        otherwise: yup.mixed(),
    }),
});

const CreateOrEdit = ({state, dispatch, baseValues, clientData, id}) => {

    // console.log("Client CreateOrEdit", state)

    const company = useSelector((state) => state.company.companies);
    const [register_date, setRegisterdate] = useState(moment().format('YYYY-MM-DD'));

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
      resolver: yupResolver(SignupSchema),
      defaultValues: {
        ...state.values,
        nonGl: true,
      }    });
    const { oldRecord, Representatives } = state;

    // Only CEO/CFO/admin can attach a ledger, so only they can uncheck Non-GL.
    // Everyone else sees it checked and locked and can only make name-only
    // parties (enforced again on the backend).
    const canAttachLedger = checkPartyCreateAccess();
    const nonGl = useWatch({ control, name: 'nonGl' });

    // Controlled tabs so a validation error can switch to the offending tab.
    const [activeTab, setActiveTab] = useState('1');
    const { refetch } = useQuery({
      queryKey:['values'],
      queryFn:getJobValues
    });

        // console.log("state date", state)


    useEffect(() => {
    //Edit
    if(id!="new") {
      let tempState = {...clientData};
      let tempCompanyList = [...state.editCompanyList];
      tempState.operations = tempState.operations?.split(', ');
      tempState.types = tempState.types?.split(', ');
      tempState.registerDate = tempState.registerDate ? moment(tempState.registerDate) : "";
      tempState.bankAuthorizeDate = moment(tempState.bankAuthorizeDate);
      tempState.companies = [];
    //   clientData.Client_Associations?.forEach((x)=>{ tempState.companies.push(x.CompanyId) })
    //   tempCompanyList.forEach((x, i)=>{
        // for(let j=0; j<tempState.Client_Associations?.length; j++){
        //   if(tempState.Client_Associations[j].CompanyId==x.value){
        //     tempCompanyList[i].disabled=true;
        //     break;
        //   } else {
        //     tempCompanyList[i].disabled=false;
        //   }
        // }
    //   })
    tempState.Client_Associations?.forEach((x)=>{
        // console.log("association", x.Child_Account.parent.id)
        tempState.parentAccount = x.Child_Account.parent.id
    })
      dispatch({type:'toggle', fieldName:'editCompanyList', payload:tempCompanyList});
      dispatch({type:'toggle', fieldName:'oldRecord', payload:tempState});
      // An existing party with a parent account already has a ledger -> not non-GL.
      reset({...tempState, parentAccount:tempState.parentAccount, nonGl: !tempState.parentAccount});
    }
    if(id=="new") {
        reset({...baseValues, parentAccount:state.parentAccount, nonGl: true})
    }
    }, [state.parentAccount])
    
    //Create
    const onSubmit = async(data) => {
        // Non-GL party: never send a parent account, so no ledger is created.
        if (data.nonGl) data.parentAccount = '';
        let Username = Cookies.get('username')
        data.createdBy = Username;
        let pAccountName = ''
        dispatch({type:'toggle', fieldName:'load', payload:true});
        state.accountList.forEach((x)=>{
            if(x.id==data.parentAccount){
                pAccountName =x.id
            }
        });
        setTimeout(async() => {
            await axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_POST_CREATE_CLIENT,{
                ...data, pAccountName, employeeId: Cookies.get('loginId')
            }).then((x)=>{
                if(x.data.status=='success'){
                    openNotification('Success', `Client ${x.data.result.name} Created!`, 'green');
                    refetch();
                    Router.push(`/setup/client/${x.data.result.id}`);
                }else if(x.data.status == 'exists'){
                    openNotification('Error', `Client Already Exists`, 'orange')
                }else{
                    openNotification('Error', `An Error occured Please Try Again!`, 'red')
                }
                dispatch({type:'toggle', fieldName:'load', payload:false});
            })
        }, 3000);
    };
    //Edit funtion
    const onEdit = async(data) => {
        // Non-GL party: never send a parent account, so no ledger is created.
        if (data.nonGl) data.parentAccount = '';
        let history = "";
        let pAccountName = ''
        let tempAssociations = [];
        let EmployeeId = Cookies.get('loginId');
        let updateDate = moment().format('MMM Do YY, h:mm:ss a');
        history = await createHistory(Representatives, oldRecord, data, company);
        data.Client_Associations.forEach((x)=> { tempAssociations.push(x.CompanyId) })
        data.companies = [ ...getDifference(data.companies, tempAssociations), ...getDifference(tempAssociations, data.companies)];
        dispatch({type:'toggle', fieldName:'load', payload:true});
        state.accountList.forEach((x)=>{
            if(x.id==data.parentAccount){
                pAccountName =x.id
            }
        });
        setTimeout(async() => {
            await axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_POST_EDIT_CLIENT,{
                data, history, updateDate, pAccountName, employeeId: Cookies.get('loginId')
            }).then((x)=>{
                if(x.data.status=='success'){
                    openNotification('Success', `Client ${data.name} Updated!`, 'green');
                    refetch();
                } else { openNotification('Error', `An Error occured Please Try Again!`, 'red') }
                dispatch({type:'toggle', fieldName:'load', payload:false});
            })
        }, 3000);
    };

    // Which tab each validated field lives on + a human label, so a validation
    // failure can name the field AND jump to its tab (the error is often on a
    // tab the user isn't looking at, e.g. Parent Account on Account Info).
    const FIELD_META = {
        name:          { label: 'Name',            tab: '1' },
        city:          { label: 'City',            tab: '1' },
        types:         { label: 'Type(s)',         tab: '1' },
        operations:    { label: 'Operation(s)',    tab: '1' },
        infoMail:      { label: 'Info Mail',       tab: '1' },
        accountsMail:  { label: 'Accounts Mail',   tab: '1' },
        parentAccount: { label: 'Parent Account',  tab: '3' },
    };

    const onError = (formErrors) => {
        const keys = Object.keys(formErrors || {});
        if (!keys.length) return;
        // Jump to the earliest tab that has an error so the field is visible.
        const tabs = keys.map((k) => FIELD_META[k]?.tab).filter(Boolean).sort();
        if (tabs.length) setActiveTab(tabs[0]);
        const labels = keys.map((k) => FIELD_META[k]?.label || k);
        openNotification(
            'Please complete required fields',
            `Missing or invalid: ${labels.join(', ')}`,
            'red'
        );
    };

    function getDifference(array1, array2){
        return array1.filter(object1 => {
            return !array2.some(object2 => {
                return object1 === object2;
            });
        });
    }
    
    return (
    <div className='client-styles' style={{maxHeight:720, overflowY:'auto', overflowX:'hidden'}}>
      <form onSubmit={handleSubmit(id!="new"?onEdit:onSubmit, onError)} >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={{
          right: (
            <button type="submit" disabled={state.load?true:false} className='btn-custom'>
              {state.load?<Spinner animation="border" size='sm' className='mx-3' />:'Submit'}
            </button>
          )
        }}
      >
        {/* Basic info tab */}
        <Tabs.TabPane tab="Basic Info" key="1">
        <Row>
            <Col md={12} className='py-1'>
                <Row>
                    <Col md={3}>
                        <InputComp disabled  register={register} name='code' control={control} label='Code' />
                        {errors.code && <div className='error-line'>{errors.code.message}*</div>}
                    </Col>
                    <Col md={3}>
                        <SelectComp width={100} register={register} name='active' control={control} label='Status'
                            options={[
                                {name:'Active', id:true},
                                {name:'Inactive', id:false},
                            ]}
                        />
                    </Col>
                </Row>
            </Col>
            <Col md={6} className='py-1'>
                <InputComp  register={register} name='name' control={control} label='Name*' />
                {errors.name && <div className='error-line'>{errors.name.message}*</div>}
            </Col>
            <Col className='py-1'>     
                <DateComp register={register} name='registerDate' defaultValues={register_date} control={control} label='Register Date' />
                {errors.registerDate && <div className='error-line'>Required*</div>}
            </Col>
            <Col md={2} className='py-1'>
                <InputComp register={register} name='city' control={control} label='City' />
                {errors.city && <div className='error-line'>{errors.city.message}*</div>}
            </Col>
            <Col md={2} className='py-1'>
                <InputComp register={register} name='zip' control={control} label='ZIP' />
                {errors.zip && <div className='error-line'>{errors.zip.message}*</div>}
            </Col>
            <Col md={6} className='py-1'>
                <InputComp register={register} name='address1' control={control} label='Address 1' />
                {errors.address1 && <div className='error-line'>{errors.address1.message}*</div>}
            </Col>
            <Col md={6} className='py-1'>
                <InputComp register={register} name='address2' control={control} label='Address 2' />
                {errors.address2 && <div className='error-line'>{errors.address2.message}*</div>}
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='person1' control={control} label='Person 1' />
                {errors.person1 && <div className='error-line'>{errors.person1.message}*</div>}
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='mobile1' control={control} label='Mobile 1' />
                {errors.mobile1 && <div className='error-line'>{errors.mobile1.message}*</div>}
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='person2' control={control} label='Person 2' />
                {errors.person2 && <div className='error-line'>{errors.person2.message}*</div>}
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='mobile2' control={control} label='Mobile 2' />
                {errors.mobile2 && <div className='error-line'>{errors.mobile2.message}*</div>}
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='telephone1' control={control} label='Telephone 1' />
                {errors.telephone1 && <div className='error-line'>{errors.telephone1.message}*</div>}
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='telephone2' control={control} label='Telephone 2' />
                {errors.telephone2 && <div className='error-line'>{errors.telephone2.message}*</div>}
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='website' control={control} label='Website' />
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='infoMail' control={control} label='Info Mail (separate multiple with ;)' />
                {errors.infoMail && <div className='error-line'>{errors.infoMail.message}*</div>}
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='accountsMail' control={control} label='Accounts Mail (separate multiple with ;)' />
                {errors.accountsMail && <div className='error-line'>{errors.accountsMail.message}*</div>}
            </Col>
            <Col md={4} className='py-1'>
                <InputComp register={register} name='ntn' control={control} label='NTN No.' />
                {errors.ntn && <div className='error-line'>{errors.ntn.message}*</div>}
            </Col>
            <Col md={4} className='py-1'>
                <InputComp register={register} name='strn' control={control} label='STRN No.' />
                {errors.strn && <div className='error-line'>{errors.strn.message}*</div>}
            </Col>
            <Col md={12} className='py-1'>
                <CheckGroupComp register={register} name='operations' control={control} label='Operations'
                options={state.Operations}/>
                {errors.operations && <div className='error-line'>{errors.operations.message}*</div>}
            </Col>
            <Col md={12} className='py-1'>
                <CheckGroupComp register={register} name='types' control={control} label='Type'
                    options={state.Types}/>
                {errors.types && <div className='error-line'>{errors.types.message}*</div>}
            </Col>
        </Row>
        </Tabs.TabPane>
        {/* Bank info tab */}
        <Tabs.TabPane tab="Bank Info" key="2">
        <Row>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='bank' control={control} label='Bank' />
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='branchName' control={control} label='Branch Name' />
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='branchCode' control={control} label='Branch Code' />
            </Col>
            <Col md={6} className='py-1'>
                <InputComp register={register} name='accountNo' control={control} label='Account No.' />
            </Col>
            <Col md={6} className='py-1'>
                <InputComp register={register} name='iban' control={control} label='IBAN' />
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='routingNo' control={control} label='Routing No.' />
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='swiftCode' control={control} label='Swift Code' />
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='ifscCode' control={control} label='IFSC Code' />
            </Col>
            <Col md={3} className='py-1'>
                <InputComp register={register} name='micrCode' control={control} label='MICR Code' />
            </Col>
            <Col md={3} className='py-1'>
                <DateComp register={register} name='bankAuthorizeDate' control={control} label='Bank Authorize Date' />
            </Col>
            <Col md={3} className='py-1'>     
                <SelectComp width={100} register={register} name='authorizedById' control={control} label='Authorized By:'
                    options={state.Representatives[0].records}
                />
            </Col>
            <div style={{height:185}}></div>
        </Row>
        </Tabs.TabPane>
        {/* Account info tab  */}
        <Tabs.TabPane tab="Account Info" key="3">
        <Row>
            <Col md={12} className='py-2'>
              <label style={{ display:'inline-flex', alignItems:'center', gap:8, cursor: canAttachLedger ? 'pointer' : 'not-allowed', userSelect:'none' }}>
                <input type="checkbox" {...register('nonGl')} disabled={!canAttachLedger} />
                <span style={{ fontWeight:600 }}>Non-GL (name only — no ledger)</span>
              </label>
              {!canAttachLedger &&
                <div style={{ fontSize:12, color:'#888', marginTop:4 }}>
                  Only CEO/CFO/Admin can attach a ledger. To give this party a ledger, it must be set up through Accounts.
                </div>}
            </Col>
            <Col md={6}>
             <SelectSearchComp clear={true} width={"100%"} register={register} name='parentAccount'
                control={control} label={`Parent Account:${nonGl ? '' : ' *'}`}
                disabled={nonGl || !canAttachLedger}
                options={state?.accountList.map((x)=>{
                    return {id:x.id, name:x.title}
                })}
            />
            {errors.parentAccount && <div className='error-line'>{errors.parentAccount.message}*</div>}
            </Col>
            <Col></Col>
            <Col md={6} className='pt-2'>
                <InputComp register={register} name='name' control={control} label='Account Name' 
                    width={"100%"} disabled={true} 
                />
            </Col>

            <hr className='mt-4' />

            <Col md={12} className='py-1'>     
                <SelectComp width={"50%"} register={register} name='accountRepresentatorId' control={control} 
                    label='Account Representative:' options={state.Representatives[0].records} 
                />
            </Col>
            <Col  md={12} className='py-1'>     
                <SelectComp width={"50%"} register={register} name='docRepresentatorId' control={control} 
                    label='Doc Representative:' options={state.Representatives[1].records} 
                />
            </Col>
            <Col md={12} className='py-1'>     
                <SelectComp width={"50%"} register={register} name='salesRepresentatorId' control={control} 
                    label='Sales Representative:' options={state.Representatives[2].records} 
                />
            </Col>
            <Col md={12} className='py-1'>     
                <SelectComp width={200} register={register} name='currency' control={control} label='Currency'
                    options={[  
                        {id:'USD', name:'USD'},
                        {id:'PKR', name:'PKR'},
                        {id:'INR', name:'INR'},
                        {id:'AED', name:'AED'},
                        {id:'AUD', name:'AUD'},
                        { id:"EUR", name:"EUR"},
                        { id:"GBP", name:"GBP"},
                        { id:"OMR", name:"OMR"},
                        { id:"BDT", name:"BDT"},             
                        { id:"CHF", name:"CHF"},
                ]}/>
            </Col>
            <div style={{height:186}}></div>
        </Row>
        </Tabs.TabPane>
        {/* company info tab  */}
        <Tabs.TabPane tab="Company Info" key="4">
        <Row>
            <Col md={12} className='py-1'>     
                <CheckGroupComp register={register} name='companies' control={control} label='Comapnies'
                    options={state.edit?state.editCompanyList:state.companyList} 
                />
            </Col>
            <div style={{height:383}}></div>
        </Row>
        </Tabs.TabPane>
      </Tabs>
      </form>
    </div>
    )
}

export default React.memo(CreateOrEdit)
