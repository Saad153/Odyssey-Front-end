import Voyage from "../../Components/Layouts/Setup/Voyage";
import axiosClient from "../../apis/axiosClient";
import Cookies from "cookies";
import { handleSSRAuthError } from "../../functions/withAuthRedirect";

const voyage = ({ sessionData, vesselsData }) => {
  return (
    <Voyage sessionData={sessionData} vesselsData={vesselsData} />
  )
}

export default voyage

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token');

  try {
    const sessionRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION, {
      headers: { "x-access-token": `${token}` }
    }).then((x) => x.data);

    const VesselRequest = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_VESSELS, {
      headers: { Authorization: token }
    }).then((x) => x.data.result);

    return {
      props: { sessionData: sessionRequest, vesselsData: VesselRequest }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      return handleSSRAuthError(error, res, cookies);
    }
    throw error;
  }
}