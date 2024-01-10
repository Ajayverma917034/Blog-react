import React from 'react'
import pageNotFoundImage from '../imgs/404.png'
import fullLogo from '../imgs/full-logo.png'
import { Link } from 'react-router-dom'
const PageNotFound = () => {
  return (
    <section className='h-cover relative p-10 flex flex-col items-center gap-20 text-center'>
        <img src={pageNotFoundImage} alt="404page" className='select-none border-2 border-grey w-72 aspect-square object-cover rounded'/>
        <h1 className='text-4xl font-gelasio leading-7'>Page Not Found</h1>
        <p className='text-dark-grey text-xl leadding-7 -mt-8'>The page you are looking for does not exixts, Head back to the <Link to="/" className='text-black underline'>home page</Link></p>
        <div className='mt-auto'>
            <img src={fullLogo} alt="Logo" className='h-8 object-contain block mx-auto select-none'/>
            <p className='mt-5 text-dark-grey'>Read millions of stories around the world</p>
        </div>
    </section>
  )
}

export default PageNotFound