import React from 'react'
import { Link } from 'react-router-dom'

const UserCard = ({user}) => {
    let {personal_info: {fullname, username, profile_img}} = user
  return (
    <Link to={`/user/${username}`} className='flex gap-5 items-center mb-5'>
        <img src={profile_img} alt={username} className='w-14 h-15 rounded-full ' />
        <div>
           <h1 className='font-medium text-xl line-clamp-2'>{fullname}</h1> 
           <p className='text-dark-grey'>@{username}</p>
        </div>
    </Link>
  )
}

export default UserCard