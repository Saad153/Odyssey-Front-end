import axiosClient from "./axiosClient";

export function getVoucherById({id}) {
    console.log("Function>>", id)
    return axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_VOUCHER_BY_ID, { 
        headers:{ "id": `${id}` }
    }).then((x)=>{
        // console.log(">>>>>>>", x.data.result)
        return x.data.result
    });
}
