import React, { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { HiOutlineMenu, HiX } from 'react-icons/hi'

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <div className='w-full h-15 bg-white/50 backdrop-blur-xl text-stone-900 fixed z-50'>
      <ul className='flex flex-row items-center justify-between px-3'>
        <li className='m-2 font-bold'>TaskSphere</li>
        {/* Desktop nav links */}
        <li className='hidden md:flex gap-4 items-center'>
          <Link to='/dashboard/tasks' className='hover:underline'>Tasks</Link>
          <Link to='/dashboard/calendar' className='hover:underline'>Calendar</Link>
          <Link to='/dashboard/connect' className='hover:underline'>Connect</Link>
          <Link to='/dashboard/projects' className='hover:underline'>Projects</Link>
        </li>
        <li className='flex items-center gap-2'>
          <SignedOut>

            <SignInButton mode="modal" forceRedirectUrl="/dashboard/tasks">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-full transition duration-200 ease-in-out hover:bg-blue-700 active:bg-blue-900 focus:outline-none ml-2">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          {/* Mobile menu button */}
          <button className='md:hidden p-2' aria-label='Menu' onClick={() => setOpen(v => !v)}>
            {open ? <HiX size={24} /> : <HiOutlineMenu size={24} />}
          </button>
        </li>
      </ul>
      {/* Mobile dropdown */}
      {open && (
        <div className='md:hidden bg-white/90 backdrop-blur-xl border-t shadow-sm'>
          <nav className='flex flex-col p-3 gap-2'>
            <Link to='/dashboard/tasks' onClick={() => setOpen(false)} className='py-2 px-2 rounded hover:bg-gray-100'>Tasks</Link>
            <Link to='/dashboard/calendar' onClick={() => setOpen(false)} className='py-2 px-2 rounded hover:bg-gray-100'>Calendar</Link>
            <Link to='/dashboard/connect' onClick={() => setOpen(false)} className='py-2 px-2 rounded hover:bg-gray-100'>Connect</Link>
            <Link to='/dashboard/projects' onClick={() => setOpen(false)} className='py-2 px-2 rounded hover:bg-gray-100'>Projects</Link>
          </nav>
        </div>
      )}
    </div>
  )
}

export default Navbar