import React from 'react';
import Comparative from '/Components/Layouts/Reports/JobPL/Comparative';
import axios from 'axios';

const comparative = ({query, result}) => {
  return (
    <Comparative query={query} result={result} />
  )
}

export default comparative

export async function getServerSideProps(context) {
  const { query } = context;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/jobPnLComparison`,
      {
        params: { ...query,
            from1: query.from,
            to1: query.to,
            from2: query.from2,
            to2: query.to2,
            includeFields: query.includeFields
         } // ✅ correct
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