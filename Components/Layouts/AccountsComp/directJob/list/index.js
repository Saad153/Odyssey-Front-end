import { DeleteOutlined, DollarOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Pagination } from "antd";
import { incrementTab } from 'redux/tabs/tabSlice';
import PopConfirm from 'Components/Shared/PopConfirm';
import Router from 'next/router';
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { resetDirectJob } from "../../../../../redux/directJob/directJobSlice";
import axios from "axios";
import openNotification from "../../../../Shared/Notification";

const commas = (a) => a == 0 ? '0' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const DirectJobList = ({ voucherData }) => {

    const dispatch = useDispatch();
    const [total, setTotal] = useState(0);
    const [refresh, setRefresh] = useState(false);

    const [ search, setSearch ] = useState("");
    const [ accounts, setAccounts ] = useState([])

    const [allRecords, setAllRecords ] = useState([]); // example data
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10; // records per page
    const indexOfLast = currentPage * pageSize;
    const indexOfFirst = indexOfLast - pageSize;
    const currentRecords = allRecords.slice(indexOfFirst, indexOfLast);

    const deleteData = async (id) => {
        try {
            PopConfirm(
            "Confirmation",
            "Are You Sure You Want To Delete This?",
            async () => {
                // setLoading(true);

                console.log(id); // use the id parameter

                // Call backend
                await axios.post(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/deleteDirectJob`,
                {}, // body
                { headers: { id: id } } // send the id in headers
                );

                // Run after deletion
                dispatch(resetDirectJob());
                setRefresh(prev => !prev)
                openNotification('Success', `Direct Job Deleted`, 'green');
                // setLoading(false);
                // dispatch(removeTab('3-15')); // just pass the number directly
            }
            );
        } catch (e) {
            console.log(e);
            // setLoading(false);
        }
    };

useEffect(() => {
  const fetchData = async () => {
    console.log("Fetching Data")
    try {
      const res = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CHILD_ACCOUNTS);
      setAccounts(res?.data?.result || []);

      const jobs = await axios.get(
        `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/getDirectJobList`,
        {
          params: {
            page: currentPage,
            pageSize,
            search
          }
        }
      );

      setAllRecords(jobs.data.result);
      setTotal(jobs.data.total);

    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, [currentPage, search, refresh]);   // 👈 refetch when page/search changes



    return (
        <div className='base-page-layout'>
            <Row style={{ width: '100%', justifyContent: 'space-between', alignItems: 'end', borderBottom: '2px solid black', paddingBottom: '10px'}}>
                <Col md={12}>
                    <h2 style={{margin: '0', padding: '0'}}>Direct Job Expense / Revenue</h2>
                </Col>
                <Col md={6}>
                    {/* Pagination controls here */}
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={total}
                        onChange={(page) => setCurrentPage(page)}
                        size="small"
                        showSizeChanger={false}
                    />
                </Col>
                <Col md={5} style={{ position: 'relative' }}>
                    <Input
                    placeholder="Search..."
                    style={{
                        borderRadius: '25px',
                        width: '100%',
                        padding: '5px 30% 5px 15px'
                    }}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);   // reset page on search
                    }}
                    ></Input>
                    <Button
                        style={{
                            position: 'absolute',
                            right: '0',
                            top: '0%',
                            // transform: 'translateY(-50%)',

                            width: '35px',     // equal width & height → circle
                            height: '35px',
                            padding: 0,

                            backgroundColor: '#1f2937',
                            color: 'white',
                            borderRadius: '50%',

                            display: 'flex',            // center icon
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                        }}
                        >
                        <SearchOutlined style={{ color: 'white', fontSize: '20px' }} />
                        </Button>
                </Col>
                <Col md={1} style={{ position: 'relative', justifyContent: 'flex-end', display: 'flex' }}>
                    <Button
                        onClick={async () => {
                            dispatch(incrementTab({ "label": "Direct Job E / R", "key": "3-15", "id": "new" }))
                            dispatch(resetDirectJob())
                            await Router.push(`/accounts/directJob/new`)
                        }}
                        style={{
                            width: '35px',     // equal width & height → circle
                            height: '35px',
                            padding: 0,
                            backgroundColor: '#1f2937',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',            // center icon
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                        }}
                        >
                            <PlusOutlined style={{ color: 'white', fontSize: '20px' }} />
                    </Button>
                </Col>
            </Row>
            {currentRecords.map((item, index) => (
                <Row key={index} className="voucher-box">
                    <Row className="d-flex w-100" style={{ height: '40%'}}>
                        <Col md={5}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Entry #</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{item.Entry_No}</span>
                            </Row>
                        </Col>
                        <Col md={4}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Job #</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{item.Associations[0].Job.jobNo}</span>
                            </Row>
                        </Col>
                        <Col md={4}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Account #</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{accounts.find((x) => x.id === item.Account_No)?.title}</span>
                            </Row>
                        </Col>
                        <Col md={3}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Cost Center</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>KHI</span>
                            </Row>
                        </Col>
                        <Col md={3}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Currency</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{item.Currency}</span>
                            </Row>
                        </Col>
                        <Col md={4}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Reference #</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{item.Reference_No}</span>
                            </Row>
                        </Col>
                        <Col md={1} style={{ justifyContent: 'center', display: 'flex', alignItems: 'end' }}>
                            <Button
                                onClick={async () => {
                                    dispatch(incrementTab({ "label": "Edit Direct Job E / R", "key": "3-15", "id": item.id }))
                                    await Router.push(`/accounts/directJob/${item.id}`)
                                }}
                                className="edit-btn"
                                >
                                    <EditOutlined className="edit-icon" style={{ color: '#1f2937', fontSize: '20px' }} />
                            </Button>
                        </Col>
                    </Row>
                    <Row style={{ width: '100%', height: '20%', margin: '0'}}>
                        {/* <span style={{ marginRight: '10px', padding: '0px 10px', backgroundColor: '#16A34A', color: 'white', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', justifyContent: 'center', display: 'flex', alignItems: 'center'}}>Active</span> */}
                        {item.Tran_Mode == 'Bank' && <span style={{ marginRight: '10px', padding: '0px 10px', backgroundColor: '#1D4ED8', color: 'white', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', justifyContent: 'center', display: 'flex', alignItems: 'center'}}>Bank</span>}
                        {item.Tran_Mode == 'Cash' && <span style={{ marginRight: '10px', padding: '0px 10px', backgroundColor: '#0EA5E9', color: 'white', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', justifyContent: 'center', display: 'flex', alignItems: 'center'}}>Cash</span>}
                        {item.Tran_Mode == 'Adjust' && <span style={{ marginRight: '10px', padding: '0px 10px', backgroundColor: '#F59E0B', color: 'white', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', justifyContent: 'center', display: 'flex', alignItems: 'center'}}>Adjustment</span>}
                        {item.Job_Type == 'single' && <span style={{ marginRight: '10px', padding: '0px 10px', backgroundColor: '#6D28D9', color: 'white', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', justifyContent: 'center', display: 'flex', alignItems: 'center'}}>Single</span>}
                        {item.Job_Type == 'multiple' && <span style={{ marginRight: '10px', padding: '0px 10px', backgroundColor: '#9333EA', color: 'white', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', justifyContent: 'center', display: 'flex', alignItems: 'center'}}>Multiple</span>}
                        {item.Type == 'revenue' && <span style={{ marginRight: '10px', padding: '0px 10px', backgroundColor: '#059669', color: 'white', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', justifyContent: 'center', display: 'flex', alignItems: 'center'}}>Revenue</span>}
                        {item.Type == 'expense' && <span style={{ marginRight: '10px', padding: '0px 10px', backgroundColor: '#DC2626', color: 'white', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold', justifyContent: 'center', display: 'flex', alignItems: 'center'}}>Expense</span>}
                    </Row>
                    <Row className="d-flex w-100" style={{ height: '40%', marginTop: '5px'}}>
                        <Col md={3}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Entry Date</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{moment(item.updatedAt).format("DD-MMM-YYYY")}</span>
                            </Row>
                        </Col>
                        <Col md={2}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Operation</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{item.Operation.toUpperCase()}</span>
                            </Row>
                        </Col>
                        <Col md={4}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Cheque #</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{item.Cheque_No}</span>
                            </Row>
                        </Col>
                        <Col md={4}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Cheq Date</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{moment(item.Cheque_Date).format("DD-MMM-YYYY")}</span>
                            </Row>
                        </Col>
                        <Col md={3}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Amount</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{commas(item.Associations.reduce((sum, assoc) => sum + Number(assoc.Amount),0))}</span>
                            </Row>
                        </Col>
                        <Col md={3}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Voucher #</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{item.Associations[0].Voucher.voucher_Id}</span>
                            </Row>
                        </Col>
                        <Col md={4}>
                            <Row>
                                <span style={{ color: 'grey', fontSize: '14px' }}>Created By</span>
                            </Row>
                            <Row>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1f2937'}}>{item.Associations[0].Voucher.createdBy}</span>
                            </Row>
                        </Col>
                        <Col md={1} style={{ justifyContent: 'center', display: 'flex', alignItems: 'start' }}>
                            <Button
                                className="delete-btn"
                                onClick={() => {
                                    deleteData(item.id)
                                }}
                                >
                                    <DeleteOutlined className="delete-icon" style={{ color: '#1f2937', fontSize: '20px' }} />
                            </Button>
                        </Col>
                    </Row>
                </Row>
            ))}
        </div>
    );
};

export default DirectJobList
