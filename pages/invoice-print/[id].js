import InvoicePrint from 'Components/Shared/InvoicePrint';
import { bankDetails, calculateTotal } from 'Components/Shared/invoicePrintDefaults';
import axiosClient from 'apis/axiosClient';

// Bare, unauthenticated print view for a single invoice: loaded headlessly by
// Puppeteer (see functions/pdf.js on the backend) to render the emailed PDF,
// gated by a short-lived, single-invoice print token instead of a login
// session (this page never runs inside a real user's browser session).
const InvoicePrintPage = ({ invoice, records, error }) => {
  if (error || !invoice) {
    return <div style={{ padding: 40, fontFamily: 'sans-serif' }}>This print link is invalid or has expired.</div>;
  }

  const compLogo = invoice.companyId == 1 ? "1" : "2";

  return (
    <InvoicePrint
      logo={false}
      compLogo={compLogo}
      records={records}
      bank={1}
      bankDetails={bankDetails}
      invoice={invoice}
      note={false}
      reference={false}
      calculateTotal={calculateTotal}
      systemGenerated={true}
    />
  );
};

export default InvoicePrintPage;

export async function getServerSideProps({ params, query }) {
  try {
    const result = await axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/getPrintData`, {
      headers: {
        invoiceid: `${params.id}`,
        printtoken: `${query.token || ''}`,
      }
    }).then((x) => x.data.result);

    return {
      props: {
        invoice: result.resultOne,
        records: result.resultOne?.Charge_Heads || [],
      }
    };
  } catch (error) {
    return { props: { error: true } };
  }
}
