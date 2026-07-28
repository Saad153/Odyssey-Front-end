import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputComp from 'Components/Shared/Form/InputComp';
import DateComp from 'Components/Shared/Form/DateComp';
import { Row, Col, Spinner } from 'react-bootstrap';
import axiosClient from 'apis/axiosClient';
import openNotification from 'Components/Shared/Notification';
import Cookies from 'js-cookie';
import moment from 'moment';

const SignupSchema = yup.object().shape({
    label: yup.string().required('Required'),
    suffix: yup.string().required('Required'),
    startDate: yup.mixed().required('Required'),
    endDate: yup.mixed().required('Required'),
});

const baseValues = { label: '', suffix: '', startDate: null, endDate: null };

const CreateOrEdit = ({ edit, selectedFiscalYear, onSaved, load, setLoad }) => {

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(SignupSchema),
        defaultValues: baseValues
    });

    useEffect(() => {
        if (edit && selectedFiscalYear) {
            reset({
                ...selectedFiscalYear,
                startDate: selectedFiscalYear.startDate,
                endDate: selectedFiscalYear.endDate,
            });
        } else {
            reset(baseValues);
        }
    }, [edit, selectedFiscalYear]);

    const submit = async (data) => {
        setLoad(true);
        const payload = {
            ...data,
            startDate: moment(data.startDate).format('YYYY-MM-DD'),
            endDate: moment(data.endDate).format('YYYY-MM-DD'),
            employeeId: Cookies.get('loginId'),
        };
        const url = edit
            ? `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/fiscalYears/edit`
            : `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/fiscalYears/create`;
        const body = edit ? { id: selectedFiscalYear.id, ...payload } : payload;

        await axiosClient.post(url, body).then((x) => {
            if (x.data.status === 'success') {
                openNotification('Success', `Fiscal year ${edit ? 'updated' : 'created'}!`, 'green');
                reset(baseValues);
                onSaved();
            } else {
                openNotification('Error', x.data.result || 'Something went wrong', 'red');
            }
        }).catch((e) => {
            openNotification('Error', e.response?.data?.result || 'Something went wrong', 'red');
        });
        setLoad(false);
    };

    const onError = (errors) => console.log(errors);

    return (
        <div className='client-styles'>
            <h6>{edit ? 'Edit' : 'Create'} Fiscal Year</h6>
            <form onSubmit={handleSubmit(submit, onError)}>
                <Row>
                    <Col md={7} className='py-1'>
                        <InputComp register={register} name='label' control={control} label='Label (e.g. FY 2025-2026)' />
                        {errors.label && <div className='error-line'>{errors.label.message}</div>}
                    </Col>
                    <Col md={5} className='py-1'>
                        <InputComp register={register} name='suffix' control={control} label='Numbering Suffix (e.g. 26)' />
                        {errors.suffix && <div className='error-line'>{errors.suffix.message}</div>}
                    </Col>
                </Row>
                <Row>
                    <Col md={6} className='py-2'>
                        <DateComp control={control} name='startDate' label='Start Date' width={'100%'} />
                        {errors.startDate && <div className='error-line'>{errors.startDate.message}</div>}
                    </Col>
                    <Col md={6} className='py-2'>
                        <DateComp control={control} name='endDate' label='End Date' width={'100%'} />
                        {errors.endDate && <div className='error-line'>{errors.endDate.message}</div>}
                    </Col>
                </Row>
                <div style={{ height: 16 }}></div>
                <hr />
                <button type="submit" disabled={load} className='btn-custom'>
                    {load ? <Spinner animation="border" size='sm' className='mx-3' /> : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default React.memo(CreateOrEdit);
