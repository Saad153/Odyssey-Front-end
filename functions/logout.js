import Router from "next/router";
import Cookies from "js-cookie";
import { setTempToken } from "./setAccesLevels";

// async function logout() {
//     const token = Cookies.get('token');
//     const response = await fetch(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/authRoutes/logout`, {
//         method: 'POST',
//         headers: {
//         'Content-Type': 'application/json',
//         Authorization: token,
//         },
//     });

//     if (response.ok) {
//         Cookies.remove('token');
//         setTempToken(null, true);
//         Cookies.remove("username");
//         Cookies.remove("companyId");
//         Cookies.remove("designation");
//         Cookies.remove("loginId");
//         Router.push('/login')
//         // window.location.href = '/login';
//     } else {
//         const body = await response.json();
//         console.error('Logout failed:', body.message);   
//         alert(body.message || 'Logout failed');
//     }
// }
async function logout() {
  try {
    const token = Cookies.get('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/authRoutes/logout`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: token,
        },
    });
    if (response.ok) {
      Cookies.remove('token');
        setTempToken(null, true);
        Cookies.remove("username");
        Cookies.remove("companyId");
        Cookies.remove("designation");
        Cookies.remove("loginId");
        Router.push('/login')
    } else {
      const body = await response.json();
      alert(body.message || 'Logout failed');
    }
  } catch (err) {
    console.error('Logout request failed:', err);
    alert('Unable to reach the server. Please check your connection and try again.');
  }
}
// function logout(){
//     axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAirPorts`)
//     setTempToken(null, true);
//     Cookies.remove("username");
//     Cookies.remove("companyId");
//     Cookies.remove("designation");
//     Cookies.remove("loginId");
//     Cookies.remove("token");
//     // Cookies.remove("access");
//     Router.push('/login')
// }

export default logout