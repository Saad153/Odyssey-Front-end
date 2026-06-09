import { Tabs } from 'antd';
import ListData from './list/List';
import { useSelector } from 'react-redux';

const commas = (a) => a == 0 ? '0' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ")

const VoucherList = ({ voucherData }) => {

  const companyId = useSelector((state) => state.company.value);

  const FirstCatVouchers = voucherData?.result?.filter((x) => ["CPV", "CRV", "BPV", "BRV", "JV", "TV"].includes(x.vType)) || [];
  const secondCatVouchers = voucherData?.result?.filter((x) => ["SI", "PI"].includes(x.vType)) || [];
  const thirdCatVouchers = voucherData?.result?.filter((x) => ["OP", "OB", "OI"].includes(x.vType)) || [];

  return (
  <div className='base-page-layout'>
    <Tabs defaultActiveKey='1'>
      <Tabs.TabPane tab="General" key={"1"}>
        <ListData voucherData={FirstCatVouchers} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="SI / PI" key={"2"}>
        <ListData voucherData={secondCatVouchers} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="OP (Opening)" key={"3"}>
        <ListData voucherData={thirdCatVouchers} />
      </Tabs.TabPane>
    </Tabs>
  </div>
  );
};

export default VoucherList
