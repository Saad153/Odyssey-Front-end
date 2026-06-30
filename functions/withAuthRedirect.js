// functions/withAuthRedirect.js
export function handleSSRAuthError(error, res, cookies) {
  if (error.response?.status === 401) {
    cookies.set('token');
    cookies.set('username');
    cookies.set('companyId');
    cookies.set('designation');
    cookies.set('loginId');

    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  throw error;
}