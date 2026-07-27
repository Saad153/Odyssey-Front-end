import React from 'react';
import PrintTopHeader from '../../../Shared/PrintTopHeader';
import moment from 'moment';
import { Table, Button } from 'antd';
import exportExcelFile from 'functions/exportExcelFile';
import { FileExcelOutlined } from '@ant-design/icons';

const commas = (a) => a == 0 ? '0.00' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const Comparative = ({ query, result }) => {
    if (!query.from2 || !query.to2 || query.from2 === 'undefined' || query.to2 === 'undefined') {
        return <div>Please provide valid date ranges for comparison.</div>;
    }

    if (!result || !result.result) {
        return <div>No data available for the selected criteria.</div>;
    }

    const from1 = moment(query.from).format("DD-MM-YYYY")
    const to1 = moment(query.to).format("DD-MM-YYYY")
    const from2 = moment(query.from2).format("DD-MM-YYYY")
    const to2 = moment(query.to2).format("DD-MM-YYYY")
    const columns = [
        {
            title: "Client Name",
            dataIndex: 'clientName',
            key: 'clientName'
        },
        {
            title: `${from1} - ${to1}`,
            children: [
                {
                    title: 'No. of Shipments',
                    dataIndex: ['period1', 'jobCount'],
                    key: 'period1JobCount',
                    render: (text) => <span>{text}</span>
                },
                {
                    title: 'Revenue',
                    dataIndex: ['period1', 'totalRevenue'],
                    key: 'period1Revenue',
                    render: (text) => <span>{commas(text)}</span>
                },
                {
                    title: 'Expense',
                    dataIndex: ['period1', 'totalExpense'],
                    key: 'period1Expense',
                    render: (text) => <span>{commas(text)}</span>
                },
                {
                    title: 'PnL',
                    dataIndex: ['period1', 'PnL'],
                    key: 'period1PnL',
                    render: (text) => <span style={{ color: text < 0 ? 'red' : 'green' }}>{commas(text)}</span>
                },
                {
                    title: 'GP%',
                    dataIndex: ['period1', 'GP'],
                    key: 'period1GP',
                    render: (text) => <span style={{ color: text < 0 ? 'red' : 'green' }}>{commas(text)}%</span>
                },
            ]
        },
        {
            title: `${from2} - ${to2}`,
            children: [
                {
                    title: 'No. of Shipments',
                    dataIndex: ['period2', 'jobCount'],
                    key: 'period2JobCount',
                    render: (text) => <span>{text}</span>
                },
                {
                    title: 'Revenue',
                    dataIndex: ['period2', 'totalRevenue'],
                    key: 'period2Revenue',
                    render: (text) => <span>{commas(text)}</span>
                },
                {
                    title: 'Expense',
                    dataIndex: ['period2', 'totalExpense'],
                    key: 'period2Expense',
                    render: (text) => <span>{commas(text)}</span>
                },
                {
                    title: 'PnL',
                    dataIndex: ['period2', 'PnL'],
                    key: 'period2PnL',
                    render: (text) => <span style={{ color: text < 0 ? 'red' : 'green' }}>{commas(text)}</span>
                },
                {
                    title: 'GP%',
                    dataIndex: ['period2', 'GP'],
                    key: 'period2GP',
                    render: (text) => <span style={{ color: text < 0 ? 'red' : 'green' }}>{commas(text)}%</span>
                },
            ]
        },
        {
            title: 'Variance',
            dataIndex: 'variance',
            key: 'variance',
            render: (text) => <span style={{ color: text < 0 ? 'red' : 'green' }}>{commas(text)}%</span>
        },
        {
            title: 'Total Revenue',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            render: (text) => <span>{commas(text)}</span>
        },
        {
            title: 'Total Expense',
            dataIndex: 'totalExpense',
            key: 'totalExpense',
            render: (text) => <span>{commas(text)}</span>
        },
        {
            title: 'Total PnL',
            dataIndex: 'totalPnL',
            key: 'totalPnL',
            render: (text) => <span style={{ color: text < 0 ? 'red' : 'green' }}>{commas(text)}</span>
        },
        {
            title: 'Total GP%',
            dataIndex: 'totalGP',
            key: 'totalGP',
            render: (text) => <span style={{ color: text < 0 ? 'red' : 'green' }}>{text.toFixed(2)}%</span>
        },
    ]
    
    // Add optional columns if present in the data
    if (result.result.some(item => item.period1 && item.period1.totalVol !== undefined) || result.result.some(item => item.period2 && item.period2.totalVol !== undefined)) {
        columns[1].children.push({
            title: 'Total Vol',
            dataIndex: ['period1', 'totalVol'],
            key: 'period1TotalVol',
            render: (text) => <span>{commas(text)}</span>
        });
        columns[2].children.push({
            title: 'Total Vol',
            dataIndex: ['period2', 'totalVol'],
            key: 'period2TotalVol',
            render: (text) => <span>{commas(text)}</span>
        });
    }
    if (result.result.some(item => item.period1 && item.period1.totalWeight !== undefined) || result.result.some(item => item.period2 && item.period2.totalWeight !== undefined)) {
        columns[1].children.push({
            title: 'Total Weight',
            dataIndex: ['period1', 'totalWeight'],
            key: 'period1TotalWeight',
            render: (text) => <span>{commas(text)}</span>
        });
        columns[2].children.push({
            title: 'Total Weight',
            dataIndex: ['period2', 'totalWeight'],
            key: 'period2TotalWeight',
            render: (text) => <span>{commas(text)}</span>
        });
    }
    if (result.result.some(item => item.period1 && item.period1.totalTeu !== undefined) || result.result.some(item => item.period2 && item.period2.totalTeu !== undefined)) {
        columns[1].children.push({
            title: 'Total TEU',
            dataIndex: ['period1', 'totalTeu'],
            key: 'period1TotalTeu',
            render: (text) => <span>{commas(text)}</span>
        });
        columns[2].children.push({
            title: 'Total TEU',
            dataIndex: ['period2', 'totalTeu'],
            key: 'period2TotalTeu',
            render: (text) => <span>{commas(text)}</span>
        });
    }
    if (result.result.some(item => item.period1 && item.period1.totalShpVol !== undefined) || result.result.some(item => item.period2 && item.period2.totalShpVol !== undefined)) {
        columns[1].children.push({
            title: 'Total Shp Vol',
            dataIndex: ['period1', 'totalShpVol'],
            key: 'period1TotalShpVol',
            render: (text) => <span>{commas(text)}</span>
        });
        columns[2].children.push({
            title: 'Total Shp Vol',
            dataIndex: ['period2', 'totalShpVol'],
            key: 'period2TotalShpVol',
            render: (text) => <span>{commas(text)}</span>
        });
    }

    // Calculate totals for each row
    const dataWithTotals = result.result.map(item => ({
        ...item,
        totalRevenue: (item.period1?.totalRevenue || 0) + (item.period2?.totalRevenue || 0),
        totalExpense: (item.period1?.totalExpense || 0) + (item.period2?.totalExpense || 0),
        totalPnL: (item.period1?.PnL || 0) + (item.period2?.PnL || 0),
        totalGP: ((item.period1?.PnL || 0) + (item.period2?.PnL || 0)) / ((item.period1?.totalRevenue || 0) + (item.period2?.totalRevenue || 0)) * 100 || 0
    }));

    const handleExport = () => {
        if (!dataWithTotals || dataWithTotals.length === 0) {
            alert('No data available to export');
            return;
        }

        const flatColumns = [
            { header: 'Client Name', key: 'clientName', width: 25 },
            { header: `${from1} - ${to1} - No. of Shipments`, key: 'period1JobCount', width: 18 },
            { header: `${from1} - ${to1} - Revenue`, key: 'period1Revenue', width: 18 },
            { header: `${from1} - ${to1} - Expense`, key: 'period1Expense', width: 18 },
            { header: `${from1} - ${to1} - PnL`, key: 'period1PnL', width: 18 },
            { header: `${from1} - ${to1} - GP%`, key: 'period1GP', width: 15 },
            { header: `${from2} - ${to2} - No. of Shipments`, key: 'period2JobCount', width: 18 },
            { header: `${from2} - ${to2} - Revenue`, key: 'period2Revenue', width: 18 },
            { header: `${from2} - ${to2} - Expense`, key: 'period2Expense', width: 18 },
            { header: `${from2} - ${to2} - PnL`, key: 'period2PnL', width: 18 },
            { header: `${from2} - ${to2} - GP%`, key: 'period2GP', width: 15 },
            { header: 'Variance', key: 'variance', width: 15 },
            { header: 'Total Revenue', key: 'totalRevenue', width: 18 },
            { header: 'Total Expense', key: 'totalExpense', width: 18 },
            { header: 'Total PnL', key: 'totalPnL', width: 18 },
            { header: 'Total GP%', key: 'totalGP', width: 15 },
        ];

        if (result.result.some(item => item.period1 && item.period1.totalVol !== undefined) || result.result.some(item => item.period2 && item.period2.totalVol !== undefined)) {
            flatColumns.splice(5, 0, { header: `${from1} - ${to1} - Total Vol`, key: 'period1TotalVol', width: 15 });
            flatColumns.splice(11, 0, { header: `${from2} - ${to2} - Total Vol`, key: 'period2TotalVol', width: 15 });
        }
        if (result.result.some(item => item.period1 && item.period1.totalWeight !== undefined) || result.result.some(item => item.period2 && item.period2.totalWeight !== undefined)) {
            flatColumns.splice(6, 0, { header: `${from1} - ${to1} - Total Weight`, key: 'period1TotalWeight', width: 15 });
            flatColumns.splice(12, 0, { header: `${from2} - ${to2} - Total Weight`, key: 'period2TotalWeight', width: 15 });
        }
        if (result.result.some(item => item.period1 && item.period1.totalTeu !== undefined) || result.result.some(item => item.period2 && item.period2.totalTeu !== undefined)) {
            flatColumns.splice(7, 0, { header: `${from1} - ${to1} - Total TEU`, key: 'period1TotalTeu', width: 15 });
            flatColumns.splice(13, 0, { header: `${from2} - ${to2} - Total TEU`, key: 'period2TotalTeu', width: 15 });
        }
        if (result.result.some(item => item.period1 && item.period1.totalShpVol !== undefined) || result.result.some(item => item.period2 && item.period2.totalShpVol !== undefined)) {
            flatColumns.splice(8, 0, { header: `${from1} - ${to1} - Total Shp Vol`, key: 'period1TotalShpVol', width: 18 });
            flatColumns.splice(14, 0, { header: `${from2} - ${to2} - Total Shp Vol`, key: 'period2TotalShpVol', width: 18 });
        }

        const flatData = dataWithTotals.map(item => ({
            clientName: item.clientName,
            period1JobCount: item.period1?.jobCount || 0,
            period1Revenue: item.period1?.totalRevenue || 0,
            period1Expense: item.period1?.totalExpense || 0,
            period1PnL: item.period1?.PnL || 0,
            period1GP: item.period1?.GP || 0,
            period2JobCount: item.period2?.jobCount || 0,
            period2Revenue: item.period2?.totalRevenue || 0,
            period2Expense: item.period2?.totalExpense || 0,
            period2PnL: item.period2?.PnL || 0,
            period2GP: item.period2?.GP || 0,
            variance: item.variance || 0,
            totalRevenue: item.totalRevenue,
            totalExpense: item.totalExpense,
            totalPnL: item.totalPnL,
            totalGP: item.totalGP,
            ...(item.period1?.totalVol !== undefined || item.period2?.totalVol !== undefined ? {
                period1TotalVol: item.period1?.totalVol || 0,
                period2TotalVol: item.period2?.totalVol || 0,
            } : {}),
            ...(item.period1?.totalWeight !== undefined || item.period2?.totalWeight !== undefined ? {
                period1TotalWeight: item.period1?.totalWeight || 0,
                period2TotalWeight: item.period2?.totalWeight || 0,
            } : {}),
            ...(item.period1?.totalTeu !== undefined || item.period2?.totalTeu !== undefined ? {
                period1TotalTeu: item.period1?.totalTeu || 0,
                period2TotalTeu: item.period2?.totalTeu || 0,
            } : {}),
            ...(item.period1?.totalShpVol !== undefined || item.period2?.totalShpVol !== undefined ? {
                period1TotalShpVol: item.period1?.totalShpVol || 0,
                period2TotalShpVol: item.period2?.totalShpVol || 0,
            } : {}),
        }));

        exportExcelFile(flatData, flatColumns, {
            title: query.company == '1' ? 'SEA NET SHIPPING & LOGISTICS' : query.company == '2' ? 'AIR CARGO SERVICES' : 'SEANET + AIR CARGO',
            address: 'House# A230, PECHS, Block 2,  Karachi',
            dateRange: `Date: From ${from1} To ${to1}`,
            fileName: `Comparative_Report_${from1}_${to1}.xlsx`,
        });
    };

    console.log(result)
    return (
        <div className='base-page-layout' >
            <div style={{ position: 'relative', marginBottom: '20px' }}>
                <PrintTopHeader company={query.company} from={moment(query.from).format("DD-MM-YYYY")} to={moment(query.to).format("DD-MM-YYYY")} />
                <Button
                    className="btn-custom-excel my-1 px-2"
                    onClick={handleExport}
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        backgroundColor: '#28a745',
                        borderRadius: '10px',
                        borderColor: '#28a745',
                        color: '#ffffff',
                    }}
                >
                    <FileExcelOutlined /> Export to Excel
                </Button>
            </div>
            <Table columns={columns} dataSource={dataWithTotals} scroll={{ x: true }} />
        </div>
    );
};

export default Comparative;