import { setAccesLevels } from '/functions/setAccesLevels';
import { logout } from '/functions/logout';
import Cookies from "js-cookie";
import jwt_decode from 'jwt-decode';

function checkEmployeeAccess(){

    let token = null;
    let firstCall1 = false;
  if(Cookies.get("token") != null && Cookies.get("token") != "" && Cookies.get("token") != "undefined"){
    let tempToken = Cookies.get('token');
    if(tempToken == Cookies.get('token')){
      token = jwt_decode(Cookies.get("token"));
      // console.log(token.access) 
    }else{
      logout();
    }
  }else if(!firstCall1){
    logout();
  }

  let levels = null;
  if(token != null){
    levels = token.access;
  }

  let access = false;
  let newTemp = [];
  if(levels.length > 0){
    levels.split(",").forEach((x)=>{
      newTemp.push(x)
    })

  }
  newTemp.forEach((x)=>{
    x = x.trim()
    if(x == 'admin'){
      // console.log("admin triggered")
      access = true;
      // console.log(access);
    }

   
  })
  
  

  return access
}

export { checkEmployeeAccess }