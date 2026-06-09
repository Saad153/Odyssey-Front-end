import React from 'react';
import Summary from 'Components/Layouts/Reports/JobPL/Summary';
import axios from 'axios';

const summary = ({query, result}) => {
  return (
    <Summary query={query} result={result} />
  )
}

export default summary

export async function getServerSideProps(context) {
  const { query } = context;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/jobPnLSummary`,
      {
        params: { ...query } // ✅ correct
      }
    );

    return {
      props: {
        query,
        result: response.data ?? null // ✅ serialized
      }
    };
  } catch (error) {
    console.error("API Error:", error.message);

    return {
      props: {
        query,
        result: null, // ✅ never undefined
        error: true
      }
    };
  }
}
