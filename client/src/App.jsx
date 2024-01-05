import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";

export const UserContext = createContext({})
const App = () => {
    const [userAuth, setUserAuth] = useState({})

    useEffect(()=>{
        let userInSession = lookInSession("user")
        userInSession ? setUserAuth(JSON.stringify(userInSession)) : setUserAuth({access_token: null})
    },[])
    return (    
        <UserContext.Provider value={{userAuth, setUserAuth}}>
            <Routes>
                <Route path="/editor" element={<Editor/>}/>
                <Route path="/" element={<Navbar/>}>
                    <Route path="signin" element={<UserAuthForm type="sign-in"/>}/>
                    <Route path="signup" element={<UserAuthForm type="sign-up"/>}/>
                </Route>
            </Routes>
        </UserContext.Provider>
    )
}

export default App;