import logout from 'functions/logout';
import Cookies from "js-cookie";
import jwt_decode from 'jwt-decode';

// Returns whether the current user is an admin. Only logs out when the
// session itself is genuinely invalid (no token, or it fails to decode) -
// not having "admin" access is a normal, expected case for most users and
// must not log them out.
function checkEmployeeAccess(){
  const token = Cookies.get("token");
  if(!token || token === "undefined"){
    logout();
    return false;
  }

  let decoded;
  try {
    decoded = jwt_decode(token);
  } catch (err) {
    logout();
    return false;
  }

  const levels = decoded.access || "";
  return levels.split(",").some((x) => x.trim() === 'admin');
}

export { checkEmployeeAccess }
