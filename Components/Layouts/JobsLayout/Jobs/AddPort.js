"use client"
import React, { useState } from 'react'
import { Row } from 'react-bootstrap';
import { Modal, Input } from 'antd';
import openNotification from '../../../Shared/Notification';
import { createPort } from 'apis/pickLists';

const AddPort = ({ isOpen, onClose, onCreated }) => {

    const [data, setData] = useState({})

    const onSubmit = async () => {
        try {
            await createPort(data);
            openNotification("Success", "Port Created", "green")
            onCreated?.();
            onClose()
        } catch (error) {
            console.log(error)
            openNotification("Error", "Could Not Create Port", "red")
        }
    }

    return (
        <>
            <Modal bodyStyle={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }} title="Add New Port" open={isOpen} onOk={onClose} onCancel={onClose}>
                <Row className='d-flex justify-content-center'>
                    <div className='my-2 py-2'>
                        <label>Code *</label>
                        <Input placeholder="Enter code" className='rounded' onChange={(e) => setData({ ...data, portId: e.target.value })} />
                    </div>
                    <div className='my-2'>
                        <label>Port Name *</label>
                        <Input placeholder="Enter Port Name" className='rounded' onChange={(e) => setData({ ...data, portName: e.target.value })} />
                    </div>
                    <div className='my-2'>
                        <label>Country *</label>
                        <Input placeholder="Enter Country" className='rounded' onChange={(e) => setData({ ...data, portCountry: e.target.value })} />
                    </div>
                </Row>
                <div className='d-flex justify-content-end mt-4'>
                    <button className='btn-custom-blue fs-11 px-4' onClick={onSubmit}>
                        Create
                    </button>
                </div>
            </Modal>
        </>
    )
}

export default AddPort
