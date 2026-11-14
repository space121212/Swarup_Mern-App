import { useAuth } from "../context/AuthContext";
import {Navigate,Outlet} from "react-router-dom"



export function ProtectedRoute(){

    const {user,isInitializing}=useAuth();


    if(isInitializing){
        return <p>Session checking......</p>
    }


    if(!user){
        return <Navigate to="/login" replace/>
    }

    return <Outlet/>



}

export default  ProtectedRoute;