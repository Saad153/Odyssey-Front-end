import Cookies from "js-cookie";
import jwt_decode from 'jwt-decode';

const ALLOWED = ['ceo', 'cfo', 'admin'];

// Mirrors functions/requireDesignation.js on the backend (the actual
// enforcement). Every user can now create/edit parties; this designation check
// gates only whether a party may be given a LEDGER (a parent account) — i.e.
// whether the Non-GL checkbox can be unchecked. Kept the name to avoid a broad
// rename across every importer. Backend enforces the same in routes/clients.
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
