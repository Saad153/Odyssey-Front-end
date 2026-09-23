import axiosClient from "./axiosClient";
import Cookies from "js-cookie";

// Built from NEXT_PUBLIC_CLIMAX_MAIN_URL rather than one env var per endpoint,
// so the feature works in both .env and .env.development without having to keep
// six more entries in step across the two files.
//
// Nothing here passes a company: AWB stock belongs to the group, so there is a
// single pool that either Sea Net or Air Cargo can draw from.
const base = () => `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/awbl`;

const employeeId = () => Cookies.get("loginId");

// Register a single number, or a generated series starting at it.
export async function registerAwbl({ airlineId, prefix, code, series, count }) {
  return axiosClient
    .post(`${base()}/register`, {
      airlineId,
      prefix,
      code,
      series,
      count,
      employeeId: employeeId(),
    })
    .then((x) => x.data);
}

// Server-side paginated / searchable list for the Setup page.
// status is 'all' | 'used' | 'unused'.
// `all: true` skips pagination and returns every matching row - used by the
// print view, where printing just the page on screen would be pointless.
export async function getAwblList({ page = 1, limit = 20, search = "", airlineId, status = "all", all = false }) {
  return axiosClient
    .get(`${base()}/list`, {
      params: {
        page,
        limit,
        search: search || undefined,
        airlineId: airlineId || undefined,
        status,
        all: all ? 1 : undefined,
      },
    })
    .then((x) => x.data);
}

// Unused numbers for an airline, plus whichever one this job already holds -
// without that the job's own number would drop out of its dropdown once saved.
export async function getAvailableAwbl({ airlineId, jobId }) {
  return axiosClient
    .get(`${base()}/available`, {
      params: {
        airlineId: airlineId || undefined,
        jobId: jobId || undefined,
      },
    })
    .then((x) => x.data);
}

// Attach a number to a job, releasing whatever that job held before.
// Passing awblId as null/'' just releases.
export async function assignAwbl({ awblId, jobId }) {
  return axiosClient
    .post(`${base()}/assign`, { awblId, jobId, employeeId: employeeId() })
    .then((x) => x.data);
}

export async function releaseAwbl({ awblId, jobId }) {
  return axiosClient
    .post(`${base()}/release`, { awblId, jobId, employeeId: employeeId() })
    .then((x) => x.data);
}

export async function deleteAwbl({ id }) {
  return axiosClient
    .post(`${base()}/delete`, { id, employeeId: employeeId() })
    .then((x) => x.data);
}
