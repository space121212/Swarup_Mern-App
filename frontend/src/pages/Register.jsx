
import {toast} from "sonner";
import api from "../api/axios.js"
import {Link,useNavigate} from "react-router-dom";

import { useState } from 'react'


const Register = () => {
   const navigate=useNavigate();

  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);



  async function handleSubmit(event){

   event.preventDefault();

   
   setLoading(true);

   try {

      const response=await api.post("/auth/register",{
         name,email,password
      })
      toast.success("Sign Up Successfull");
      navigate("/login");
      console.log("Register successful",response.data)
      
   } 
      
   catch (err) {
      console.log(err.response.data)
  const errors = err.response?.data?.error;

  if (Array.isArray(errors)) {
    errors.forEach((error) => toast.error(error.message));
  } else {
    toast.error(err.response?.data?.message || "Registration failed");
  }
}
   

   finally{

      setLoading(false);
         
      }

   




  }

  


  return (
    <main className="px-4 md:px-8 min-h-screen flex flex-col items-center justify-center">
   <div className="max-w-md w-full">
      <div
         className="p-6 rounded-lg bg-white border border-slate-300 shadow-xs md:p-6 dark:bg-neutral-800 dark:border-neutral-700">
         <h1 className="text-slate-900 text-center text-2xl font-bold dark:text-slate-50">Create an account</h1>

         <form onSubmit={handleSubmit}  className="space-y-6 mt-10">


             <div>
               <label htmlFor="name"
               
                  className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Name</label>
               <input 
               value={name}
               onChange={(event)=>setName(event.target.value)}
                type="text" id="name" name="name" placeholder="Type Your Name...." required
                  className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600" />
            </div>
            <div>
               <label htmlFor="email"
              
                
                  className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Email</label>
               <input value={email}
               onChange={(event)=>setEmail(event.target.value)}
               type="email" id="email" name="email" placeholder="john@readymadeui.com" required
                  className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600" />
            </div>
            <div>
               <label htmlFor="password"
               
                  className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Password</label>
               <input value={password}
               onChange={(event)=>setPassword(event.target.value)} 
               type="password" id="password" name="password" placeholder="••••••••" required
                  className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600" />
            </div>
           

           

            <button type="submit" disabled={loading}
               className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
               {loading ? "Signing up..."  : "Create an account"}</button>
         </form>

         <div className="mt-6 text-slate-900 text-sm text-center dark:text-slate-50">Already have an account? 
            <Link to="/login" className="text-blue-700 hover:underline ml-1 font-medium">Login Here</Link>
         </div>
      </div>
   </div>
</main>
  )
}

export default Register
