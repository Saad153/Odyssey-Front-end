import Cookies from "js-cookie";
import jwt_decode from 'jwt-decode';
import logout from './logout';

function checkEditAccess(){

    let token = null;
  if(Cookies.get("token") != null && Cookies.get("token") != "" && Cookies.get("token") != "undefined"){
    let tempToken = Cookies.get('token');
    if(tempToken == Cookies.get('token')){
      token = jwt_decode(Cookies.get("token"));
      // console.log(token.access) 
    }else{
      logout();
    }
  }else{
    return false;
  }

  let levels = null;
  if(token != null){
    levels = token.access;
  }

  let access = false;
  if(levels && typeof levels === 'string' && levels.length > 0){
    const accessArray = levels.split(",").map(x => x.trim());
    accessArray.forEach((x)=>{
      if(x === 'admin' || x === 'Edit'){
        // console.log("Edit triggered")
        access = true
      }
    })
  }
    
  return access
}

export { checkEditAccess }