import axiosClient from "./axiosClient";
import Cookies from "js-cookie";

const base = () => `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/clientRoutes`;

// What currently points at a party: jobs/BLs/AWB stock that can be repointed,
// plus any invoices, vouchers or transactions that block the replacement, plus
// the list of invoices still carrying a balance.
export async function getMergeImpact(id) {
  return axiosClient
    .get(`${base()}/mergeImpact`, { params: { id } })
    .then((x) => x.data);
}

// Repoints every operational reference from one party to another, and removes
// the old party unless deleteAfter is false. Refused server-side if the party
// has accounting records.
export async function mergeParty({ fromId, toId, deleteAfter = true }) {
  return axiosClient
    .post(`${base()}/mergeParty`, {
      fromId, toId, deleteAfter,
      employeeId: Cookies.get("loginId"),
    })
    .then((x) => x.data);
}
