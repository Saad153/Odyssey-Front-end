import axiosClient from "./axiosClient";
import Cookies from "js-cookie";

// Some legacy records already have the code baked into the name
// (e.g. "Andorra la Vella (ADALV)"), others don't (e.g. "New York" / "NYC").
// Always guarantee a "Name (CODE)" label so the code is reliably visible.
function withCode(name, code) {
  const suffix = `(${code})`;
  return name && name.trim().endsWith(suffix) ? name : `${name} ${suffix}`;
}

// ----- Ports (Port of Loading / Port of Discharge / Final Destination for sea jobs) -----

export function formatPortOption(p) {
  return { id: p.portId, name: withCode(p.portName, p.portId), code: p.portId };
}

export async function getAllPorts() {
  const { data } = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_VIEW_PORT);
  return (data?.result || []).map(formatPortOption);
}

// ----- Type-ahead sources for the job screen -----
//
// getAllPorts / getAllDestinations return every row: 157,879 ports (~12.6 MB)
// and 140,848 destinations (~5.9 MB). The job screen used to fetch both on
// every open, which is what made those pickers slow. These fetch only what the
// user is actually looking at.
//
// Built from MAIN_URL rather than new .env entries, so nothing has to be kept
// in step across .env and .env.development.
const portsBase = () => `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/ports`;
const destinationsBase = () => `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/destinations`;

export async function searchPorts(search) {
  const { data } = await axiosClient.get(`${portsBase()}/search`, { params: { search } });
  return (data?.result || []).map(formatPortOption);
}

// Labels the port a saved job already holds - its code is stored, not its name.
export async function resolvePort(portId) {
  if (!portId) return null;
  const { data } = await axiosClient.get(`${portsBase()}/search`, { params: { id: portId } });
  const row = (data?.result || [])[0];
  return row ? formatPortOption(row) : null;
}

export async function searchDestinations(search) {
  const { data } = await axiosClient.get(`${destinationsBase()}/search`, { params: { search } });
  return (data?.result || []).map(formatDestinationOption);
}

export async function resolveDestination(name) {
  if (!name) return null;
  const { data } = await axiosClient.get(`${destinationsBase()}/search`, { params: { id: name } });
  const row = (data?.result || [])[0];
  return row ? formatDestinationOption(row) : null;
}

export async function getPorts({ page = 1, limit = 50, search = "" } = {}) {
  const { data } = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_PORTS, {
    params: { page, limit, search },
  });
  return data;
}

export function createPort(data) {
  return axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_CREATE_PORT, {
    ...data,
    employeeId: Cookies.get("loginId"),
  }).then((x) => x.data);
}

export function updatePort(data) {
  return axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_UPDATE_PORT, {
    data,
    employeeId: Cookies.get("loginId"),
  }).then((x) => x.data);
}

export function deletePort(id) {
  return axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_DELETE_PORT, {
    id,
    employeeId: Cookies.get("loginId"),
  }).then((x) => x.data);
}

// ----- Destinations (Final Destination for air jobs) -----

export function formatDestinationOption(d) {
  return { id: d.name, name: d.name };
}

export async function getAllDestinations() {
  const { data } = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_VIEW_DESTINATIONS);
  return (data?.result || []).map(formatDestinationOption);
}

export async function getDestinations({ page = 1, limit = 50, search = "" } = {}) {
  const { data } = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_DESTINATIONS, {
    params: { page, limit, search },
  });
  return data;
}

export function createDestination(data) {
  return axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_CREATE_DESTINATION, {
    ...data,
    employeeId: Cookies.get("loginId"),
  }).then((x) => x.data);
}

export function updateDestination(data) {
  return axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_UPDATE_DESTINATION, {
    data,
    employeeId: Cookies.get("loginId"),
  }).then((x) => x.data);
}

export function deleteDestination(id) {
  return axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_DELETE_DESTINATION, {
    id,
    employeeId: Cookies.get("loginId"),
  }).then((x) => x.data);
}

// ----- Airports (Port of Loading / Port of Discharge for air jobs) -----

export function formatAirportOption(a) {
  return { id: a.airportCode, name: withCode(a.airportName, a.airportCode), code: a.airportCode };
}

export async function getAllAirports() {
  const { data } = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_VIEW_AIRPORTS);
  return (data?.result || []).map(formatAirportOption);
}

export async function getAirports({ page = 1, limit = 50, search = "" } = {}) {
  const { data } = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_AIRPORTS, {
    params: { page, limit, search },
  });
  return data;
}

export function createAirport(data) {
  return axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_CREATE_AIRPORT, {
    ...data,
    employeeId: Cookies.get("loginId"),
  }).then((x) => x.data);
}

export function updateAirport(data) {
  return axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_UPDATE_AIRPORT, {
    data,
    employeeId: Cookies.get("loginId"),
  }).then((x) => x.data);
}

export function deleteAirport(id) {
  return axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_DELETE_AIRPORT, {
    id,
    employeeId: Cookies.get("loginId"),
  }).then((x) => x.data);
}
