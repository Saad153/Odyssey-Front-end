import React from 'react';
import Login from 'Components/Layouts/Login';
import axios from 'axios';
import Cookies from 'cookies';

const login = ({sessionData}) => {
  return (
    <div>
      <Login sessionData={sessionData} />
    </div>
  )
}

export default login

// export async function getServerSideProps({ req }) {
//   try {
//     const token = Cookies.get("token") || '';

//     const sessionRequest = await axios.get(
//       process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION,
//       {
//         headers: {
//           "x-access-token": token
//         }
//       }
//     );

//     return {
//       props: { sessionData: sessionRequest.data }
//     };

//   } catch (error) {
//     // 👇 THIS handles 401 safely
//     if (error.response?.status === 401) {
//       return {
//         props: {
//           sessionData: {
//             isLoggedIn: false
//           }
//         }
//       };
//     }

//     // Optional: log unexpected errors
//     console.error("SSR error:", error);

//     return {
//       props: {
//         sessionData: {
//           isLoggedIn: false
//         }
//       }
//     };
//   }
// }

export async function getServerSideProps({ req, res }) {
  const cookies = new Cookies(req, res);
  const token = cookies.get('token') || '';

  if (!token) {
    return {
      props: {
        sessionData: { isLoggedIn: false },
      },
    };
  }

  try {
    const sessionRequest = await axios.get(
      process.env.NEXT_PUBLIC_CLIMAX_GET_LOGIN_VERIFICATION,
      { headers: { 'x-access-token': token } }
    );

    if (sessionRequest.data?.isLoggedIn === true) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: {
        sessionData: { isLoggedIn: false },
      },
    };
  } catch (error) {
    if (error.response?.status === 401) {
      return { props: { sessionData: { isLoggedIn: false } } };
    }
    console.error("SSR error:", error);
    return { props: { sessionData: { isLoggedIn: false } } };
  }
}