import { useForm } from "react-hook-form";
import openNotification from 'Components/Shared/Notification';
import InputComp from 'Components/Shared/Form/InputComp';
import { yupResolver } from "@hookform/resolvers/yup";
import { Row, Col, Spinner } from 'react-bootstrap';
import React, { useEffect } from 'react';
import * as yup from "yup";
import { createAirport, updateAirport } from 'apis/pickLists';

const CreateOrEdit = ({ state, dispatch, baseValues }) => {

    const SignupSchema = yup.object().shape({
        airportCode: yup.string().required('Required'),
        airportName: yup.string().required('Required'),
        city: yup.string().required('Required'),
        country: yup.string().required('Required'),
    });

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(SignupSchema),
        defaultValues: state.values
    });

    useEffect(() => {
        reset(state.edit ? state.selectedRecord : baseValues);
    }, [state.selectedRecord])

    const onError = (errors) => console.log(errors);

    const onSubmit = async (data) => {
        dispatch({ type: 'toggle', fieldName: 'load', payload: true });
        try {
            const result = await createAirport(data);
            if (result.status !== 'success') {
                openNotification('Error', 'Error Occured Try Again!', 'red')
            } else {
                openNotification('Success', 'Airport Created!', 'green');
                let tempRecord = [...state.records];
                tempRecord.unshift(result.result);
                dispatch({ type: 'toggle', fieldName: 'records', payload: tempRecord });
                dispatch({ type: 'modalOff' })
            }
        } finally {
            dispatch({ type: 'toggle', fieldName: 'load', payload: false });
        }
    };

    const onEdit = async (data) => {
        dispatch({ type: 'toggle', fieldName: 'load', payload: true });
        try {
            const result = await updateAirport({ ...data, id: state.selectedRecord.id });
            if (result.status !== 'success') {
                openNotification('Error', 'Error Occured Try Again!', 'red')
            } else {
                openNotification('Success', 'Airport Updated!', 'green');
                let tempRecords = [...state.records];
                let i = tempRecords.findIndex((y) => state.selectedRecord.id == y.id);
                tempRecords[i] = result.result;
                dispatch({ type: 'toggle', fieldName: 'records', payload: tempRecords });
                dispatch({ type: 'modalOff' })
            }
        } finally {
            dispatch({ type: 'toggle', fieldName: 'load', payload: false });
        }
    };

    return (
        <div className='client-styles' style={{ maxHeight: 720, overflowY: 'auto', overflowX: 'hidden' }}>
            <h6>{state.edit ? 'Edit' : 'Create'} Airport</h6>
            <form onSubmit={handleSubmit(state.edit ? onEdit : onSubmit, onError)}>
                <Row>
                    <Col md={3} className='py-1'>
                        <InputComp register={register} name='airportCode' control={control} label='Code' />
                        {errors.airportCode && <div className='error-line'>{errors.airportCode.message}*</div>}
                    </Col>
                    <Col md={5} className='py-1'>
                        <InputComp register={register} name='airportName' control={control} label='Airport Name' />
                        {errors.airportName && <div className='error-line'>{errors.airportName.message}*</div>}
                    </Col>
                    <Col md={4} className='py-1'>
                        <InputComp register={register} name='city' control={control} label='City' />
                        {errors.city && <div className='error-line'>{errors.city.message}*</div>}
                    </Col>
                    <Col md={4} className='py-1'>
                        <InputComp register={register} name='country' control={control} label='Country' />
                        {errors.country && <div className='error-line'>{errors.country.message}*</div>}
                    </Col>
                </Row>
                <button type="submit" disabled={state.load ? true : false} className='btn-custom mt-4'>
                    {state.load ? <Spinner animation="border" size='sm' className='mx-3' /> : 'Submit'}
                </button>
            </form>
        </div>
    )
}

export default CreateOrEdit
