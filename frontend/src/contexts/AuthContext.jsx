import {createContext,useContext,useEffect,useState} from "react";
import {authService} from "../services/authService.js";
const AuthContext=createContext(null);
export function AuthProvider({children}){const [user,setUser]=useState(()=>authService.getUser());useEffect(()=>{},[]);const login=async data=>{const next=await authService.login(data);setUser(next);return next};const logout=()=>{authService.logout();setUser(null)};return <AuthContext.Provider value={{user,login,logout}}>{children}</AuthContext.Provider>}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used within AuthProvider");return value}
