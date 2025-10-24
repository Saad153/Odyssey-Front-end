import CSVReader from "react-csv-reader";
import axios from 'axios';
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { loopHooks } from "react-table";


const Upload_CoA = () => {

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
        // await importCommodities()
        // await importVoyages()
        // await importCOA()
        // await importCharges()
        // await importParties()
        await importJobs()
        // await importVouchers()
        // await importAirPorts()
        // await importEmployees()
        // await importAECharges()
    }

    const [invoicesData, setInvoices] = useState([]);
    const [partiesAccounts1, setPartiesAccounts] = useState({
        "Clients": [],
        "Vendors": [],
        "Clients/Vendors": [],
        "nonGlParties": []
    });

    let partiesAccounts = {
        "Clients": [],
        "Vendors": [],
        "Clients/Vendors": [],
        "nonGlParties": []
    }
    const [withAccounts1, setWithAccounts] = useState([]);
    let withAccounts = []
    let withoutAccounts = []
    const [status, setStatus] = useState("Waiting for file");
    const [statusInvoices, setStatusInvoices] = useState("Waiting for file");
    const [statusInvoiceMatching, setStatusInvoiceMatching] = useState("Waiting for file");
    const [C, setClients] = useState(false);
    const [V, setVendors] = useState(false);
    const [CV, setCV] = useState(false);
    const [GL, setNonGl] = useState(false);

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
            const charges = await axios.post("http://localhost:8081/charges/getAll")
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
            const result = await axios.post("http://localhost:8082/charges/bulkCreate", tempCharges)
            console.log(result)
        }catch(err){
            console.error(err)
        }
    
    }
    const importCOA = async () => {
        try{
            const companyId = Cookies.get("companyId")
            const coa = await axios.post("http://localhost:8081/accounts/getAll")
            console.log("COA Data:", coa.data)
            // const Data = coa.data

            // Data.forEach((data)=>{

            // })
            
            const result = await axios.post("http://localhost:8082/accounts/importAccount", coa.data.temp)
            console.log(result.status)
        }catch(err){
            console.error(err)
        }
    }
    const getCOATree = async () => {
        try{
            // const coa = await axios.post("http://localhost:8081/accounts/getAll")
            // console.log(coa.data)
            const result = await axios.get("http://localhost:8082/coa/getCOATree")
            console.log(result.data)
        }catch(err){
            console.error(err)
        }
    }

const importParties = async () => {
    try{
        const { data } = await axios.get("http://localhost:8081/parties/get")
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

        const result = await axios.post("http://localhost:8082/clientRoutes/bulkCreate", parties)
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
        const { data } = await axios.post("http://localhost:8081/voucher/getAll");
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
                        const response = await axios.post(url, { records: batches[i] });
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

        await sendBatches(linkedVouchers, "http://localhost:8082/voucher/importVouchers", 100);
        await sendBatches(unlinkedVouchers, "http://localhost:8082/voucher/importV", 100);
        

    }catch(e){
        console.error(e)
    }
}

const BATCH_SIZE = 100;

const importAirPorts = async () => {
    try {
        const { data } = await axios.get("http://localhost:8081/jobs/getAirports");
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
            await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAirPorts`, {
                Airports: batch,
                UNLocation: [],
            });
        }

        for (const batch of unLocationBatches) {
            await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAirPorts`, {
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
        const { data } = await axios.get("http://localhost:8081/jobs/getEmployees");
        console.log("Employee Data:", data);

        await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/employeeRoutes/uploadEmployees`, data);

        console.log("Employees uploaded successfully");
    }catch(e){
        console.log(e)
    }
}

const importCommodities = async () => {
    try {
        const { data } = await axios.get("http://localhost:8081/jobs/getCommodities");
        console.log("Commodity Data:", data);

        await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/commodity/uploadCommodities`, data);

        console.log("Comodities uploaded successfully");
    }catch(e){
        console.log(e)
    }
}

const importVoyages = async () => {
    try {
        const { data } = await axios.get("http://localhost:8081/jobs/getVoyages");
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

        const result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/vessel/uploadVoyages`, Vessels);

        console.log("Vessels uploaded successfully", result);
    }catch(e){
        console.log(e)
    }
}

const importBls = async () => {
    try {
        const { data } = await axios.get("http://localhost:8081/jobs/getBLs");
        console.log("BL Data:", data);

        await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/uploadBLs`, data);

        console.log("BLs uploaded successfully");
    }catch(e){
        console.log(e)
    }
}

const importAECharges = async () => {
    try {
        const { data } = await axios.get("http://localhost:8081/jobs/getAECharges");
        console.log("AE Charges Data:", data);
        
        const result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/charges/uploadChargeHeads`, data);
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
        // const { data } = await axios.get("http://localhost:8081/jobs/getAll");
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
            Gen_DocumentType: createMap(data.DocumentType, "Id"),
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
            Gen_JobCancelReason: createMap(data.JobCancelReason, "Id"),
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
            DocumentType: lookupMaps.Gen_DocumentType.get(job.DocumentTypeId),
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
            DocumentType: lookupMaps.Gen_DocumentType.get(job.DocumentTypeId),
            CostCenter: lookupMaps.GL_PropertiesLOV.get(job.CostCenterId),
            SeaImportJob_ChargesPayb: lookupMaps.SImp_SeaImportJob_ChargesPayb.get(job.Id),
            SeaImportJob_ChargesRecv: lookupMaps.SImp_SeaImportJob_ChargesRecv.get(job.Id),
            SImp_BL: lookupMaps.SImp_BL.get(job.Id),
        }))

        console.log("Connected AE Jobs", SEJobs)

        // const result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAEJobs`,SEJobs.slice(1000, 1050));

        for (let i = 0; i < SEJobs.length; i += 10) {
            const chunk = SEJobs.slice(i, i + 10);
            console.log(`Sending records ${i} - ${i + chunk.length}`);
            
            try {
                const result = await axios.post(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAEJobs`,
                chunk
                );
                console.log("Batch success:", result.data);
            } catch (err) {
                console.error("Batch error:", err.message);
            }
        }

        
        console.log("Connected AI Jobs", SIJobs)

        // const result1 = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadAIJobs`,SIJobs.slice(100, 150));
        
        for (let i = 0; i < SIJobs.length; i += 10) {
            const chunk = SIJobs.slice(i, i + 10);
            console.log(`Sending records ${i} - ${i + chunk.length}`);
            
            try {
                const result = await axios.post(
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
        // const { data } = await axios.get("http://localhost:8081/jobs/getAllSE");
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

        // const result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSEJobs`,SEJobs.slice(1000, 1010));

        for (let i = 0; i < SEJobs.length; i += 10) {
            const chunk = SEJobs.slice(i, i + 10);
            console.log(`Sending records ${i} - ${i + chunk.length}`);
            
            try {
                const result = await axios.post(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSEJobs`,
                chunk
                );
                console.log("Batch success:", result.data);
            } catch (err) {
                console.error("Batch error:", err.message);
            }
        }

        
        // console.log("Connected SI Jobs", SIJobs)

        // const result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,SIJobs.slice(100, 200));
        
        // for (let i = 0; i < SIJobs.length; i += 10) {
        //     const chunk = SIJobs.slice(i, i + 10);
        //     console.log(`Sending records ${i} - ${i + chunk.length}`);
            
        //     try {
        //         const result = await axios.post(
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
        // const { data } = await axios.get("http://localhost:8081/jobs/getAllSI");
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


        // const tempSEBL_Stamp = data.SEBL_Stamp.map(x => ({
        //     ...x,
        //     Gen_Stamps: lookupMaps.Gen_Stamps.get(x.StampId),
        // }))

        // lookupMaps.SExp_BL_Stamp = createGroupedMap(tempSEBL_Stamp, "SEBLId");

        // const tempSEBLE = data.SEBL_Equipment.map(x => ({
        //     ...x,
        //     UNPacking: lookupMaps.UNPacking.get(x.PackagesCode),
        // }))

        // lookupMaps.SExp_BL_Equipment = createGroupedMap(tempSEBLE, "SEBLId");

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

        const tempSEChargesPayb = data.SeaExportJob_ChargesPayb.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Vendor: lookupMaps.Gen_Parties.get(x.VendorId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SEPGL_AgentInvoice_Charges.get(x.Id),
            GL_JobBill_Charges: lookupMaps.SEPGL_JobBill_Charges.get(x.Id),
        }));

        lookupMaps.SImp_SeaExportJob_ChargesPayb = createGroupedMap(tempSEChargesPayb, "SIJobId");

        const tempSEChargesRecv = data.SeaExportJob_ChargesRecv.map(x => ({
            ...x,
            Currency: lookupMaps.GL_Currencies.get(x.CurrencyId),
            Customer: lookupMaps.Gen_Parties.get(x.CustomerId),
            Charges: lookupMaps.Gen_Charges.get(x.ChargesId),
            Equip: lookupMaps.Gen_EquipmentSizeType.get(x.EquipCode),
            GL_AgentInvoice_Charges: lookupMaps.SERGL_AgentInvoice_Charges.get(x.Id),
            GL_JobInvoice_Charges: lookupMaps.SERGL_JobInvoice_Charges.get(x.Id),
        }));

        lookupMaps.SImp_SeaExportJob_ChargesRecv = createGroupedMap(tempSEChargesRecv, "SIJobId");

        let SIJobs = data.SeaImportJob.map(job => ({
            ...job,
            Packages: lookupMaps.UNPacking.get(job.PackagesCode),
            CostCenter: lookupMaps.GL_PropertiesLOV.get(job.CostCenterId),
            Terminal: lookupMaps.Gen_Parties_Locations.get(job.TerminalId),
            IncoTerms: lookupMaps.Gen_IncoTerms.get(job.IncoTermsId),
            SeaExportJob_ChargesPayb: lookupMaps.SImp_SeaExportJob_ChargesPayb.get(job.Id),
            SeaExportJob_ChargesRecv: lookupMaps.SImp_SeaExportJob_ChargesRecv.get(job.Id),
            SImp_BL: lookupMaps.SImp_BL.get(job.Id),
            SImp_SeaImportJob_Equipment: lookupMaps.SImp_SeaImportJob_Equipment.get(job.Id),
            
        }))

        console.log("Connected SI Jobs", SIJobs)

        // const result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,SIJobs.slice(100, 110));

        for (let i = 0; i < SIJobs.length; i += 10) {
            const chunk = SIJobs.slice(i, i + 10);
            console.log(`Sending records ${i} - ${i + chunk.length}`);
            
            try {
                const result = await axios.post(
                `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,
                chunk
                );
                console.log("Batch success:", result.data);
            } catch (err) {
                console.error("Batch error:", err.message);
            }
        }

        
        // console.log("Connected SI Jobs", SIJobs)

        // const result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/seaJob/UploadSIJobs`,SIJobs.slice(100, 200));
        
        // for (let i = 0; i < SIJobs.length; i += 10) {
        //     const chunk = SIJobs.slice(i, i + 10);
        //     console.log(`Sending records ${i} - ${i + chunk.length}`);
            
        //     try {
        //         const result = await axios.post(
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
        const { data } = await axios.post("http://localhost:8081/voucher/getAll");
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
                        const response = await axios.post(url, { records: batches[i] });
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

        // await sendBatches(Invoices, "http://localhost:8082/voucher/importI", 100);

    }catch(e){
        console.error(e)
    }
}



    const uploadInvoices = async() => {
        console.log(invoicesData)
        let count = 0
        let failed = []
        setStatusInvoices("Uploading...")
        for(let x of invoicesData){
            if(x.companyId != "1" || x.companyId != "3"){
                const result = await axios.post("http://localhost:8082/invoice/uploadbulkInvoices", x)
                count++
                console.log(result)
            }
            // break;
        }
        setStatusInvoices("Success, see console for more details")
        // console.log(failed)
        console.log(count)
    }

    const [jobs, setJobs] = useState([])

    const handleJobData = async(data, fileInfo) => {
        //console.log(data)
        //console.log(fileInfo)
        let jobList = []
        let count = 0
        const client = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CLIENTS)
        const vendor = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_VENDORS)
        let clients = client.data.result
        let vendors = vendor.data.result
        let index = 0
        let SNS_AE = []
        let SNS_AI = []
        let SNS_SEJ = []
        let SNS_SIJ = []
        let ACS_AE = []
        let ACS_AI = []
        let ACS_SEJ = []
        let ACS_SIJ = []
        for(let x of data){
            if(x.job__ && x.job__.includes("SNS")){
                if(x.job__ && x.job__.includes("AE")){
                    SNS_AE.push(x)
                }
                if(x.job__ && x.job__.includes("AI")){
                    SNS_AI.push(x)
                }
                if(x.job__ && x.job__.includes("SEJ")){
                    SNS_SEJ.push(x)
                }
                if(x.job__ && x.job__.includes("SIJ")){
                    SNS_SIJ.push(x)
                }
            }
            if(x.job__ && x.job__.includes("ACS")){
                if(x.job__ && x.job__.includes("AE")){
                    ACS_AE.push(x)
                }
                if(x.job__ && x.job__.includes("AI")){
                    ACS_AI.push(x)
                }
                if(x.job__ && x.job__.includes("SEJ")){
                    ACS_SEJ.push(x)
                }
                if(x.job__ && x.job__.includes("SIJ")){
                    ACS_SIJ.push(x)
                }
            }
        }
        console.log(SNS_AE)
        console.log(SNS_AI)
        console.log(SNS_SEJ)
        console.log(SNS_SIJ)
        console.log(ACS_AE)
        console.log(ACS_AI)
        console.log(ACS_SEJ)
        console.log(ACS_SIJ)
        
    }

    const [vouchers, setVouchers] = useState([])

    const [voucherData, setVoucherData] = useState([])

    const handleVoucher = async(data, fileInfo) => {
        console.log(data)
        setVoucherData(data)
        console.log(fileInfo)
        setStatus("Processing...")
        let toBeUploaded = []
        let openingBalances = []
        let misc = []
        let salesInvoices = []
        let purchaseInvoices = []
        let bankPayVoucher = []
        let bankRecVoucher = []
        let cashPayVoucher = []
        let cashRecVoucher = []
        let transferVoucher = []
        let journalVoucher = []
        let settlementVoucher = []
        let creditNote = []
        let debitNote = []
        let noParty = []
        const client = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CLIENTS)
        const vendor = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_VENDORS)
        const accounts = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_ACCOUNTS, {
            headers: {
                id: Cookies.get("companyId")
            }
        })
        console.log(accounts.data.result)
        let accountsData = accounts.data.result
        let clientData = client.data.result
        let vendorData = vendor.data.result
        console.log("Client Data:", clientData)
        console.log("Vendor Data:",vendorData)
        let partyid = ""
        let partyname = ""
        let accountType = ""
        let matched = false
        let i = 0
        for(let x of data){
            matched = false
            if(x.exchangerate == 0){
                x.exchangerate = 1
            }
            switch(x.currency){
                case "PAK RUPEES":{
                    x.currency = "PKR"
                    break
                }
                case "US DOLLAR":{
                    x.currency = "USD"
                    break
                }
                case "US DOLLAR":{
                    x.currency = "USD"
                    break
                }
                case "USD":{
                    x.currency = "USD"
                    break
                }
                case "EURO":{
                    x.currency = "EUR"
                    break
                }
                case "BRITISH POUND":{
                    x.currency = "GBP"
                    break
                }
                case "CHF":{
                    x.currency = "CHF"
                    break
                }
                case null:{
                    x.currency = "PKR"
                    break
                }
                default:{
                    console.log(x.currency)
                    console.log(x)
                }
            }
            clientData.forEach((a)=>{
                if(x.accountname){
                    if(x.accountname.includes(a.name.trim())){
                        // x.partyId = a.id
                        // x.partyName = a.name
                        x.accountType = "client"
                        // matched = true
                        console.log("Found in Clients", a.name, i)
                    }
                }
            })
            if(!matched){
                vendorData.forEach((a)=>{
                    if(x.accountname){
                        if(x.accountname.includes(a.name.trim())){
                            // x.partyId = a.id
                            // x.partyName = a.name
                            x.accountType = "vendor"
                            // matched = true
                            if(a.types.includes("Agent")){
                                x.accountType = "agent"
                            }
                            console.log("Found in Vendors", a.name, i)
                        }
                    }
                })
            }
            if(!matched){
                console.log("Checking in Accounts")
                accountsData.forEach((y)=>{
                    y.Parent_Accounts.forEach((z)=>{
                        z.Child_Accounts.forEach((a)=>{
                            if(x.accountname){
                                if(a.title == x.accountname.trim()){
                                    x.partyId = a.id
                                    x.partyName = a.title
                                    if(!x.accountType){
                                        x.accountType = a.subCategory
                                    }
                                    matched = true      
                                }
                                if(x.accountname.trim() == "ROYAL AIR MARACO" && a.title == "ROYAL AIR MARACO"){
                                    x.partyId = a.id
                                    x.partyName = a.title
                                    if(!x.accountType){
                                        x.accountType = a.subCategory
                                    }
                                    matched = true
                                }
                            }
                        })
                    })
                })
            }
            !matched?console.log("Unmatched>>>", x):null
            let pushed = false
            if(x.voucher_type){

                if(x.voucher_type.includes("SALES INVOICE") && matched){
                    x.vType = "SI"
                    salesInvoices.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("PURCHASE INVOICE") && matched){
                    x.vType = "PI"
                    purchaseInvoices.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("BANK PAYMENT VOUCHER") && matched){
                    x.vType = "BPV"
                    bankPayVoucher.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("BANK RECEIPT VOUCHER") && matched){
                    x.vType = "BRV"
                    bankRecVoucher.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("CASH PAYMENT VOUCHER") && matched){
                    x.vType = "CPV"
                    cashPayVoucher.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("CASH RECEIPT VOUCHER") && matched){
                    
                    x.vType = "CRV"
                    cashRecVoucher.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("TRANSFER VOUCHER") && matched){
                    
                    x.vType = "TV"
                    transferVoucher.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("JOURNAL VOUCHER") && matched){
                    
                    x.vType = "JV"
                    journalVoucher.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("SETTLEMENT VOUCHER") && matched){
                    
                    x.vType = "SV"
                    settlementVoucher.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("CREDIT NOTE") && matched){
                    
                    x.vType = "CN"
                    creditNote.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("DEBIT NOTE") && matched){
                    
                    x.vType = "DN"
                    debitNote.push(x)
                    pushed = true
                }
                if(x.voucher_type.includes("OPENING BALANCE") && matched){
                    
                    x.vType = "OP"
                    openingBalances.push(x)
                    pushed = true
                }
            }
            if(!pushed){
                misc.push(x)
            }
            i++
        }
        setStatus("Sorted, creating Vouchers...")

        toBeUploaded.push(...bankRecVoucher)
        toBeUploaded.push(...bankPayVoucher)
        toBeUploaded.push(...salesInvoices)
        toBeUploaded.push(...purchaseInvoices)
        toBeUploaded.push(...cashPayVoucher)
        toBeUploaded.push(...cashRecVoucher)
        toBeUploaded.push(...transferVoucher)
        toBeUploaded.push(...journalVoucher)
        toBeUploaded.push(...settlementVoucher)
        toBeUploaded.push(...creditNote)
        toBeUploaded.push(...debitNote)
        toBeUploaded.push(...openingBalances)

        console.log("To be Uploaded", toBeUploaded)
        console.log("SALES INVOICE", salesInvoices)
        console.log("PURCHASE INVOICE", purchaseInvoices)
        console.log("BANK PAYMENT VOUCHER", bankPayVoucher)
        console.log("BANK RECEIPT VOUCHER", bankRecVoucher)
        console.log("CASH PAYMENT VOUCHER", cashPayVoucher)
        console.log("CASH RECEIPT VOUCHER", cashRecVoucher)
        console.log("TRANSFER VOUCHER", transferVoucher)
        console.log("JOURNAL VOUCHER", journalVoucher)
        console.log("SETTLEMENT VOUCHER", settlementVoucher)
        console.log("CREDIT NOTE", creditNote)
        console.log("DEBIT NOTE", debitNote)
        console.log("OPENING BALANCE", openingBalances)
        console.log("Unsorted", misc)
        let index = 0
        let vouchers = []
        let temp = toBeUploaded
        let bank = 0
        let count = 0
        for(let x of toBeUploaded){
            if(!x.partyName){
                // console.log("No Party>>>>>",x)
                noParty.push(x)
            }
            let Voucher_Heads = []
            let a ={}
            let voucher = {
                voucher_Id: x.voucher_no,
                CompanyId: Cookies.get("companyId"),
                costCenter: "KHI",
                type: x.voucher_type,
                vType: x.vType,
                currency: x.currency,
                voucherNarration: x.narration,
                exRate: x.exchangerate?x.exchangerate:null,
                chequeNo: x.cheque_number?x.cheque_number:null,
                payTo:"",
                partyId: x.partyId,
                partyName: x.partyName,
                partyType: x.accountType,
                createdBy: "Backup",
                Voucher_Heads:Voucher_Heads,
                createdAt: parseDateString2(x.voucher_date)
              }
            for(let y of toBeUploaded){
                if(x.voucher_no && y.voucher_no && (x.voucher_no == y.voucher_no)){
                    // console.log(y.voucher_no)
                    count++
                    a = {
                        voucher_Id: y.voucher_no,
                        defaultAmount: y.debit!=0?y.debit:y.credit,
                        amount: y.currency!="PKR"?y.debit!=0?y.debit/y.exchangerate:y.credit/y.exchangerate:y.debit!=0?y.debit:y.credit,
                        type: y.debit!=0?"debit":"credit",
                        narration: y.narration,
                        settlement: "",
                        ChildAccountId: y.partyId,
                        partyName: y.partyName,
                        accountType: y.accountType,
                        createdAt: parseDateString2(y.voucher_date)
                    };
                    // console.log(parseDateString2(y.voucher_date))
                    Voucher_Heads.push(a)
                }
            }
            voucher.Voucher_Heads = Voucher_Heads
            vouchers.push(voucher)
        }

        console.log("No Party:",noParty)

        const uniqueVouchers = vouchers.filter((voucher, index, self) =>
            index === self.findIndex((v) => v.voucher_Id === voucher.voucher_Id)
        );

        console.log(uniqueVouchers)
        setVouchers(uniqueVouchers)
        console.log("Done", count)
        setStatus("Vouchers created, waiting to upload...")
    }

    const uploadVouchers = async()=>{
        setStatus("Uploading...")
        let results = []
        for(let voucher of vouchers){
            let result = await axios.post(process.env.NEXT_PUBLIC_CLIMAX_CREATE_VOUCHER,voucher)
            // let result = await axios.post("http://localhost:8082/voucher/pushVoucehrHeads", voucher)
            results.push(result.data)
        }
        console.log(results)
        setStatus("Uploaded")
    }

    const setExRateVouchers = async() => {
        console.log("Running API")
        const invoices = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/getExRateVouchers`)
        // console.log(voucher_heads.data.result)
        // console.log(voucherData)
        // let notPresent = []
        // voucherData.forEach((x)=>{
        //     let present = false
        //     voucher_heads.data.result.forEach((y)=>{
        //         if(y.Voucher.voucher_Id == x.voucher_no){
        //             present = true
        //         }
        //     })
        //     !present?notPresent.push(x):null
        // })
        // console.log("Not Present in DB", notPresent)
        // invoices.data.result.forEach((x)=>{

        // })

        console.log(invoices)

    }
    const verifyVouchers = async() => {
        console.log("Running API")
        const invoices = await axios.get("http://localhost:8082/voucher/getAllVoucehrHeads")
        // console.log(voucher_heads.data.result)
        // console.log(voucherData)
        // let notPresent = []
        // voucherData.forEach((x)=>{
        //     let present = false
        //     voucher_heads.data.result.forEach((y)=>{
        //         if(y.Voucher.voucher_Id == x.voucher_no){
        //             present = true
        //         }
        //     })
        //     !present?notPresent.push(x):null
        // })
        // console.log("Not Present in DB", notPresent)
        // invoices.data.result.forEach((x)=>{

        // })

        console.log(invoices.data.message)

    }

    const matchInvoices = async(data, fileInfo) => {
        console.log("File Data", data)
        console.log(fileInfo)
        // return data
        let agentInvoices  = false
        data[0].agent_name?agentInvoices = true:agentInvoices = false
        setStatusInvoiceMatching("File loaded, Fetching data...")
        const invoices = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/invoiceMatching`)
        // const invoices = await axios.get("http://localhost:8082/invoice/invoiceMatching")
        setStatusInvoiceMatching("Data Fetched, Processing...")
        console.log("DB Data", invoices.data.result)
        let unmatched = []
        let unmatched1 = []
        let testing = true
        console.log("Agent Invoices: ", agentInvoices)
        if(!agentInvoices){
            data.forEach((x)=>{
                let invoiceNo = false
                let party = false
                let index = 0
                invoices.data.result.forEach((y, i)=>{
                    let check = false
                    let check1 = true
                    if(fileInfo.name.includes("PYB")){
                        if(x.bill_no == y.invoice_No && x.vendor.includes(y.party_Name)){
                            invoiceNo = true
                            party = true
                            check = true
                            index = i
                        }
                    }else{
                        if(x.invoice_no == y.invoice_No && x.client.includes(y.party_Name)){
                            invoiceNo = true
                            party = true
                            check = true
                            index = i
                        }
                    }
                    if(check){
                        if(fileInfo.name.includes("PYB")){
                            if(x.payable.toString().includes("(")||x.payable.toString().includes("-")){
                                let payable = parseFloat(x.payable.toString().replace("-","").replace("(","").replace(")","").replace(/,/g, ""))
                                if(parseFloat(y.total) != payable){
                                    check1 = false
                                }
                            }else{
                                let payable = parseFloat(x.payable.toString().replace(/,/g, ""))
                                if(parseFloat(y.total) != payable){
                                    check1 = false
                                }
                            }
                            if(x.paid.toString().includes("(")||x.paid.toString().includes("-")){
                                let paid = parseFloat(x.paid.toString().replace("-","").replace("(","").replace(")","").replace(/,/g, ""))+parseFloat(x.adjust.toString().replace("(","").replace(")","").replace(/,/g, ""))
                                if(parseFloat(y.recieved) != paid){
                                    check1 = false
                                }
                            }else{
                                let paid = parseFloat(x.paid.toString().replace("-","").replace("(","").replace(")","").replace(/,/g, ""))+parseFloat(x.adjust.toString().replace("(","").replace(")","").replace(/,/g, ""))
                                if(parseFloat(y.paid) != paid){
                                    check1 = false
                                }
                            }
                        }else{
                            if(x.receivable.toString().includes("(")||x.receivable.toString().includes("-")){
                                let receivable = parseFloat(x.receivable.toString().replace("-","").replace("(","").replace(")","").replace(/,/g, ""))
                                if(parseFloat(y.total) != receivable){
                                    check1 = false
                                }
                            }else{
                                let receivable = parseFloat(x.receivable.toString().replace(/,/g, ""))
                                if(parseFloat(y.total) != receivable){
                                    check1 = false
                                }
                            }
                            if(x.received.toString().includes("(")||x.received.toString().includes("-")){
                                let received = parseFloat(x.received.toString().replace("-","").replace("(","").replace(")","").replace(/,/g, ""))+parseFloat(x.adjust.toString().replace("(","").replace(")","").replace(/,/g, ""))
                                if(parseFloat(y.paid) != received){
                                    check1 = false
                                }
                            }else{
                                let received = parseFloat(x.received.toString().replace(/,/g, ""))+parseFloat(x.adjust.toString().replace("(","").replace(")","").replace(/,/g, ""))
                                if(parseFloat(y.recieved) != received){
                                    check1 = false
                                }
                            }
                        }
                    }
                    if(!check1){
                        unmatched.push(x)
                        console.log("Unmatched Values:", x, y )
                    }
                    // !check1?console.log("Unmatched Values:", x, y ):null
                })
                !invoiceNo?unmatched.push(`${x.invoice___bill_}, ${x.party}`):null
                !party?console.log("Party Not matched",x):null
            })
        }else{
            let unmatched = []
            let unmatched1 = []
            let amounts = []
            data.forEach((x)=>{
                // console.log(x)
                let invoiceNo = false
                let amount = false
                invoices.data.result.forEach((y)=>{
                    if(x.invoice_no == y.invoice_No && x.agent_name.includes(y.party_Name)){
                        invoiceNo = true
                        if(x.invoice_amount != parseFloat(y.total)){
                            amount = true
                        }else{
                            if(x.type_dn_cn == "Credit"){
                                if(x.rcvd_paid != parseFloat(y.paid)){
                                    amount = true
                                }
                            }else{
                                if(x.rcvd_paid != parseFloat(y.recieved)){
                                    amount = true
                                }
                            }
                        }
                    }else{
                        // console.log(x.invoice_no, x.agent, y.invoice_No, y.party_Name)
                        unmatched.push(`${x.invoice_no}, ${x.agent_name}`)
                    }
                })
                // invoiceNo?unmatched.push(`${x.invoice_no}, ${x.agent}`):null
                amount?unmatched1.push(`${x.invoice_no}, ${x.agent_name}`):null
            })
        }
        console.log(unmatched)
        console.log(unmatched1)
        setStatusInvoiceMatching("Complete, check console")
    }



    const uploadJobs = async()=>{
        //console.log(jobs)
        for(let x of jobs){
            const result = await axios.post(process.env.NEXT_PUBLIC_CLIMAX_POST_CREATE_SEAJOB, x)
            //console.log(result)
        }
    }
    

    let accountsList = {
        "Assets": [],
        "Liability": [],
        "Expense": [],
        "income": [],
        "Capital": []
    }

    let invoicewoAcc = []

    const handleCharges = async (data, fileInfo) => {
        console.log(data)
        console.log(fileInfo)
        let type = "Recievable"
        const charges = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CHARGES)
        const clients = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CLIENTS)
        const vendors = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_VENDORS)
        const invoices = await axios.get("http://localhost:8082/invoice/invoiceMatching")
        // console.log(invoices.data.result)
        let chargesHead = []
        let job = {
            jobNo: "",
            jobId: 0,
            title: null,
            shipStatus: "Booked",
            pcs: "1000",
            vol: "0",
            pol: "PKKHI",
            pod: "AEJEA",
            fd: "AEJEA",
            dg: "non-DG",
            subType: "FCL",
            shpVol: "0",
            weight: "1000",
            weightUnit: "KG",
            costCenter: "KHI",
            jobType: "Direct",
            jobKind: "Current",
            carrier: null,
            freightType: "Prepaid",
            nomination: "Free Hand",
            jobDate: "2025-01-22T12:59:09.815Z",
            shipDate: "2025-01-22T12:59:09.815Z",
            freightPaybleAt: "Karachi, Pakistan",
            companyId: "1",
            pkgUnit: "CARTONS",
            IncoTerms: "CFR",
            exRate: "1",
            approved: "false",
            cwtClient: "0",
            operation: "SE",
            createdAt: moment(),
            updatedAt: moment(),
            ClientId: 43340,
            VoyageId: 996354449746919425,
            salesRepresentatorId: "0a1d9101-0deb-426d-b833-8204cab73c13",
            overseasAgentId: null,
            localVendorId: 9325,
            customAgentId: null,
            transporterId: null,
            createdById: "4d7f7cfb-7ace-4655-b6ee-f9ed52f81799",
            commodityId: 918252774343245825,
            consigneeId: 41908,
            forwarderId: null,
            airLineId: null,
            shipperId: 40618,
            vesselId: 996352529733419009,
            shippingLineId: 9325,


        }
        data.forEach((chargeHead)=>{
            let partyType = "client"
            charges.data.result.forEach((charge)=>{
                if(chargeHead.particular == charge.name){
                    chargeHead.chargeId = charge.id
                }
            })
            clients.data.result.forEach((client)=>{
                if(chargeHead.name == client.name){
                    chargeHead.partyId = client.id
                }
            })
            if(!chargeHead.partyId){
                partyType="vendor"
                vendors.data.result.forEach((vendor)=>{
                    if(chargeHead.name == vendor.name){
                        if(vendor.types.includes("agent")){
                            partyType="agent"
                        }
                        chargeHead.partyId = vendor.id
                    }
                })
            }
            if(chargeHead.bill__invoice){
                invoices.data.result.forEach((invoice)=>{
                    if(invoice.invoice_No.trim().includes(chargeHead.bill__invoice.trim()))
                        chargeHead.invoiceId = invoice.id
                })
            }
            let charge = {
                charge: chargeHead.chargeId,
                particular: chargeHead.particular,
                invoice_id: chargeHead.bill__invoice,
                description: chargeHead.description,
                name: chargeHead.name,
                partyId: chargeHead.partyId,
                invoiceType: chargeHead.bill__invoice?chargeHead.bill__invoice.includes("JI")?"Job Invoice":chargeHead.bill__invoice.includes("JB")?"Job Bill":chargeHead.bill__invoice.includes("AI")?"Agent Invoice":chargeHead.bill__invoice.includes("AB")?"Agent Bill":null:null,
                type: type,
                basis: chargeHead.basis.includes("Unit")?"Per Unit":"Per Shipment",
                pp_cc: chargeHead.pp_cc,
                size_type: chargeHead.sizetype,
                dg_type: chargeHead.dg_non_dg=="Non DG"?"non-DG":"DG",
                qty: chargeHead.qty,
                rate_charge: chargeHead.rate,
                currency: chargeHead.currency,
                amount: chargeHead.amount,
                discount: chargeHead.discount,
                taxPerc: parseFloat(chargeHead.tax_amount)>0?(parseFloat(chargeHead.amount)/parseFloat(chargeHead.tax_amount))*100:0,
                tax_apply: chargeHead.tax_amount!=0?true:false,
                tax_amount: chargeHead.tax_amount,
                net_amount: chargeHead.net_amount,
                ex_rate: chargeHead.ex_rate,
                local_amount: chargeHead.local_amount,
                status: chargeHead.bill__invoice?"1":"0",
                approved_by: chargeHead.approved_by,
                approved_date: chargeHead.approved_date,
                partyType: partyType,
                InvoiceId: chargeHead.invoiceId
            }
            if(chargeHead.bill__invoice && chargeHead.invoiceId){
                chargesHead.push(charge)
            }else if(!chargeHead.bill__invoice){
                console.log(charge, chargeHead)
                chargesHead.push(charge)
            }
        })
        console.log(chargesHead)
    }

    return (
        <Row md={24}>
            {/* <Col md={12}>
                <div style={{overflow: 'auto', height: '87.5vh'}}>
                <span className="py-2">Chart of Accounts</span>
                <CSVReader onFileLoaded={handleData}/>
                <button onClick={uploadData} style={{maxWidth: 75}} className='btn-custom mt-3 px-3 mx-3'>Upload</button>
                <span className="py-2">Parties</span>
                <CSVReader parserOptions={parserOptions} onFileLoaded={(data, fileInfo)=>{handleDataParties(data, fileInfo)}}/>
                <button onClick={uploadDataParties}style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>Upload Parties</button>
                <button onClick={uploadDataAssociations} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>Create Party Associations</button>
                <span className="py-2">Opening Balances</span>
                <CSVReader parserOptions={parserOptions} onFileLoaded={(data, fileInfo)=>{handleOpeningBalances(data, fileInfo)}}/>
                <span className="py-2">Invoices</span>
                <CSVReader parserOptions={parserOptions} onFileLoaded={(data, fileInfo)=>{handleInvoices(data, fileInfo)}}/>
                <span
                    className="py-2"
                    style={{
                        color: statusInvoices === "Waiting for file" ? "grey" :
                            statusInvoices === "File loaded, Fetching data..." ? "orange" :
                            statusInvoices === "Data Fetched, Processing..." ? "blue" :
                            statusInvoices === "Success, see console for more details" ? "green" :
                            statusInvoices === "Uploading..." ? "blue" :
                            "red"
                    }}
                    >
                    {statusInvoices}
                </span>
                <button onClick={uploadInvoices} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>Upload Invoices</button>
                <button
                onClick={async () => {
                    try {
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/updateVouchersWithInvoices`);
                    if (response.data.status === 'success') {
                        alert('Vouchers updated successfully!');
                    } else {
                        alert('Failed to update vouchers: ' + response.data.message);
                    }
                    } catch (error) {
                    console.error('Error updating vouchers:', error);
                    alert('An error occurred while updating vouchers. Please check the console for details.');
                    }
                }}
                style={{ width: 'auto' }}
                className="btn-custom mt-3 px-3 mx-3"
                >
                Update Invoices
                </button>
                <span className="py-2">Invoice Matching, Upload grid csv</span>
                <CSVReader parserOptions={parserOptions} onFileLoaded={(data, fileInfo)=>{matchInvoices(data, fileInfo)}}/>
                <span
                    className="py-2"
                    style={{
                        color: statusInvoiceMatching === "Waiting for file" ? "grey" :
                            statusInvoiceMatching === "File loaded, Fetching data..." ? "orange" :
                            statusInvoiceMatching === "Data Fetched, Processing..." ? "blue" :
                            // statusInvoiceMatching === "Success, see console for more details" ? "green" :
                            statusInvoiceMatching === "Complete, check console" ? "green" :
                            statusInvoiceMatching === "Uploading..." ? "blue" :
                            "red"
                    }}
                    >
                    {statusInvoiceMatching}
                </span>
                <button onClick={uploadInvoices} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>Upload Invoices</button>
                <span className="py-2">Vouchers</span>
                <CSVReader parserOptions={parserOptions} onFileLoaded={(data, fileInfo)=>{handleVoucher(data, fileInfo)}}/>
                <span
                    className="py-2"
                    style={{
                        color: status === "Waiting for file" ? "grey" :
                            status === "Processing..." ? "orange" :
                            status === "Sorted, creating Vouchers..." ? "blue" :
                            status === "Vouchers created, waiting to upload..." ? "green" :
                            status === "Uploading..." ? "blue" :
                            status === "Uploaded" ? "green" :
                            "red"
                    }}
                    >
                    {status}
                </span>
                <button onClick={uploadVouchers} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>Upload Vouchers</button>
                <button onClick={verifyVouchers} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>Verify Vouchers</button>
                <button onClick={setExRateVouchers} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>Set Ex-Rate Vouchers</button>
                </div>
                <span className="py-2">Jobs</span>
                <CSVReader parserOptions={parserOptions} onFileLoaded={(data, fileInfo)=>{handleJobData(data, fileInfo)}}/>
                <button onClick={uploadJobs} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>Upload Jobs</button>
                <span className="py-2">Charges</span>
                <CSVReader parserOptions={parserOptions} onFileLoaded={(data, fileInfo)=>{handleCharges(data, fileInfo)}}/>
                <button onClick={uploadJobs} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>Upload & Link Charges</button>
            
            </Col> */}
            <Col md={12}>
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
                <button onClick={()=>{backup()}} style={{width: 'auto'}} className='btn-custom mt-3 px-3 mx-3'>1. Backup data from Climax DB</button>
            </Col>
        </Row>
    )
}

export default Upload_CoA