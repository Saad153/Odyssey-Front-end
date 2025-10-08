import Cookies from "js-cookie";
import jwt_decode from 'jwt-decode';

function checkEditAccess(){

    let token = null;
    let firstCall
  if(Cookies.get("token") != null && Cookies.get("token") != "" && Cookies.get("token") != "undefined"){
    let tempToken = Cookies.get('token');
    firstCall = false;
    if(tempToken == Cookies.get('token')){
      token = jwt_decode(Cookies.get("token"));
      // console.log(token.access) 
    }else{
      logout();
    }
  }else if(!firstCall){
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
    if(x == 'admin' || x == 'Edit'){
      // console.log("Edit triggered")
      access = true
    }
   
  })
    
  return access
}

export { checkEditAccess }