
import { useState } from 'react'
import {useNavigate} from "react-router-dom"
import { Navigate } from "react-router-dom";
import {toast} from "sonner";
import {useAuth} from "../context/AuthContext.jsx"
import api from "../api/axios.js"
import { Link } from "react-router-dom";

const Login = () => {

  const navigate=useNavigate();

  const {setUser,setAccessToken,isInitializing,user}=useAuth();

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);



  async function handleSubmit(event){

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response=await api.post("/auth/login",{
        email,password
      })

      


      if(response.data.success){

        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
        toast.success("Login successful");
        navigate("/dashboard");
      }

      console.log(response.data)
      console.log("Login response",response.data,response.data.success)
      
    } catch (err) {

    console.log(err.response.data)

      toast.error(
    err.response?.data?.message ||
    err.message ||
    "Login failed. Please try again."
  );
    }
    finally{
      setLoading(false)
    }



  }

  if (isInitializing) {
  return <p className="p-6">Checking your session...</p>;
}
if (user) {
  return <Navigate to="/dashboard" replace />;
}

  return (
   
<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
  <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
    
    <form onSubmit={handleSubmit}
    className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          type="email" 
          value={email}
          onChange={(event)=>setEmail(event.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(event)=>setPassword(event.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">Forgot password?</a>
      </div>

     

      <button type="submit" disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors">
       {loading ? "Signing in" : "Sign in"}
      </button>
    </form>

    <div className="mt-6 text-center text-sm text-gray-600">
      Don't have an account? 
     <Link
  to="/register"
  className="text-indigo-600 hover:text-indigo-500 font-medium"
>
  Sign up
</Link>
    </div>
  </div>
</div>
  )
}

export default Login
