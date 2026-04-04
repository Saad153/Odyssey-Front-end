import React from 'react';
import PrintTopHeader from '../../../Shared/PrintTopHeader';
import moment from 'moment';
import { Table } from 'antd';
import { render } from 'sass';

const commas = (a) => a == 0 ? '0.00' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const Summary = ({ query, result }) => {

    const columns = [
        {
            title: "Client Name",
            dataIndex: 'clientName',
            key: 'clientName'
        },
        {
            title: 'Revenue',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            render: (text) => <span>{commas(text)}</span>
        },
        {
            title: 'Expense',
            dataIndex: 'totalExpense',
            key: 'totalExpense',
            render: (text) => <span>{commas(text)}</span>
        },
        {
            title: 'PNL',
            dataIndex: 'totalProfitLoss',
            key: 'totalProfitLoss',
            render: (text) => <span style={{ color: text < 0 ? 'red' : 'green' }}>{commas(text)}</span>
        },
        {
            title: 'GP',
            dataIndex: 'GP',
            key: 'GP',
            render: (text) => <span style={{ color: text < 0 ? 'red' : 'green' }}>{commas(text)}</span>
        },
    ]
    
    // Add optional columns if present in the data
    if (result.result.some(item => item.totalVol !== undefined)) {
        columns.push({
            title: 'Total Vol',
            dataIndex: 'totalVol',
            key: 'totalVol',
            render: (text) => <span>{commas(text)}</span>
        });
    }
    if (result.result.some(item => item.totalWeight !== undefined)) {
        columns.push({
            title: 'Total Weight',
            dataIndex: 'totalWeight',
            key: 'totalWeight',
            render: (text) => <span>{commas(text)}</span>
        });
    }
    if (result.result.some(item => item.totalTeu !== undefined)) {
        columns.push({
            title: 'Total TEU',
            dataIndex: 'totalTeu',
            key: 'totalTeu',
            render: (text) => <span>{commas(text)}</span>
        });
    }
    if (result.result.some(item => item.totalShpVol !== undefined)) {
        columns.push({
            title: 'Total Shp Vol',
            dataIndex: 'totalShpVol',
            key: 'totalShpVol',
            render: (text) => <span>{commas(text)}</span>
        });
    }

    console.log(result)
    return (
        <div className='base-page-layout' >
            <PrintTopHeader company={query.company} from={moment(query.from).format("DD-MM-YYYY")} to={moment(query.to).format("DD-MM-YYYY")} />
            <Table columns={columns} dataSource={result.result}></Table>
        </div>
    );
};

export default Summary;