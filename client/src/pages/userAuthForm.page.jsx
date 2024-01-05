import { useContext, useRef } from "react"
import AnimationWrapper from "../common/page-animation"
import InputBox from "../components/input.component"
import googleIcon from '../imgs/google.png'
import {Link, Navigate} from 'react-router-dom'
import {Toaster ,toast} from 'react-hot-toast'
import axios from 'axios'
import { storeInSession } from "../common/session"
import { UserContext } from "../App"
import { authWithGoogle } from "../common/firebase"

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const UserAuthForm = ({type})=>{
    let {userAuth: {access_token}, setUserAuth} = useContext(UserContext)
    const userAuthThroughServer = (serverRoute,formData )=>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData).then(({data})=>{
            storeInSession("user", JSON.stringify(data))
            
            setUserAuth(data)
        }).catch(({response}) =>{
            toast.error(response.data.error )
        })
    }
    
    const handleSubmit = (e) =>{
        e.preventDefault();
        let serverRoute = type === 'sign-in' ? '/signin' : '/signup'
        let form = new FormData(formElement)
        let formData = {};
        for (let [key, val] of form.entries()){
            formData[key] = val
        }
        // form validation
        let {fullname, email, password} = formData;
        if(fullname && fullname.length < 3)
            return toast.error( "Full name must be 3 letters long")
        if(!email.length)
            return toast.error( "Enter email")

        if(!emailRegex.test(email)){
            return toast.error( "Email is invalid")
        }
        if(!passwordRegex.test(password)){
            return toast.error( 'password should be 6 to 20 characters long with a numeric, 1 uppercase and 1 lowercase lettes')
        }

        userAuthThroughServer(serverRoute, formData)
    }

    const handleGoogleAuth = (e) =>{
        e.preventDefault()
        authWithGoogle().then((user)=>{
            let serverRoute = "/google-auth"
            let formData = {
                access_token: user.accessToken
            }
            userAuthThroughServer(serverRoute, formData)
        }).catch((err)=>{
            toast.error('Trouble login through Google')
            return console.log(err)
        })
    }
    return (
        access_token ? 
        <Navigate to='/'/>
        :
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center">
                <Toaster/>
                <form id="formElement" className="w-[80%] max-w-[400px]">
                    <h1 className="text-4xl font-gelasio capitalize text-center mb-24">{type === "sign-in" ? "Welcome Back" : "Join us today"}
                    </h1>

                    {
                        type !== "sign-in" ? 
                        <InputBox name="fullname" type="text" placeholder="Full Name" icon="fi-rr-user"/> : ""
                    }
                    <InputBox name="email" type="email" placeholder="Email" icon="fi-rr-envelope" />
                    <InputBox name="password" type="password" placeholder="Password" icon="fi-rr-key" />

                    <button className="btn-dark center mt-14" type="submit" onClick={handleSubmit}>
                        {type.replace("-", " ")}
                    </button>

                    <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                        <hr className="w-1/2 border-black"/>
                        <p>Or</p>
                        <hr className="w-1/2 border-black"/>
                    </div>
                    <button onClick={handleGoogleAuth} className="btn-dark flex items-center justify-center gap-4 w-[90%] center">
                        <img src={googleIcon} alt="googleImg" className="w-4"/>
                        Continue with google</button>
                    {
                        type === "sign-in"? 
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Don't have and account ?
                            <Link to="/signup" className="underline text-black text-xl ml-1">Join us Now</Link>
                        </p>
                        :
                        <p className="mt-6 text-dark-grey text-xl text-center">
                            Already a member ?
                            <Link to="/signin" className="underline text-black text-xl ml-1">Sign in here</Link>
                        </p>

                    }
                </form>
            </section>  
        </AnimationWrapper>
    )
}

export default UserAuthForm