import React from 'react'
import image from '../assets/image.png'
import { FaMarker } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaCommentDots } from "react-icons/fa";
import { FaLayerGroup } from "react-icons/fa";
import {ClerkLoading, useUser} from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

const Sidebar = () => {

    const {user} = useUser();

    useEffect(() => {
      if (user) {
        // Just log user data to confirm you're retrieving it:
        console.log("User ID:", user.id);
        console.log("User Email:", user.primaryEmailAddress?.emailAddress);
        console.log(user.username)
  
        // If you had a backend, you'd send data like this:
        // fetch('/api/storeUser', {...})
      }
    }, [user]);
  
    const SIDEBAR_LINKS =[
        
        {id:1, name:'Tasks', link:'/dashboard/tasks', icon: FaMarker},
        {id:2, name:'Calendar', link:'/dashboard/calendar', icon: FaCalendarAlt},
        {id:3, name:'Connect', link:'/dashboard/connect', icon: FaCommentDots},
        {id:4, name:'Projects', link:'/dashboard/projects', icon: FaLayerGroup},
    ]



  return (
   <>
   <div 
     className="hidden md:block md:w-56 h-screen fixed z-10 left-0 top-0 p-4 bg-cover bg-center bg-no-repeat"
     style={{ backgroundImage: `url(${image})` }}
   >
     {/* Dark overlay for better text readability */}
     <div className="absolute inset-0"></div>
     
     <div className='flex items-center mb-8 relative z-10 pb-4 border-b border-white/20'>
    <img src="https://previews.123rf.com/images/michaelrayback/michaelrayback1601/michaelrayback160100015/51893048-colorful-logo-geometric-icon-technology-logo-web-net-logo-icon-geometric-logo-company-logo.jpg" className='rounded-full w-[40px] h-[40px] border-2 border-white/30 shadow-lg' alt="TaskSphere Logo" />
    <h1 className='ml-3 hidden md:block text-lg font-bold text-white drop-shadow-lg'>TaskSphere</h1>
   </div>

   <ul className="relative z-10 space-y-2">
  {SIDEBAR_LINKS.map((link, index) => (
    <li key={link.id} className="group">
      <Link to={link.link} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-sm border border-transparent hover:border-white/20 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
        <span className="text-white/80 group-hover:text-white transition-colors duration-300">
          <link.icon size={20}/>
        </span>
        <span className='hidden md:block text-white/90 group-hover:text-white font-medium transition-colors duration-300'>
          {link.name}
        </span>
      </Link>
    </li>
  ))}
  
  {/* User Authentication Section */}
  <li className='mt-8 pt-4 border-t border-white/20'>
    <SignedOut>
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
          <span className="hidden md:block">Sign In</span>
          <span className="md:hidden">⚡</span>
        </button>
      </SignInButton>
    </SignedOut>
    <SignedIn>
      <div className="flex items-center justify-center md:justify-start p-2">
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-10 h-10 rounded-xl shadow-lg border-2 border-white/30"
            }
          }}
        />
        <span className="hidden md:block ml-3 text-white/90 font-medium">Profile</span>
      </div>
    </SignedIn>
  </li>
</ul>
</div>
   </>
  )

}

export default Sidebar