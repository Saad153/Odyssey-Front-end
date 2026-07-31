import Cookies from "js-cookie";
import jwt_decode from 'jwt-decode';

const ALLOWED = ['ceo', 'cfo', 'admin'];

// Mirrors functions/requireDesignation.js on the backend (the actual
// enforcement). Despite the name, this now gates the whole Parties feature
// (list, view/edit, create — same as Employees) on the frontend, not just
// creation — kept the name to avoid a broad rename across every importer.
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
