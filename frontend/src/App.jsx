import {BrowserRouter,Routes,Route,Navigate} from "react-router-dom";
import Login from './pages/Login'
import Dashboard from "./pages/Dashboard"
import Register from "./pages/Register";
import Tasks from "./pages/Tasks"
import Profile from "./pages/Profile";

import TaskDetail from "./pages/TaskDetail";

import ProtectedRoute from "./components/ProtectedRoute"

import { AuthProvider} from "./context/AuthContext"

import {Toaster} from "sonner";
import './App.css'
import Projects from "./pages/Projects";
import Members from "./pages/Members";


function App() {
  

  return (
    <AuthProvider>
    <BrowserRouter>
     <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register />} />

        
        



        <Route element={<ProtectedRoute/>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/organisations/:organizationId/projects/:projectId/tasks/:taskId" element={<TaskDetail/>}/>
        <Route path="/members" element={<Members/>}/>
        
        </Route>

   
   
      </Routes>
    </BrowserRouter>
    </AuthProvider>
    
  )
}

export default App
