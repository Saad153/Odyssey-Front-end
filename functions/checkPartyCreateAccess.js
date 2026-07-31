import Cookies from "js-cookie";
import jwt_decode from 'jwt-decode';

const ALLOWED = ['ceo', 'cfo', 'admin'];

// Mirrors functions/requireDesignation.js on the backend (the actual
// enforcement) — this is just for hiding Create buttons and blocking
// navigation to "new" party screens so unauthorized users don't reach a
// form that will 403 on submit anyway.
function hasPartyCreateDesignation(token){
  if(!token || token === "undefined"){
    return false;
  }
  try {
    const decoded = jwt_decode(token);
    return ALLOWED.includes((decoded.designation || '').toLowerCase());
  } catch (err) {
    return false;
  }
}

// Client-side convenience wrapper (reads the token from js-cookie).
function checkPartyCreateAccess(){
  return hasPartyCreateDesignation(Cookies.get("token"));
}

export { checkPartyCreateAccess, hasPartyCreateDesignation }
