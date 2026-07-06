import CSVReader from "react-csv-reader";
import axiosClient from 'apis/axiosClient';
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { loopHooks } from "react-table";
import { Spin } from 'antd';

const Upload_CoA = () => {

    const [ status, setStatus ] = useState("Idle")

    const backup = async () => {
        {/* <button onClick={()=>{importCOA()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>1. Import COA from Climax DB</button> */}
        {/* <button onClick={()=>{getCOATree()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>2. Console COA from Odyssey DB</button> */}
        {/* <button onClick={()=>{importCharges()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>3. Import Charges from Climax DB</button> */}
        {/* <button onClick={()=>{importVouchers()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>4. Import Vouchers from Climax DB</button> */}
        {/* <button onClick={()=>{importParties()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>5. Import Parties from Climax DB</button> */}
        {/* <button onClick={()=>{importJobs()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>6. Import Jobs from Climax DB</button> */}
        {/* <button onClick={()=>{importAirPorts()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>7. Import Airports from Climax DB</button> */}
        {/* <button onClick={()=>{importEmployees()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>8. Import Employees from Climax DB</button> */}
        {/* <button onClick={()=>{importCommodities()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>9. Import Commodities from Climax DB</button> */}
        {/* <button onClick={()=>{importBls()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>10. Import BLs from Climax DB</button> */}
        {/* <button onClick={()=>{importAECharges()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>11. Import AE Charges from Climax DB</button> */}
        // await importCommodities();
        // await importVoyages();
        // await importCOA();
        // await importCharges();
        // await importParties();
        // await importJobs();
        // await importLGJobs();
        // await importVouchers();
        // await FixAirJobs();
        // await FixSeaJobs();
        // await checkInvoices()
        // await importAirPorts()
        // await importEmployees()
        // await importAECharges()
        // await fixSalesRep()
        setStatus("Success")
    }

    const [invoicesData, setInvoices] = useState([]);
    const [C, setClients] = useState(false);
    const [V, setVendors] = useState(false);
    const [CV, setCV] = useState(false);
    const [GL, setNonGl] = useState(false);

    const fixSalesRep = async () => {
        try{
            const result = await axiosClient.get("http://localhost:8081/jobs/getSalesRep");
            console.log("Sales Rep Data:", result.data.result);
            const response = await axiosClient.post("http://localhost:8084/seaJob/fixSalesRep", result.data.result);
            console.log("Sales Rep Fixed:", response);

        }catch(e){
            console.error("Error fixing sales rep:", e)
        }
    }

    const importLGJobs = async () => {
        try{
            const c = await axiosClient.get("http://localhost:8084/clientRoutes/getClientsForBackup");
            console.log("Clients", c)
            const com = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_CREATE_COMMODITY);
            console.log("Commodities", com)
            const result = await axiosClient.get("http://localhost:8081/jobs/getLOGJOB");
            console.log("Log Jobs", result.data.result)
            const Clients = c.data.result
            const ClientsMap = new Map(
                Clients.map(c => [c.climaxId, c.id])
            )
            const Commodites = com.data.result
            const CommoditiesMap = new Map(
                Commodites.map(c => [c.climaxId, c.id])
            )
            const UNLocation = result.data.result.UNLocation
            const UNLocMap = new Map(
                UNLocation.map(b => [b.UNLocCode, b.UNLocName])
            )
            const UNPacking = result.data.result.Packing
            const PackingMap = new Map(
                UNPacking.map(b => [b.PackCode, b.PackName])
            )
            const Gen_IncoTerms = result.data.result.IncoTerms
            const IncoMap = new Map(
                Gen_IncoTerms.map(b => [b.Id, b.IncoName])
            )
            const jobs = []
            result.data.result.Job.forEach((j) => {
                jobs.push({
                    jobNo: j.JobNumber,
                    jobId: j.JobNumber.split("-")[1].split("/")[0],
                    title: null,
                    customerRef: null,
                    fileNo: j.CustomFileNo,
                    shipStatus: null,
                    teu: null,
                    bkg: null,
                    pcs: j.NoOfPackages,
                    vol: j.Volume,
                    volWeight: j.GrossWeight,
                    pol: UNLocMap.get(j.POLCode),
                    pod: UNLocMap.get(j.PODCode),
                    fd: UNLocMap.get(j.POFDCode),
                    dg: null,
                    subType: j.ContianerTypeId == 5 ? 'FCL' : j.ContianerTypeId == 4 ? 'LCL': 'None',
                    billVol: 0,
                    shpVol: 0,
                    weight: j.GrossWeight,
                    weightUnit: null,
                    costCenter: 'Khi',
                    jobType: j.JobTypeId == 1 ? 'Clearing Only' : j.JobTypeId == 2 ? 'Transport' : 'Clearing + Tpt',
                    jobKind: j.ContianerTypeId == 5 ? 'FCL' : j.ContianerTypeId == 4 ? 'LCL': 'None',
                    container: null, 
                    carrier: null,
                    freightType: 'Prepaid',
                    nomination: 'Free Hand',
                    transportCheck: j.TransporterId? "Transport": '',
                    customCheck: j.ShippingAgentId? 'Shipping': '',
                    etd: null,
                    eta: null,
                    cbkg: null,
                    aesDate: null,
                    aesTime: null,
                    eRcDate: null,
                    eRcTime: null,
                    eRIDate: null,
                    eRITime: null,
                    jobDate: j.JobDate,
                    shipDate: null,
                    doorMove: null,
                    cutOffDate: null,
                    cutOffTime: null,
                    siCutOffDate: null,
                    siCutOffTime: null,
                    vgmCutOffDate: null,
                    vgmCuttOffTime: null,
                    freightPaybleAt: null,
                    terminal: null,
                    delivery: null,
                    companyId: 2,
                    pkgUnit: PackingMap.get(j.PackagesCode),
                    incoTerms: IncoMap.get(j.IncoTermsId),
                    exRate: 0,
                    approved: j.ApprovedStatusId == 2 ? 'true' : 'false',
                    canceled: null,
                    climaxid: j.Id,
                    flightNo: null,
                    cwtLine: null,
                    cwtClient: null,
                    operation: j.OperationTypeId == 4 ? 'SE' : j.OperationTypeId == 2 ? 'AE' : j.OperationTypeId == 1 ? 'AI' : 'SI',
                    arrivalDate: null,
                    arrivalTime: null,
                    departureDate: null,
                    departureTime: null,
                    ClientId: ClientsMap.get(j.CustomerId),
                    VoyageId: null,
                    saleRepresentatorId: "4d7f7cfb-7ace-4655-b6ee-f9ed52f81799" ,
                    overseasAgentId: ClientsMap.get(j.OverSeasAgentId),
                    shippingLineId: ClientsMap.get(j.ShippingLineId),
                    LocalVendorId: ClientsMap.get(j.ShippingAgentId),
                    customAgentId: ClientsMap.get(j.ClearingAgentId),
                    transporterId: ClientsMap.get(j.TransporterId),
                    createdById: "4d7f7cfb-7ace-4655-b6ee-f9ed52f81799",
                    commodityId: CommoditiesMap.get(j.commodityId),
                    consigneeId: ClientsMap.get(j.ConsigneeId),
                    forwarderId: ClientsMap.get(j.ForwarderId),
                    airLineId: ClientsMap.get(j.AirLineId),
                    shipperId: ClientsMap.get(j.ShipperId),
                    vesselId: null,
                    por: null,

                })
            })
            console.log(jobs)
            const res = await axiosClient.post("http://localhost:8084/seaJob/uploadLogJobs", jobs)
        }catch(e){
            console.error(e)
        }
    }

    const FixAirJobs = async () => {
        try{
            console.log("Getting Air Jobs Data for Fix")
            const result = await axiosClient.get("http://localhost:8081/jobs/fixJobs");
            console.log("Fix Jobs Result:", result.data.result)
            const { BL, ...rest } = result.data.result
            await axiosClient.post("http://localhost:8084/seaJob/fixAirJobs", rest)
            // await axiosClient.post("http://localhost:8084/seaJob/fixAEBL", BL)
        }catch(e){
            console.error(e)
        }
    }

    const FixSeaJobs = async () => {
        try{
            console.log("Getting Sea Jobs Data for Fix")
            const result = await axiosClient.get("http://localhost:8081/jobs/fixSeaJobs");
            console.log("Fix Jobs Result:", result.data.result)
            // const { BL, ...rest } = result.data.result
            await axiosClient.post("http://localhost:8084/seaJob/fixSeaJobs", result.data.result)
            // await axiosClient.post("http://localhost:8084/seaJob/fixAEBL", BL)
        }catch(e){
            console.error(e)
        }
    }

    const checkInvoices = async () => {
        console.log("Getting Invoices")
        const { data } = await axiosClient.post("http://localhost:8081/voucher/getAllInvoices");
        console.log(data.Invoices)
        const result = await axiosClient.get("http://localhost:8084/invoice/invoiceMatching");
        console.log(result.data.result)

        const createMap = (arr, key) => new Map(arr.map(item => [item[key], item]));

        const map = createMap(result.data.result, 'invoice_No');
        
        const invoices = []

        data.Invoices.forEach(element => {
            if(!map.has(element.InvoiceNumber)){
                // console.log(element.invoice_No)
                invoices.push(element.InvoiceNumber)
            }
        });

        console.log(invoices)
        
    }

    useEffect(() => {
        if(C && V){
            setCV(true)
        }
        //console.log(C)
        //console.log(V)
        //console.log(GL)
        //console.log(partiesAccounts)
    }, [C, V, GL])
    
    const parserOptions = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: header => header.toLowerCase().replace(/\W/g, '_')
      }

    function extractCode(str) {
        if(str){
            // console.log(str)
            const match = str.toString().match(/^[A-Z]+-([A-Z]{2})-\d{2,4}\/\d+$/);
            return match ? match[1] : null;
        }else{
            return null
        }
        // console.log("Match:", match)
    }

    function removeBracketedPart(str) {
        return str.replace(/\s*\([^()]*\)\s*$/, '').trim();
    }

    function parseDateString(dateStr) {
        //console.log(dateStr)
        if(dateStr && dateStr.includes("-")){
            const [day, monthName, year] = dateStr.split('-');
            let year1 = "20"+year
            return new Date(year1, parseInt(monthName)-1, day);
        }else if(dateStr && dateStr.includes("/")){
            const [day, monthName, year] = dateStr.split('/');
            let year1 = "20"+year
            return new Date(year1, parseInt(monthName)-1, day);
        }
      }

      function parseDateString1(dateStr) {
        //console.log(dateStr)
        if(dateStr && dateStr.includes("-")){
            const [day, monthName, year] = dateStr.split('-');

            return new Date(year, parseInt(monthName)-1, day);
        }else if(dateStr && dateStr.includes("/")){
            const [day, monthName, year] = dateStr.split('/');
            return new Date(year, parseInt(monthName)-1, day);
        }
      }

      function parseDateString3(dateStr) {
        // Helper map for month names to numbers
        const monthMap = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
        };
    
        if (dateStr && dateStr.includes("-")) {
            const [day, monthName, year] = dateStr.split('-');
            return new Date(
                parseInt(year.length === 2 ? `20${year}` : year), // Handle 2-digit year
                monthMap[monthName],
                parseInt(day)
            );
        }
        return null; // Return null for invalid or empty date strings
    }

      function parseDateString2(dateStr) {
        if (dateStr && dateStr.includes("-")) {
            let [day, monthName, year] = dateStr.split('-');
            // year = year.length == 2 ? (parseInt(year) < 50 ? '20' + year : '19' + year) : year; // Handles two-digit years
            year.length<=2?year="20"+year:null
            // year = "20"+year
            // console.log(year, parseInt(monthName) - 1, parseInt(day));
            return new Date(parseInt(year), parseInt(monthName) - 1, parseInt(day)+1);
        } else if (dateStr && dateStr.includes("/")) {
            let [day, monthName, year] = dateStr.split('/');
            // year = year.length == 2 ? (parseInt(year) < 50 ? '20' + year : '19' + year) : year; // Handles two-digit years
            year.length<=2?year="20"+year:null
            // console.log(year, parseInt(monthName) - 1, parseInt(day));
            return new Date(parseInt(year), parseInt(monthName) - 1, parseInt(day)+1);
        }
    }
    

      function removeCommas(str) {
        typeof str == 'string'?str = str.replace(/,/g, ''):str = str.toString().replace(/,/g, '')
        return str;
    }
    const [voucherList, setVoucherList] = useState([]);

    const importCharges = async () => {
        try{
            setStatus("Fetching Charges")
            const charges = await axiosClient.post("http://localhost:8081/charges/getAll")
            console.log(charges)
            let tempCharges = []
            charges.data.forEach((x) => {
                let temp = {
                    // id: x.Id,
                    code: x.Id,
                    currency: x.GL_Currencies.CurrencyCode,
                    name: x.ChargesName,
                    short: x.ShortName,
                    calculationType: x.PerUnitFixedId==1?"Per Unit":"Per Shipment",
                    defaultPaybleParty: "Local-Agent",
                    defaultRecivableParty: "Client",
                    taxApply: x.IsTaxable?"Yes":"No",
                    taxPerc: "0",
                    fixAmount: 0,
                    climaxId: x.Id
                }
                tempCharges.push(temp)
            })
            console.log(tempCharges)
            const result = await axiosClient.post("http://localhost:8084/charges/bulkCreate", tempCharges)
            setStatus("Charges Imported")
            console.log(result)
        }catch(err){
            console.error(err)
        }
    
    }
    const importCOA = async () => {
        try{
            setStatus("Fetching COA")
            console.log("Importing Accounts")
            const companyId = Cookies.get("companyId")
            const coa = await axiosClient.post("http://localhost:8081/accounts/getAll")
            console.log("COA Data:", coa.data)
            // const Data = coa.data

            // Data.forEach((data)=>{

            // })
            
            const result = await axiosClient.post("http://localhost:8084/accounts/importAccount", coa.data.temp)
            setStatus("COA Imported")
            console.log(result.status)
        }catch(err){
            console.error(err)
        }
    }
    const getCOATree = async () => {
        try{
            // const coa = await axiosClient.post("http://localhost:8081/accounts/getAll")
            // console.log(coa.data)
            const result = await axiosClient.get("http://localhost:8084/coa/getCOATree")
            console.log(result.data)
        }catch(err){
            console.error(err)
        }
    }

const importParties = async () => {
    try{
        setStatus("Fetching Parties")
        console.log("Importing Parties")
        const { data } = await axiosClient.get("http://localhost:8081/parties/get")
        console.log("Parties Data:", data)

        const createMap = (arr, key) => new Map(arr.map(item => [item[key], item]));

        const lookupMaps = {
            Parties: createMap(data.Parties, "Id"),
            UNLocation: createMap(data.UNLocation, "UNLocCode"),
            Employee: createMap(data.Employee, "Id"),
            Currencies: createMap(data.Currencies, "Id"),
            COA: createMap(data.COA, "Id"),
        };

        const parties = data.Parties.map(x => ({
            ...x,
            ParentParty: lookupMaps.Parties.get(x.ParentPartyId),
            Country: lookupMaps.UNLocation.get(x.CountryCode),
            City: lookupMaps.UNLocation.get(x.CityCode),
            SalesPerson: lookupMaps.Employee.get(x.SalesPersonId),
            AccountsRep: lookupMaps.Employee.get(x.AccountsRepId),
            DocsRep: lookupMaps.Employee.get(x.DocsRepId),
            Currency: lookupMaps.Currencies.get(x.CurrencyId),
            ParentAccount: lookupMaps.COA.get(x.ParentAccountId),
            ContraAccount: lookupMaps.COA.get(x.ContraAccountId),
            Account: lookupMaps.COA.get(x.AccountId),
        }));

        console.log("Sorted Data", parties)

        const result = await axiosClient.post("http://localhost:8084/clientRoutes/bulkCreate", parties)
        setStatus("Parties Imported")
        console.log(result.data.status)
    }catch(err){
        console.error(err)
    }
}

let usedVouchers = [];
let usedVIdSet = new Set();

const filterVoucherData = (map, filter) => {
  const temp = map.get(filter);

  if (temp && !usedIdSet.has(temp.Id)) {
    usedVIdSet.add(temp.Id);
    usedVouchers.push(temp);
  }

  return temp;
};

const importVouchers = async () => {
    try{
        console.log("Starting Vouchers Data Fetch...")

        //Fetch data from Climax DB API
        const { data } = await axiosClient.post("http://localhost:8081/voucher/getAll");
        console.log("Data Fetched Successfully", data)

        //Function to create lookup Maps
        const createMap = (arr, key) => new Map(arr.map(item => [item[key], item]));

        const createGroupedMap = (arr, key) => {
            const map = new Map();
            arr.forEach(item => {
                if (!map.has(item[key])) {
                map.set(item[key], []);
                }
                map.get(item[key]).push(item);
            });
            return map;
        };

        //Creating lookup Maps for data in COA
        let lookupMaps = {
            GL_COA: createMap(data.COA, "Id"),
            GL_COASubCategory: createMap(data.COASubCategory, "Id"),
            Gen_BankSubType: createMap(data.BankSubType, "Id"),
            Gen_SubCompanies: createMap(data.SubCompanies, "Id"),
            GL_InvTaxType: createMap(data.InvTaxType, "Id"),
            GL_PropertiesLOV: createMap(data.PropertiesLOV, "Id"),
            GL_Currencies: createMap(data.Currencies, "Id"),
            Gen_TaxInvNature: createMap(data.TaxInvNature, "Id"),
            GL_Requisition: createMap(data.Requisition, "Id"),
            GL_ChequeType: createMap(data.ChequeType, "Id"),
            Gen_TaxFilerStatus: createMap(data.TaxFilerStatus, "Id"),
            GL_VoucherType: createMap(data.VoucherType, "Id"),
            GL_VoucherFormType: createMap(data.VoucherFormType, "Id"),
            GL_InvMode: createMap(data.InvMode, "Id"),
            GL_JobInvoice: createMap(data.JobInvoice, "GLInvoiceId"),
            GL_JobBill: createMap(data.JobBill, "GLInvoiceId"),
        }

        const COA = data.COA.map((a) => ({
            ...a,
            GL_COA: lookupMaps.GL_COA.get(a.ParentAccountId),
            GL_COASubCategory: lookupMaps.GL_COASubCategory.get(a.SubCategoryId)
        }))

        lookupMaps.GL_COA = createMap(COA, "Id")

        const Parties = data.Parties.map((p) => ({
            ...p,
            GL_COA: lookupMaps.GL_COA.get(p.AccountId),
        }))

        lookupMaps.Gen_Parties = createMap(Parties, "Id")

        const Voucher_Heads = data.Voucher_Detail.map((vh) => ({
            ...vh,
            GL_COA: lookupMaps.GL_COA.get(vh.COAAccountId),
            GL_Currencies: lookupMaps.GL_Currencies.get(vh.CurrencyIdVD),
            GL_PropertiesLOV: lookupMaps.GL_PropertiesLOV.get(vh.CostCenterId),
            Gen_BankSubType: lookupMaps.Gen_BankSubType.get(vh.BankSubTypeId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(vh.SubCompanyId),
            GL_InvTaxType: lookupMaps.GL_InvTaxType.get(vh.TaxTypeId),
        }))

        lookupMaps.GL_Voucher_Detail = createMap(Voucher_Heads, "Id")
        lookupMaps.GL_Voucher_Details = createGroupedMap(Voucher_Heads, "VoucherId")

        let Vouchers = data.Voucher.map((v) => ({
            ...v,
            Gen_TaxInvNature: lookupMaps.Gen_TaxInvNature.get(v.TaxNatureId),
            GL_Currencies: lookupMaps.GL_Currencies.get(v.CurrencyId),
            GL_Requisition: lookupMaps.GL_Requisition.get(v.ReqId),
            GL_ChequeType: lookupMaps.GL_ChequeType.get(v.ChequeTypeId),
            Gen_TaxFilerStatus: lookupMaps.Gen_TaxFilerStatus.get(v.FilerStatusId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(v.SubCompanyId),
            GL_VoucherType: lookupMaps.GL_VoucherType.get(v.VoucherTypeId),
            GL_VoucherFormType: lookupMaps.GL_VoucherFormType.get(v.VoucherFormId),
            GL_Voucher_Detail: lookupMaps.GL_Voucher_Details.get(v.Id),
        }))

        lookupMaps.GL_Voucher = createMap(Vouchers, "Id")

        const Invoices = data.Invoices.map((i) => ({
            ...i,
            GL_Voucher: filterVoucherData(lookupMaps.GL_Voucher, lookupMaps.GL_Voucher_Detail.get(i.GVDetailId).VoucherId),
            GL_Currencies: lookupMaps.GL_Currencies.get(i.CurrencyId),
            GL_InvMode: lookupMaps.GL_InvMode.get(i.InvoiceTypeId),
            GL_JobInvoice: lookupMaps.GL_JobInvoice.get(i.Id),
            GL_JobBill: lookupMaps.GL_JobBill.get(i.Id),
            Gen_Parties: lookupMaps.Gen_Parties.get(i.PartyId),
        }))

        lookupMaps.GL_Invoices = createMap(Invoices, "Id")

        const InvAdjustments = data.InvAdjustments.map((ia) => ({
            ...ia,
            // GL_Invoices: lookupMaps.GL_Invoices.get(ia.InvoiceId)
            GL_Invoices: filterData(lookupMaps.GL_Invoices, ia.InvoiceId)
        }))



        lookupMaps.GL_InvAdjustments = createGroupedMap(InvAdjustments, "GVDetailId")

        Vouchers = Vouchers.map(v => ({
            ...v,
            GL_InvAdjustments: v.GL_Voucher_Detail.flatMap(vh => 
                lookupMaps.GL_InvAdjustments.get(vh.Id) || []
            )
        }));
        
        let linkedVouchers = Vouchers.filter(v => v.GL_InvAdjustments.length > 0);
        let tempVouchers = Vouchers.filter(v => usedVIdSet.has(v.Id));
        let unlinkedVouchers = Vouchers.filter(v => v.GL_InvAdjustments.length == 0);
        
        console.log("Vouchers 4:", Vouchers)
        console.log("Used Vouchers 4:", usedVouchers)
        console.log("linkedVouchers 5:", linkedVouchers)
        console.log("unlinkedVouchers 6:", unlinkedVouchers)

        const chunkArray = (array, chunkSize) => {
            const chunks = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }
            return chunks;
        };

        const sendBatches = async (items, url, batchSize = 100, maxRetries = 3) => {
            const batches = chunkArray(items, batchSize);
            for (let i = 0; i < batches.length; i++) {
                let retries = 0, success = false;
                while (!success && retries < maxRetries) {
                    try {
                        console.log(`🚀 Sending batch ${i + 1}/${batches.length} (${batches[i].length} items)`);
                        // console.log(batches[i])
                        const response = await axiosClient.post(url, { records: batches[i] });
                        // console.log(`✅ Batch ${i + 1} OK:`, response.data);
                        success = true;
                    } catch (error) {
                        retries++;
                        console.error(`❌ Batch ${i + 1} failed (${retries}/${maxRetries}): ${error.message}`);
                        if (retries >= maxRetries) {
                            console.error(`🚨 Skipping batch ${i + 1}`);
                        } else {
                            console.log(`🔄 Retrying batch ${i + 1}...`);
                        }
                    }
                }
            }
            console.log("🎉 All batches processed for", url);
        };

        await sendBatches(linkedVouchers, "http://localhost:8084/voucher/importVouchers", 100);
        await sendBatches(Vouchers, "http://localhost:8084/voucher/importV", 100);

        lookupMaps.Vouchers = createMap(data.Voucher, "Id");
        const tempVoucher_Heads = Voucher_Heads.map(vh => ({
            ...vh,
            GL_Voucher: lookupMaps.Vouchers.get(vh.VoucherId),
        }));
        const res = await axiosClient.post("http://localhost:8084/voucher/deleteVoucherHeads", {})
        // console.log("Deleted Existing Voucher Heads:", res.data);
        await sendBatches(tempVoucher_Heads, "http://localhost:8084/voucher/importVoucherHeads", 50);
        // await sendBatches(data.Voucher_Detail, "http://localhost:8084/voucher/checkVoucherHeads", 1000);
        

    }catch(e){
        console.error(e)
    }
}

const BATCH_SIZE = 100;

const importAirPorts = async () => {
    try {
        const { data } = await axiosClient.get("http://localhost:8081/jobs/getAirports");
        console.log("AirPort Data:", data);

        const airports = data.Airports || [];
        const unLocations = data.UNLocation || [];

        // Function to split array into chunks
        const chunkArray = (array, size) =>
            Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
                array.slice(i * size, i * size + size)
            );

        const airportBatches = chunkArray(airports, BATCH_SIZE);
        const unLocationBatches = chunkArray(unLocations, BATCH_SIZE);

        // Upload each batch sequentially (or you can do Promise.all for parallel)
        for (const batch of airportBatches) {
            await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAirPorts`, {
                Airports: batch,
                UNLocation: [],
            });
        }

        for (const batch of unLocationBatches) {
            await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAirPorts`, {
                Airports: [],
                UNLocation: batch,
            });
        }

        console.log("All batches uploaded successfully");
    } catch (e) {
        console.error("Batch upload error:", e);
    }
};

const importEmployees = async () => {
    try {
        const { data } = await axiosClient.get("http://localhost:8081/jobs/getEmployees");
        console.log("Employee Data:", data);

        await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/employeeRoutes/uploadEmployees`, data);

        console.log("Employees uploaded successfully");
    }catch(e){
        console.log(e)
    }
}

const importCommodities = async () => {
    try {
        setStatus("Fetching Commodities")
        const { data } = await axiosClient.get("http://localhost:8081/jobs/getCommodities");
        console.log("Commodity Data:", data);

        await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/commodity/uploadCommodities`, data);
        setStatus("Commodities Imported")
        console.log("Comodities uploaded successfully");
    }catch(e){
        console.log(e)
    }
}

const importVoyages = async () => {
    try {
        setStatus("Fetching Vessels & Voyages")
        const { data } = await axiosClient.get("http://localhost:8081/jobs/getVoyages");
        console.log("Voyage Data:", data);
        let Vessels = []
        data.Vessel.forEach((Ve) => {
            let voyages = []

            data.Voyage.forEach((Vo) => {
                if(Vo.VesselId == Ve.Id){
                    voyages.push(Vo)
                }
            })

            let temp = {
                ...Ve,
                voyages
            }

            Vessels.push(temp)
        })

        console.log("Updated Vessels", Vessels)

        const result = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/vessel/uploadVoyages`, Vessels);
        setStatus("Vessels & Voyages Imported")
        console.log("Vessels uploaded successfully", result);
    }catch(e){
        console.log(e)
    }
}

const importBls = async () => {
    try {
        const { data } = await axiosClient.get("http://localhost:8081/jobs/getBLs");
        console.log("BL Data:", data);

        await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/uploadBLs`, data);

        console.log("BLs uploaded successfully");
    }catch(e){
        console.log(e)
    }
}

const importAECharges = async () => {
    try {
        const { data } = await axiosClient.get("http://localhost:8081/jobs/getAECharges");
        console.log("AE Charges Data:", data);
        
        const result = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/charges/uploadChargeHeads`, data);
        console.log("Charges uploaded successfully", result);

    }catch(e){
        console.log(e)
    }
}

let usedInvoices = [];
let usedIdSet = new Set();

const filterData = (map, filter) => {
  const temp = map.get(filter);

  if (temp && !usedIdSet.has(temp.Id)) {
    usedIdSet.add(temp.Id);
    usedInvoices.push(temp);
  }

  return temp;
};

const importJobs = async () => {
    try{
        console.log("Fetching Air Jobs data")
        const result0 = await axiosClient.get("http://localhost:8081/jobs/getAll0");
        const result = await axiosClient.get("http://localhost:8081/jobs/getAll");
        const result1 = await axiosClient.get("http://localhost:8081/jobs/getAll1");
        console.log(result0)
        console.log(result)
        console.log(result1)
        const data = {
            ...result0.data,
            ...result.data,
            ...result1.data
        }
        console.log("Air Job Data:", data)

        const createMap = (arr, key) => new Map(arr.map(item => [item[key], item]));

        const createGroupedMap = (arr, key) => {
            const map = new Map();
            arr.forEach(item => {
                if (!map.has(item[key])) {
                map.set(item[key], []);
                }
                map.get(item[key]).push(item);
            });
            return map;
        };

        const lookupMaps = {
            Gen_UNLocation: createMap(data.UNLocation, "UNLocCode"),
            Gen_UNAirport: createMap(data.UNAirport, "Id"),
            UNPacking: createMap(data.Packing, "PackCode"),
            Gen_Vessel: createMap(data.Vessel, "Id"),
            Gen_Commodity: createMap(data.Commodity, "Id"),
            // Gen_DocumentType: createMap(data.DocumentType, "Id"),
            GL_PropertiesLOV: createMap(data.PropertiesLOV, "Id"),
            Gen_Parties_Locations: createMap(data.Parties_Locations, "Id"),
            Gen_IncoTerms: createMap(data.IncoTerms, "Id"),
            TAP_Employee: createMap(data.Employee, "Id"),
            Gen_Parties: createMap(data.Parties, "Id"),
            GL_Voucher: createMap(data.Voucher, "Id"),
            Gen_CargoTypeFile: createMap(data.CargoTypeFile, "Id"),
            Gen_DeliveryType: createMap(data.DeliveryType, "Id"),
            GL_Currencies: createMap(data.Currencies, "Id"),
            GL_COA: createMap(data.COA, "Id"),
            AExp_AirExportJob: createMap(data.AirExportJob, "Id"),
            AImp_AirImportJob: createMap(data.AirImportJob, "Id"),
            // Gen_JobCancelReason: createMap(data.JobCancelReason, "Id"),
            Gen_ChargesVATCategory: createMap(data.ChargesVATCategory, "Id"),
            Gen_EquipmentSizeType: createMap(data.EquipmentSizeType, "EquipCode"),
            Gen_Charges: createMap(data.Charges, "Id"),
            Gen_BLTemplate: createMap(data.BLTemplate, "Id"),
            GL_Invoices: createMap(data.Invoices, "Id"),
            AExp_BL_Dimension: createMap(data.AE_BL_Dimension, "AEBLId"),
            GL_COASubCategory: createMap(data.COASubCategory, "Id"),
            Gen_SubCompanies: createMap(data.SubCompanies, "Id"),
            GL_VoucherType: createMap(data.VoucherType, "Id"),
            GL_InvMode: createMap(data.InvMode, "Id"),
        };

        const COA = data.COA.map((a) => ({
            ...a,
            GL_COA: lookupMaps.GL_COA.get(a.ParentAccountId),
            GL_COASubCategory: lookupMaps.GL_COASubCategory.get(a.SubCategoryId)
        }))

        lookupMaps.GL_COA = createMap(COA, "Id")

        const tempVoucher_Heads = data.Voucher_Detail.map((vh) => ({
            ...vh,
            GL_COA: lookupMaps.GL_COA.get(vh.COAAccountId),
            GL_Currencies: lookupMaps.GL_Currencies.get(vh.CurrencyIdVD),
            GL_PropertiesLOV: lookupMaps.GL_PropertiesLOV.get(vh.CostCenterId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(vh.SubCompanyId),
        }));

        lookupMaps.GL_Voucher_Detail = createMap(tempVoucher_Heads, "Id")
        lookupMaps.GL_Voucher_Details = createGroupedMap(tempVoucher_Heads, "VoucherId")

        let tempVouchers = data.Voucher.map((v) => ({
            ...v,
            GL_Currencies: lookupMaps.GL_Currencies.get(v.CurrencyId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(v.SubCompanyId),
            GL_VoucherType: lookupMaps.GL_VoucherType.get(v.VoucherTypeId),
            GL_Voucher_Detail: lookupMaps.GL_Voucher_Details.get(v.Id),
        }))

        lookupMaps.GL_Voucher = createMap(tempVouchers, "Id")

        const tempInvoices = data.Invoices.map((i) => ({
            ...i,
            GL_Voucher: filterVoucherData(lookupMaps.GL_Voucher, lookupMaps.GL_Voucher_Detail.get(i.GVDetailId)?.VoucherId),
            GL_Currencies: lookupMaps.GL_Currencies.get(i.CurrencyId),
            GL_InvMode: lookupMaps.GL_InvMode.get(i.InvoiceTypeId),
            Gen_Parties: lookupMaps.Gen_Parties.get(i.PartyId),
        }))

        lookupMaps.GL_Invoices = createMap(tempInvoices, "Id")

        const tempJobBill = data.JobBill.map(x => ({
            ...x,
            Invoice: filterData(lookupMaps.GL_Invoices, x.GLInvoiceId),
        }))

        lookupMaps.GL_JobBill = createMap(tempJobBill, "Id");

        const tempJobBill_Charges = data.JobBill_Charges.map(x => ({
            ...x,
            JobBill: lookupMaps.GL_JobBill.get(x.JobBillId),
        }))

        lookupMaps.SEPGL_JobBill_Charges = createMap(tempJobBill_Charges, "AEJobChargesPaybId");
        lookupMaps.SIPGL_JobBill_Charges = createMap(tempJobBill_Charges, "AIJobChargesPaybId");

        const tempJobInvoice = data.JobInvoice.map(x => ({
            ...x,
            Invoice: filterData(lookupMaps.GL_Invoices, x.GLInvoiceId),
        }))

        lookupMaps.GL_JobInvoice = createMap(tempJobInvoice, "Id");

        const tempJobInvoice_Charges = data.JobInvoice_Charges.map(x => ({
            ...x,
            JobInvoice: lookupMaps.GL_JobInvoice.get(x.JobInvoiceId),
        }))

        lookupMaps.SERGL_JobInvoice_Charges = createMap(tempJobInvoice_Charges, "AEJobChargesRecvId");
        lookupMaps.SIRGL_JobInvoice_Charges = createMap(tempJobInvoice_Charges, "AIJobChargesRecvId");

        const tempAgentInvoice = data.Agent_Invoice.map(x => ({
            ...x,
            Invoice: filterData(lookupMaps.GL_Invoices, x.GLInvoiceId),
        }))

        lookupMaps.GL_Agent_Invoice = createMap(tempAgentInvoice, "Id");

        const tempAgentInvoice_Charges = data.AgentInvoice_Charges.map(x => ({
            ...x,
            Agent_Invoice: lookupMaps.GL_Agent_Invoice.get(x.AgentInvoiceId),
        }))

        lookupMaps.SEPGL_AgentInvoice_Charges = createMap(tempAgentInvoice_Charges, "AEJobChargesPaybId");
        lookupMaps.SIPGL_AgentInvoice_Charges = createMap(tempAgentInvoice_Charges, "AIJobChargesPaybId");
        lookupMaps.SERGL_AgentInvoice_Charges = createMap(tempAgentInvoice_Charges, "AEJobChargesRecvId");
        lookupMaps.SIRGL_AgentInvoice_Charges = createMap(tempAgentInvoice_Charges, "AIJobChargesRecvId");

        const tempParties = data.Parties.map(x => ({
            ...x,
            GL_COA: lookupMaps.GL_COA.get(x.AccountId),
        }));
        
        lookupMaps.Gen_Parties = createMap(tempParties, "Id");

        const tempSEBl = data.AE_BL.map(x => ({
            ...x,
            Vessel: lookupMaps.Gen_Vessel.get(x.VesselId),
            ShipperData: lookupMaps.Gen_Parties.get(x.ShipperId),
            ConsigneeData: lookupMaps.Gen_Parties.get(x.ConsigneeId),
            NotifyParty1Data: lookupMaps.Gen_Parties.get(x.NotifyParty1Id),
            BLTemplate: lookupMaps.Gen_BLTemplate.get(x.BLTemplateId),
            NotifyParty2Data: lookupMaps.Gen_Parties.get(x.NotifyParty2Id),
            AEBL_Dimension: lookupMaps.AExp_BL_Dimension.get(x.Id),
        }));

        lookupMaps.SExp_BL = createMap(tempSEBl, "AEJobId");

        const tempSIBl = data.AI_BL.map(x => ({
            ...x,
            Vessel: lookupMaps.Gen_Vessel.get(x.VesselId),
            ShipperData: lookupMaps.Gen_Parties.get(x.ShipperId),
            ConsigneeData: lookupMaps.Gen_Parties.get(x.ConsigneeId),
            NotifyParty1Data: lookupMaps.Gen_Parties.get(x.NotifyParty1Id),
            BLTemplate: lookupMaps.Gen_BLTemplate.get(x.BLTemplateId),
            NotifyParty2Data: lookupMaps.Gen_Parties.get(x.NotifyParty2Id),
        }));

        lookupMaps.SImp_BL = createMap(tempSIBl, "AEJobId");

        const tempSEChargesPayb = data.AirExportJob_ChargesPayb.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Vendor: lookupMaps.Gen_Parties.get(x.VendorId),
            Principal: lookupMaps.Gen_Parties.get(x.PrincipalId),
            VatCategory: lookupMaps.Gen_ChargesVATCategory.get(x.VatCategoryId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SEPGL_AgentInvoice_Charges.get(x.Id),
            GL_JobBill_Charges: lookupMaps.SEPGL_JobBill_Charges.get(x.Id),
        }));

        lookupMaps.SExp_SeaExportJob_ChargesPayb = createGroupedMap(tempSEChargesPayb, "AEJobId");

        const tempSEChargesRecv = data.AirExportJob_ChargesRecv.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Customer: lookupMaps.Gen_Parties.get(x.CustomerId),
            Principal: lookupMaps.Gen_Parties.get(x.PrincipalId),
            VatCategory: lookupMaps.Gen_ChargesVATCategory.get(x.VatCategoryId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SERGL_AgentInvoice_Charges.get(x.Id),
            GL_JobInvoice_Charges: lookupMaps.SERGL_JobInvoice_Charges.get(x.Id),
        }));

        lookupMaps.SExp_SeaExportJob_ChargesRecv = createGroupedMap(tempSEChargesRecv, "AEJobId");

        const tempSIChargesPayb = data.AirImportJob_ChargesPayb.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Vendor: lookupMaps.Gen_Parties.get(x.VendorId),
            Principal: lookupMaps.Gen_Parties.get(x.PrincipalId),
            VatCategory: lookupMaps.Gen_ChargesVATCategory.get(x.VatCategoryId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SIPGL_AgentInvoice_Charges.get(x.Id),
            GL_JobBill_Charges: lookupMaps.SIPGL_JobBill_Charges.get(x.Id),
        }));

        lookupMaps.SImp_SeaImportJob_ChargesPayb = createGroupedMap(tempSIChargesPayb, "AIJobId");

        const tempSIChargesRecv = data.AirImportJob_ChargesRecv.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Customer: lookupMaps.Gen_Parties.get(x.CustomerId),
            Principal: lookupMaps.Gen_Parties.get(x.PrincipalId),
            VatCategory: lookupMaps.Gen_ChargesVATCategory.get(x.VatCategoryId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SIRGL_AgentInvoice_Charges.get(x.Id),
            GL_JobInvoice_Charges: lookupMaps.SIRGL_JobInvoice_Charges.get(x.Id),
        }));

        lookupMaps.SImp_SeaImportJob_ChargesRecv = createGroupedMap(tempSIChargesRecv, "AIJobId");

        console.log({
            tempSIChargesPayb,
            tempSIChargesRecv,
            tempSEChargesPayb,
            tempSEChargesRecv
        })

        let SEJobs = data.AirExportJob.map(job => ({
            ...job,
            AirLine: lookupMaps.Gen_Parties.get(job.AirLineId),
            LocalVendor: lookupMaps.Gen_Parties.get(job.LocalVendorId),
            FinalDestination: lookupMaps.Gen_UNLocation.get(job.FinalDestinationCode),
            OverseasAgent: lookupMaps.Gen_Parties.get(job.OverseasAgentId),
            NotifyParty1: lookupMaps.Gen_Parties.get(job.NotifyParty1Id),
            NotifyParty2: lookupMaps.Gen_Parties.get(job.NotifyParty2Id),
            Shipper: lookupMaps.Gen_Parties.get(job.ShipperId),
            Consignee: lookupMaps.Gen_Parties.get(job.ConsigneeId),
            CustomClearance: lookupMaps.Gen_Parties.get(job.CustomClearanceId),
            Transporter: lookupMaps.Gen_Parties.get(job.TransporterId),
            PortOfReceipt: lookupMaps.Gen_UNLocation.get(job.PortOfReceiptCode),
            CostCenter: lookupMaps.GL_PropertiesLOV.get(job.CostCenterId),
            Voucher: lookupMaps.GL_Voucher.get(job.VoucherId),
            // ManifestHeader: lookupMaps.Gen_ManifestHeader.get(job.ManifestHeaderId),
            SplittedJob: lookupMaps.AExp_AirExportJob.get(job.SplittedJobId),
            Forwarder: lookupMaps.Gen_Parties.get(job.ForwarderId),
            CargoTypeFile: lookupMaps.Gen_CargoTypeFile.get(job.CargoTypeFileId),
            CargoPickUpLocation: lookupMaps.Gen_Parties_Locations.get(job.CargoPickUpLocationId),
            CargoDropOffLocation: lookupMaps.Gen_Parties_Locations.get(job.CargoDropOffLocationId),
            ParentJob: lookupMaps.AExp_AirExportJob.get(job.ParentJobId),
            Client: lookupMaps.Gen_Parties.get(job.ClientId),
            Buyer: lookupMaps.Gen_Parties.get(job.BuyerId),
            APOTAirLine: lookupMaps.Gen_Parties.get(job.APOTAirLineId),
            AirPortOfTranshipment1: lookupMaps.Gen_UNAirport.get(job.AirPortOfTranshipment1Id),
            APOT1AirLine: lookupMaps.Gen_Parties.get(job.APOT1AirLineId),
            AirPortOfTranshipment2: lookupMaps.Gen_UNAirport.get(job.AirPortOfTranshipment2Id),
            IncoTerms: lookupMaps.Gen_IncoTerms.get(job.IncoTermsId),
            AirPortOfDischarge: lookupMaps.Gen_UNAirport.get(job.AirPortOfDischargeId),
            AirPortOfTranshipment: lookupMaps.Gen_UNAirport.get(job.AirPortOfTranshipmentId),
            AirPortOfLoading: lookupMaps.Gen_UNAirport.get(job.AirPortOfLoadingId),
            Terminal: lookupMaps.Gen_Parties_Locations.get(job.TerminalId),
            // DocumentType: lookupMaps.Gen_DocumentType.get(job.DocumentTypeId),
            SalesRep: lookupMaps.TAP_Employee.get(job.SalesRepId),
            Packages: lookupMaps.UNPacking.get(job.PackagesCode),
            Commodity: lookupMaps.Gen_Commodity.get(job.CommodityId),
            SeaExportJob_ChargesPayb: lookupMaps.SExp_SeaExportJob_ChargesPayb.get(job.Id),
            SeaExportJob_ChargesRecv: lookupMaps.SExp_SeaExportJob_ChargesRecv.get(job.Id),
            SExp_BL: lookupMaps.SExp_BL.get(job.Id),
        }))

        let SIJobs = data.AirImportJob.map(job => ({
            ...job,
            FinalDestination: lookupMaps.Gen_UNLocation.get(job.FinalDestinationCode),
            Packages: lookupMaps.UNPacking.get(job.PackagesCode),
            OverseasAgent: lookupMaps.Gen_Parties.get(job.OverseasAgentId),
            NotifyParty1: lookupMaps.Gen_Parties.get(job.NotifyParty1Id),
            NotifyParty2: lookupMaps.Gen_Parties.get(job.NotifyParty2Id),
            Shipper: lookupMaps.Gen_Parties.get(job.ShipperId),
            Consignee: lookupMaps.Gen_Parties.get(job.ConsigneeId),
            CustomClearance: lookupMaps.Gen_Parties.get(job.CustomClearanceId),
            Transporter: lookupMaps.Gen_Parties.get(job.TransporterId),
            PortOfReceipt: lookupMaps.Gen_UNLocation.get(job.PortOfReceiptCode),
            Voucher: lookupMaps.GL_Voucher.get(job.VoucherId),
            Terminal: lookupMaps.Gen_Parties_Locations.get(job.TerminalId),
            Forwarder: lookupMaps.Gen_Parties.get(job.ForwarderId),
            CargoTypeFile: lookupMaps.Gen_CargoTypeFile.get(job.CargoTypeFileId),
            CargoPickUpLocation: lookupMaps.Gen_Parties_Locations.get(job.CargoPickUpLocationId),
            CargoDropOffLocation: lookupMaps.Gen_Parties_Locations.get(job.CargoDropOffLocationId),
            Buyer: lookupMaps.Gen_Parties.get(job.BuyerId),
            // ManifestHeader: lookupMaps.Gen_ManifestHeader.get(job.ManifestHeaderId),
            ParentJob: lookupMaps.AImp_AirImportJob.get(job.ParentJobId),
            AirLine: lookupMaps.Gen_Parties.get(job.AirLineId),
            Client: lookupMaps.Gen_Parties.get(job.ClientId),
            IncoTerms: lookupMaps.Gen_IncoTerms.get(job.IncoTermsId),
            AirPortOfDischarge: lookupMaps.Gen_UNAirport.get(job.AirPortOfDischargeId),
            AirPortOfTranshipment: lookupMaps.Gen_UNAirport.get(job.AirPortOfTranshipmentId),
            AirPortOfLoading: lookupMaps.Gen_UNAirport.get(job.AirPortOfLoadingId),
            SalesRep: lookupMaps.TAP_Employee.get(job.SalesRepId),
            Commodity: lookupMaps.Gen_Commodity.get(job.CommodityId),
            LocalVendor: lookupMaps.Gen_Parties.get(job.LocalVendorId),
            // DocumentType: lookupMaps.Gen_DocumentType.get(job.DocumentTypeId),
            CostCenter: lookupMaps.GL_PropertiesLOV.get(job.CostCenterId),
            SeaImportJob_ChargesPayb: lookupMaps.SImp_SeaImportJob_ChargesPayb.get(job.Id),
            SeaImportJob_ChargesRecv: lookupMaps.SImp_SeaImportJob_ChargesRecv.get(job.Id),
            SImp_BL: lookupMaps.SImp_BL.get(job.Id),
        }))

        console.log("Connected AE Jobs", SEJobs)

        // const result = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAEJobs`,SEJobs.slice(1000, 1050));

        for (let i = 0; i < SEJobs.length; i += 10) {
            const chunk = SEJobs.slice(i, i + 10);
            console.log(`Sending records ${i} - ${i + chunk.length}`);
            
            try {
                const result = await axiosClient.post(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAEJobs`,
                chunk
                );
                console.log("Batch success:", result.data);
            } catch (err) {
                console.error("Batch error:", err.message);
            }
        }

        console.log("Connected AI Jobs", SIJobs)

        for (let i = 0; i < SIJobs.length; i += 10) {
            const chunk = SIJobs.slice(i, i + 10);
            console.log(`Sending records ${i} - ${i + chunk.length}`);
            try {
                const result = await axiosClient.post(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAIJobs`,
                chunk
                );
                console.log("Batch success:", result.data);
            } catch (err) {
                console.error("Batch error:", err.message);
            }
        }

    }catch(e){
        console.error(e)
    }

    try{
        console.log("Fetching SE Job data")
        const { data } = await axiosClient.get("http://localhost:8081/jobs/getAllSE");
        console.log("SE Job Data:", data)

        const createMap = (arr, key) => new Map(arr.map(item => [item[key], item]));

        const createGroupedMap = (arr, key) => {
            const map = new Map();
            arr.forEach(item => {
                if (!map.has(item[key])) {
                map.set(item[key], []);
                }
                map.get(item[key]).push(item);
            });
            return map;
        };

        const lookupMaps = {
            UNPacking: createMap(data.Packing, "PackCode"),
            GL_PropertiesLOV: createMap(data.PropertiesLOV, "Id"),
            Gen_Parties_Locations: createMap(data.Parties_Locations, "Id"),
            Gen_IncoTerms: createMap(data.IncoTerms, "Id"),
            Gen_Parties: createMap(data.Parties, "Id"),
            GL_Currencies: createMap(data.Currencies, "Id"),
            GL_COA: createMap(data.COA, "Id"),
            SExp_SeaExportJob: createMap(data.SeaExportJob, "Id"),
            Gen_EquipmentSizeType: createMap(data.EquipmentSizeType, "EquipCode"),
            Gen_Charges: createMap(data.Charges, "Id"),
            SExp_BL_Detail: createMap(data.SEBL_Detail, "SEBLId"),
            GL_Invoices: createMap(data.Invoices, "Id"),
            Gen_Stamps: createMap(data.Stamps, "Id"),
            GL_COASubCategory: createMap(data.COASubCategory, "Id"),
            Gen_SubCompanies: createMap(data.SubCompanies, "Id"),
            GL_VoucherType: createMap(data.VoucherType, "Id"),
            GL_InvMode: createMap(data.InvMode, "Id"),
        };


        const tempSEBL_Stamp = data.SEBL_Stamp.map(x => ({
            ...x,
            Gen_Stamps: lookupMaps.Gen_Stamps.get(x.StampId),
        }))

        lookupMaps.SExp_BL_Stamp = createGroupedMap(tempSEBL_Stamp, "SEBLId");

        const tempSEBLE = data.SEBL_Equipment.map(x => ({
            ...x,
            UNPacking: lookupMaps.UNPacking.get(x.PackagesCode),
        }))

        lookupMaps.SExp_BL_Equipment = createGroupedMap(tempSEBLE, "SEBLId");

        const tempEquip = data.SeaExportJob_Equipment.map(x => ({
            ...x,
            Gen_EquipmentSizeType: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode)
        }))

        lookupMaps.SExp_SeaExportJob_Equipment = createGroupedMap(tempEquip, "SEJobId");

        
        const tempCOA = data.COA.map(x => ({
            ...x,
            GL_COA: lookupMaps.GL_COA.get(x.ParentAccountId),
            GL_COASubCategory: lookupMaps.GL_COASubCategory.get(x.CategoryId),

        }));

        lookupMaps.GL_COA = createMap(tempCOA, "Id");
        
        const tempParties = data.Parties.map(x => ({
            ...x,
            GL_COA: lookupMaps.GL_COA.get(x.AccountId),
        }));
        
        lookupMaps.Gen_Parties = createMap(tempParties, "Id");
        

        const tempVoucher_Heads = data.Voucher_Detail.map((vh) => ({
            ...vh,
            GL_COA: lookupMaps.GL_COA.get(vh.COAAccountId),
            GL_Currencies: lookupMaps.GL_Currencies.get(vh.CurrencyIdVD),
            GL_PropertiesLOV: lookupMaps.GL_PropertiesLOV.get(vh.CostCenterId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(vh.SubCompanyId),
        }));

        lookupMaps.GL_Voucher_Detail = createMap(tempVoucher_Heads, "Id")
        lookupMaps.GL_Voucher_Details = createGroupedMap(tempVoucher_Heads, "VoucherId")

        let tempVouchers = data.Voucher.map((v) => ({
            ...v,
            GL_Currencies: lookupMaps.GL_Currencies.get(v.CurrencyId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(v.SubCompanyId),
            GL_VoucherType: lookupMaps.GL_VoucherType.get(v.VoucherTypeId),
            GL_Voucher_Detail: lookupMaps.GL_Voucher_Details.get(v.Id),
        }))

        lookupMaps.GL_Voucher = createMap(tempVouchers, "Id")

        const tempInvoices = data.Invoices.map((i) => ({
            ...i,
            GL_Voucher: filterVoucherData(lookupMaps.GL_Voucher, lookupMaps.GL_Voucher_Detail.get(i.GVDetailId).VoucherId),
            GL_Currencies: lookupMaps.GL_Currencies.get(i.CurrencyId),
            GL_InvMode: lookupMaps.GL_InvMode.get(i.InvoiceTypeId),
            Gen_Parties: lookupMaps.Gen_Parties.get(i.PartyId),
        }))

        lookupMaps.GL_Invoices = createMap(tempInvoices, "Id")

        const tempJobBill = data.JobBill.map(x => ({
            ...x,
            Invoice: filterData(lookupMaps.GL_Invoices, x.GLInvoiceId),
        }))

        lookupMaps.GL_JobBill = createMap(tempJobBill, "Id");

        const tempJobBill_Charges = data.JobBill_Charges.map(x => ({
            ...x,
            JobBill: lookupMaps.GL_JobBill.get(x.JobBillId),
        }))

        lookupMaps.SEPGL_JobBill_Charges = createMap(tempJobBill_Charges, "SEJobChargesPaybId");

        const tempJobInvoice = data.JobInvoice.map(x => ({
            ...x,
            Invoice: filterData(lookupMaps.GL_Invoices, x.GLInvoiceId),
        }))

        lookupMaps.GL_JobInvoice = createMap(tempJobInvoice, "Id");

        const tempJobInvoice_Charges = data.JobInvoice_Charges.map(x => ({
            ...x,
            JobInvoice: lookupMaps.GL_JobInvoice.get(x.JobInvoiceId),
        }))

        lookupMaps.SERGL_JobInvoice_Charges = createMap(tempJobInvoice_Charges, "SEJobChargesRecvId");

        const tempAgentInvoice = data.Agent_Invoice.map(x => ({
            ...x,
            Invoice: filterData(lookupMaps.GL_Invoices, x.GLInvoiceId),
        }))

        lookupMaps.GL_Agent_Invoice = createMap(tempAgentInvoice, "Id");

        const tempAgentInvoice_Charges = data.AgentInvoice_Charges.map(x => ({
            ...x,
            Agent_Invoice: lookupMaps.GL_Agent_Invoice.get(x.AgentInvoiceId),
        }))

        lookupMaps.SEPGL_AgentInvoice_Charges = createMap(tempAgentInvoice_Charges, "SEJobChargesPaybId");
        lookupMaps.SERGL_AgentInvoice_Charges = createMap(tempAgentInvoice_Charges, "SEJobChargesRecvId");

        const tempSEBl = data.SE_BL.map(x => ({
            ...x,
            SExp_BL_Detail: lookupMaps.SExp_BL_Detail.get(x.Id),
            SExp_BL_Equipment: lookupMaps.SExp_BL_Equipment.get(x.Id),
            SExp_BL_Stamp: lookupMaps.SExp_BL_Stamp.get(x.Id)
        }));

        lookupMaps.SExp_BL = createMap(tempSEBl, "SEJobId");

        const tempSEChargesPayb = data.SeaExportJob_ChargesPayb.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Vendor: lookupMaps.Gen_Parties.get(x.VendorId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SEPGL_AgentInvoice_Charges.get(x.Id),
            GL_JobBill_Charges: lookupMaps.SEPGL_JobBill_Charges.get(x.Id),
        }));

        lookupMaps.SExp_SeaExportJob_ChargesPayb = createGroupedMap(tempSEChargesPayb, "SEJobId");

        const tempSEChargesRecv = data.SeaExportJob_ChargesRecv.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Customer: lookupMaps.Gen_Parties.get(x.CustomerId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SERGL_AgentInvoice_Charges.get(x.Id),
            GL_JobInvoice_Charges: lookupMaps.SERGL_JobInvoice_Charges.get(x.Id),
        }));

        lookupMaps.SExp_SeaExportJob_ChargesRecv = createGroupedMap(tempSEChargesRecv, "SEJobId");

        let SEJobs = data.SeaExportJob.map(job => ({
            ...job,
            Packages: lookupMaps.UNPacking.get(job.PackagesCode),
            CostCenter: lookupMaps.GL_PropertiesLOV.get(job.CostCenterId),
            Terminal: lookupMaps.Gen_Parties_Locations.get(job.TerminalId),
            IncoTerms: lookupMaps.Gen_IncoTerms.get(job.IncoTermsId),
            SeaExportJob_ChargesPayb: lookupMaps.SExp_SeaExportJob_ChargesPayb.get(job.Id),
            SeaExportJob_ChargesRecv: lookupMaps.SExp_SeaExportJob_ChargesRecv.get(job.Id),
            SExp_BL: lookupMaps.SExp_BL.get(job.Id),
            SExp_SeaExportJob_Equipment: lookupMaps.SExp_SeaExportJob_Equipment.get(job.Id),
            
        }))

        console.log("Connected SE Jobs", SEJobs)

        // const result = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSEJobs`,SEJobs.slice(1000, 1010));

        for (let i = 0; i < SEJobs.length; i += 10) {
            const chunk = SEJobs.slice(i, i + 10);
            console.log(`Sending records ${i} - ${i + chunk.length}`);
            
            try {
                const result = await axiosClient.post(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSEJobs`,
                chunk
                );
                console.log("Batch success:", result.data);
            } catch (err) {
                console.error("Batch error:", err.message);
            }
        }

        
        // console.log("Connected SI Jobs", SIJobs)

        // const result = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,SIJobs.slice(100, 200));
        
        // for (let i = 0; i < SIJobs.length; i += 10) {
        //     const chunk = SIJobs.slice(i, i + 10);
        //     console.log(`Sending records ${i} - ${i + chunk.length}`);
            
        //     try {
        //         const result = await axiosClient.post(
        //         `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,
        //         chunk
        //         );
        //         console.log("Batch success:", result.data);
        //     } catch (err) {
        //         console.error("Batch error:", err.message);
        //     }
        // }

    }catch(e){
        console.error(e)
    }

    try{
        console.log("Fetching SI Job data")
        const { data } = await axiosClient.get("http://localhost:8081/jobs/getAllSI");
        console.log("SI Job Data:", data)

        const createMap = (arr, key) => new Map(arr.map(item => [item[key], item]));

        const createGroupedMap = (arr, key) => {
            const map = new Map();
            arr.forEach(item => {
                if (!map.has(item[key])) {
                map.set(item[key], []);
                }
                map.get(item[key]).push(item);
            });
            return map;
        };

        const lookupMaps = {
            UNPacking: createMap(data.Packing, "PackCode"),
            GL_PropertiesLOV: createMap(data.PropertiesLOV, "Id"),
            Gen_Parties_Locations: createMap(data.Parties_Locations, "Id"),
            Gen_IncoTerms: createMap(data.IncoTerms, "Id"),
            Gen_Parties: createMap(data.Parties, "Id"),
            GL_Currencies: createMap(data.Currencies, "Id"),
            GL_COA: createMap(data.COA, "Id"),
            // SExp_SeaExportJob: createMap(data.SeaExportJob, "Id"),
            Gen_EquipmentSizeType: createMap(data.EquipmentSizeType, "EquipCode"),
            Gen_Charges: createMap(data.Charges, "Id"),
            SImp_BL_Detail: createMap(data.SIBL_Detail, "SIBLId"),
            GL_Invoices: createMap(data.Invoices, "Id"),
            // Gen_Stamps: createMap(data.Stamps, "Id"),
            GL_COASubCategory: createMap(data.COASubCategory, "Id"),
            Gen_SubCompanies: createMap(data.SubCompanies, "Id"),
            GL_VoucherType: createMap(data.VoucherType, "Id"),
            GL_InvMode: createMap(data.InvMode, "Id"),
        };

        const tempEquip = data.SeaImportJob_Equipment.map(x => ({
            ...x,
            Gen_EquipmentSizeType: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode)
        }))

        lookupMaps.SImp_SeaImportJob_Equipment = createGroupedMap(tempEquip, "SIJobId");

        
        const tempCOA = data.COA.map(x => ({
            ...x,
            GL_COA: lookupMaps.GL_COA.get(x.ParentAccountId),
            GL_COASubCategory: lookupMaps.GL_COASubCategory.get(x.CategoryId),

        }));

        lookupMaps.GL_COA = createMap(tempCOA, "Id");
        
        const tempParties = data.Parties.map(x => ({
            ...x,
            GL_COA: lookupMaps.GL_COA.get(x.AccountId),
        }));
        
        lookupMaps.Gen_Parties = createMap(tempParties, "Id");
        

        const tempVoucher_Heads = data.Voucher_Detail.map((vh) => ({
            ...vh,
            GL_COA: lookupMaps.GL_COA.get(vh.COAAccountId),
            GL_Currencies: lookupMaps.GL_Currencies.get(vh.CurrencyIdVD),
            GL_PropertiesLOV: lookupMaps.GL_PropertiesLOV.get(vh.CostCenterId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(vh.SubCompanyId),
        }));

        lookupMaps.GL_Voucher_Detail = createMap(tempVoucher_Heads, "Id")
        lookupMaps.GL_Voucher_Details = createGroupedMap(tempVoucher_Heads, "VoucherId")

        let tempVouchers = data.Voucher.map((v) => ({
            ...v,
            GL_Currencies: lookupMaps.GL_Currencies.get(v.CurrencyId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(v.SubCompanyId),
            GL_VoucherType: lookupMaps.GL_VoucherType.get(v.VoucherTypeId),
            GL_Voucher_Detail: lookupMaps.GL_Voucher_Details.get(v.Id),
        }))

        lookupMaps.GL_Voucher = createMap(tempVouchers, "Id")

        const tempInvoices = data.Invoices.map((i) => ({
            ...i,
            GL_Voucher: filterVoucherData(lookupMaps.GL_Voucher, lookupMaps.GL_Voucher_Detail.get(i.GVDetailId).VoucherId),
            GL_Currencies: lookupMaps.GL_Currencies.get(i.CurrencyId),
            GL_InvMode: lookupMaps.GL_InvMode.get(i.InvoiceTypeId),
            Gen_Parties: lookupMaps.Gen_Parties.get(i.PartyId),
        }))

        lookupMaps.GL_Invoices = createMap(tempInvoices, "Id")

        const tempJobBill = data.JobBill.map(x => ({
            ...x,
            Invoice: filterData(lookupMaps.GL_Invoices, x.GLInvoiceId),
        }))

        lookupMaps.GL_JobBill = createMap(tempJobBill, "Id");

        const tempJobBill_Charges = data.JobBill_Charges.map(x => ({
            ...x,
            JobBill: lookupMaps.GL_JobBill.get(x.JobBillId),
        }))

        lookupMaps.SEPGL_JobBill_Charges = createMap(tempJobBill_Charges, "SIJobChargesPaybId");

        const tempJobInvoice = data.JobInvoice.map(x => ({
            ...x,
            Invoice: filterData(lookupMaps.GL_Invoices, x.GLInvoiceId),
        }))

        lookupMaps.GL_JobInvoice = createMap(tempJobInvoice, "Id");

        const tempJobInvoice_Charges = data.JobInvoice_Charges.map(x => ({
            ...x,
            JobInvoice: lookupMaps.GL_JobInvoice.get(x.JobInvoiceId),
        }))

        lookupMaps.SERGL_JobInvoice_Charges = createMap(tempJobInvoice_Charges, "SIJobChargesRecvId");

        const tempAgentInvoice = data.Agent_Invoice.map(x => ({
            ...x,
            Invoice: filterData(lookupMaps.GL_Invoices, x.GLInvoiceId),
        }))

        lookupMaps.GL_Agent_Invoice = createMap(tempAgentInvoice, "Id");

        const tempAgentInvoice_Charges = data.AgentInvoice_Charges.map(x => ({
            ...x,
            Agent_Invoice: lookupMaps.GL_Agent_Invoice.get(x.AgentInvoiceId),
        }))

        lookupMaps.SEPGL_AgentInvoice_Charges = createMap(tempAgentInvoice_Charges, "SIJobChargesPaybId");
        lookupMaps.SERGL_AgentInvoice_Charges = createMap(tempAgentInvoice_Charges, "SIJobChargesRecvId");

        const tempSEBl = data.SI_BL.map(x => ({
            ...x,
            SImp_BL_Detail: lookupMaps.SImp_BL_Detail.get(x.Id),
            // SExp_BL_Equipment: lookupMaps.SExp_BL_Equipment.get(x.Id),
            // SExp_BL_Stamp: lookupMaps.SExp_BL_Stamp.get(x.Id)
        }));

        lookupMaps.SImp_BL = createMap(tempSEBl, "SIJobId");

        const tempSIChargesPayb = data.SeaExportJob_ChargesPayb.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Vendor: lookupMaps.Gen_Parties.get(x.VendorId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SEPGL_AgentInvoice_Charges.get(x.Id),
            GL_JobBill_Charges: lookupMaps.SEPGL_JobBill_Charges.get(x.Id),
        }));

        lookupMaps.SExp_SeaExportJob_ChargesPayb = createGroupedMap(tempSIChargesPayb, "SIJobId");

        const tempSIChargesRecv = data.SeaExportJob_ChargesRecv.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Customer: lookupMaps.Gen_Parties.get(x.CustomerId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SERGL_AgentInvoice_Charges.get(x.Id),
            GL_JobInvoice_Charges: lookupMaps.SERGL_JobInvoice_Charges.get(x.Id),
        }));

        lookupMaps.SExp_SeaExportJob_ChargesRecv = createGroupedMap(tempSIChargesRecv, "SIJobId");

        let SIJobs = data.SeaImportJob.map(job => ({
            ...job,
            Packages: lookupMaps.UNPacking.get(job.PackagesCode),
            CostCenter: lookupMaps.GL_PropertiesLOV.get(job.CostCenterId),
            Terminal: lookupMaps.Gen_Parties_Locations.get(job.TerminalId),
            IncoTerms: lookupMaps.Gen_IncoTerms.get(job.IncoTermsId),
            SeaExportJob_ChargesPayb: lookupMaps.SExp_SeaExportJob_ChargesPayb.get(job.Id),
            SeaExportJob_ChargesRecv: lookupMaps.SExp_SeaExportJob_ChargesRecv.get(job.Id),
            SImp_BL: lookupMaps.SImp_BL.get(job.Id),
            SImp_SeaImportJob_Equipment: lookupMaps.SImp_SeaImportJob_Equipment.get(job.Id),
            
        }))

        console.log("Connected SI Jobs", SIJobs)

        // const result = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,SIJobs.slice(100, 110));

        for (let i = 0; i < SIJobs.length; i += 10) {
            const chunk = SIJobs.slice(i, i + 10);
            console.log(`Sending records ${i} - ${i + chunk.length}`);
            
            try {
                const result = await axiosClient.post(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,
                chunk
                );
                console.log("Batch success:", result.data);
            } catch (err) {
                console.error("Batch error:", err.message);
            }
        }

        
        // console.log("Connected SI Jobs", SIJobs)

        // const result = await axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,SIJobs.slice(100, 200));
        
        // for (let i = 0; i < SIJobs.length; i += 10) {
        //     const chunk = SIJobs.slice(i, i + 10);
        //     console.log(`Sending records ${i} - ${i + chunk.length}`);
            
        //     try {
        //         const result = await axiosClient.post(
        //         `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,
        //         chunk
        //         );
        //         console.log("Batch success:", result.data);
        //     } catch (err) {
        //         console.error("Batch error:", err.message);
        //     }
        // }

    }catch(e){
        console.error(e)
    }

    try{
        console.log("Starting Invoices Data Fetch...")

        //Fetch data from Climax DB API
        const { data } = await axiosClient.post("http://localhost:8081/voucher/getAll");
        console.log("Data Fetched Successfully", data)

        const createMap = (arr, key) => new Map(arr.map(item => [item[key], item]));

        const createGroupedMap = (arr, key) => {
            const map = new Map();
            arr.forEach(item => {
                if (!map.has(item[key])) {
                map.set(item[key], []);
                }
                map.get(item[key]).push(item);
            });
            return map;
        };

        let lookupMaps = {
            GL_COA: createMap(data.COA, "Id"),
            GL_COASubCategory: createMap(data.COASubCategory, "Id"),
            Gen_BankSubType: createMap(data.BankSubType, "Id"),
            Gen_SubCompanies: createMap(data.SubCompanies, "Id"),
            GL_InvTaxType: createMap(data.InvTaxType, "Id"),
            GL_PropertiesLOV: createMap(data.PropertiesLOV, "Id"),
            GL_Currencies: createMap(data.Currencies, "Id"),
            Gen_TaxInvNature: createMap(data.TaxInvNature, "Id"),
            GL_Requisition: createMap(data.Requisition, "Id"),
            GL_ChequeType: createMap(data.ChequeType, "Id"),
            Gen_TaxFilerStatus: createMap(data.TaxFilerStatus, "Id"),
            GL_VoucherType: createMap(data.VoucherType, "Id"),
            GL_VoucherFormType: createMap(data.VoucherFormType, "Id"),
            GL_InvMode: createMap(data.InvMode, "Id"),
            GL_JobInvoice: createMap(data.JobInvoice, "GLInvoiceId"),
            GL_JobBill: createMap(data.JobBill, "GLInvoiceId"),
            GL_InvAdjustments: createGroupedMap(data.InvAdjustments, "InvoiceId"),
        }

        const COA = data.COA.map((a) => ({
            ...a,
            GL_COA: lookupMaps.GL_COA.get(a.ParentAccountId),
            GL_COASubCategory: lookupMaps.GL_COASubCategory.get(a.SubCategoryId)
        }))

        lookupMaps.GL_COA = createMap(COA, "Id")

        const Parties = data.Parties.map((p) => ({
            ...p,
            GL_COA: lookupMaps.GL_COA.get(p.AccountId),
        }))

        lookupMaps.Gen_Parties = createMap(Parties, "Id")

        const Voucher_Heads = data.Voucher_Detail.map((vh) => ({
            ...vh,
            GL_COA: lookupMaps.GL_COA.get(vh.COAAccountId),
            GL_Currencies: lookupMaps.GL_Currencies.get(vh.CurrencyIdVD),
            GL_PropertiesLOV: lookupMaps.GL_PropertiesLOV.get(vh.CostCenterId),
            Gen_BankSubType: lookupMaps.Gen_BankSubType.get(vh.BankSubTypeId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(vh.SubCompanyId),
            GL_InvTaxType: lookupMaps.GL_InvTaxType.get(vh.TaxTypeId),
        }))

        lookupMaps.GL_Voucher_Detail = createMap(Voucher_Heads, "Id")
        lookupMaps.GL_Voucher_Details = createGroupedMap(Voucher_Heads, "VoucherId")

        let Vouchers = data.Voucher.map((v) => ({
            ...v,
            Gen_TaxInvNature: lookupMaps.Gen_TaxInvNature.get(v.TaxNatureId),
            GL_Currencies: lookupMaps.GL_Currencies.get(v.CurrencyId),
            GL_Requisition: lookupMaps.GL_Requisition.get(v.ReqId),
            GL_ChequeType: lookupMaps.GL_ChequeType.get(v.ChequeTypeId),
            Gen_TaxFilerStatus: lookupMaps.Gen_TaxFilerStatus.get(v.FilerStatusId),
            Gen_SubCompanies: lookupMaps.Gen_SubCompanies.get(v.SubCompanyId),
            GL_VoucherType: lookupMaps.GL_VoucherType.get(v.VoucherTypeId),
            GL_VoucherFormType: lookupMaps.GL_VoucherFormType.get(v.VoucherFormId),
            GL_Voucher_Detail: lookupMaps.GL_Voucher_Details.get(v.Id),
        }))

        lookupMaps.GL_Voucher = createMap(Vouchers, "Id")

        const Invoices = data.Invoices.map((i) => ({
            ...i,
            GL_Voucher: filterVoucherData(lookupMaps.GL_Voucher, lookupMaps.GL_Voucher_Detail.get(i.GVDetailId).VoucherId),
            GL_Currencies: lookupMaps.GL_Currencies.get(i.CurrencyId),
            GL_InvMode: lookupMaps.GL_InvMode.get(i.InvoiceTypeId),
            GL_JobInvoice: lookupMaps.GL_JobInvoice.get(i.Id),
            GL_JobBill: lookupMaps.GL_JobBill.get(i.Id),
            Gen_Parties: lookupMaps.Gen_Parties.get(i.PartyId),
            GL_InvAdjustments: lookupMaps.GL_InvAdjustments.get(i.Id),
        }))

        lookupMaps.GL_Invoices = createMap(Invoices, "Id")

        const chunkArray = (array, chunkSize) => {
            const chunks = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }
            return chunks;
        };

        const sendBatches = async (items, url, batchSize = 100, maxRetries = 3) => {
            const batches = chunkArray(items, batchSize);
            for (let i = 0; i < batches.length; i++) {
                let retries = 0, success = false;
                while (!success && retries < maxRetries) {
                    try {
                        console.log(`🚀 Sending batch ${i + 1}/${batches.length} (${batches[i].length} items)`);
                        // console.log(batches[i])
                        const response = await axiosClient.post(url, { records: batches[i] });
                        // console.log(`✅ Batch ${i + 1} OK:`, response.data);
                        success = true;
                    } catch (error) {
                        retries++;
                        console.error(`❌ Batch ${i + 1} failed (${retries}/${maxRetries}): ${error.message}`);
                        if (retries >= maxRetries) {
                            console.error(`🚨 Skipping batch ${i + 1}`);
                        } else {
                            console.log(`🔄 Retrying batch ${i + 1}...`);
                        }
                    }
                }
            }
            console.log("🎉 All batches processed for", url);
        };

        await sendBatches(Invoices, "http://localhost:8084/voucher/importI", 100);

    }catch(e){
        console.error(e)
    }
}

    return (
        <Row md={24} style={{
            display: 'flex',
            alignContent: 'middle'
        }}>
            <Col md={5}>
                <button onClick={()=>{backup()}} style={{width: 'auto'}} className='btn-custom'>1. Backup data from Climax DB</button>
            </Col>
            <Col md={12}>
            {!['Idle', 'Success'].includes(status) && <Spin />}
            <h2 style={{
                padding: '0',
                margin: '0'
            }}>{status}</h2>
            </Col>
        </Row>
    )
}

export default Upload_CoA