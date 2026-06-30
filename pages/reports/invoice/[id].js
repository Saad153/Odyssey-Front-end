import InvoiceCharges from '../../../Components/Shared/InvoiceCharges';
import { useSelector } from 'react-redux';
import axiosClient from '../../../apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from '../../../functions/withAuthRedirect';

const InvoiceDetails = ({ invoiceData }) => {
  const companyId = useSelector((state) => state.company.value);
  return (
    <div className='base-page-layout'>
      <InvoiceCharges data={invoiceData} companyId={companyId} />
    </div>
  );
};

export default InvoiceDetails;

export async function getServerSideProps({ params, req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const invoiceData = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_INVOICE_BY_ID, {
      headers: {
        invoiceid: `${params.id}`,
        Authorization: token,
      }
    }).then((x) => x.data.result);

    return {
      props: {
        invoiceData: invoiceData
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}