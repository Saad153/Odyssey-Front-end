import React from 'react';
//import Accounts from '../../Components/Layouts/Accounts';
import ChartOFAccount from '../../Components/Layouts/AccountsComp/ChartOFAccount';
import axiosClient from '../../apis/axiosClient';
import Cookies from 'cookies';
import { handleSSRAuthError } from '../../functions/withAuthRedirect';

const accounts = ({accountsData}) => {
  return (
    <div>
      <ChartOFAccount accountsData={accountsData} />
    </div>
  )
}

export default accounts

export async function getServerSideProps({req,res}){
  const cookies = new Cookies(req, res)
  try{
    const accountRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_ACCOUNTS,{
        headers:{
            "id": `${cookies.get('companyId')}`,
            "Authorization": cookies.get("token")
        }
    }).then((x)=>x.data);
  
    return{
        props: { accountsData:accountRequest }
    }
  }catch(error){
    return handleSSRAuthError(error, res, cookies);
  }
}