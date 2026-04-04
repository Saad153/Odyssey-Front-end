import React from 'react';
import PrintTopHeader from '../../../Shared/PrintTopHeader';
import moment from 'moment';
import { Table } from 'antd';
import { render } from 'sass';

const commas = (a) => a == 0 ? '0.00' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const Comparative = ({ query, result }) => {
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

    console.log(result)
    return (
        <div className='base-page-layout' >
            <PrintTopHeader company={query.company} from={moment(query.from).format("DD-MM-YYYY")} to={moment(query.to).format("DD-MM-YYYY")} />
            <Table columns={columns} dataSource={dataWithTotals} scroll={{ x: true }} />
        </div>
    );
};

export default Comparative;