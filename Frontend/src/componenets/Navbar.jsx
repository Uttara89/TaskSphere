import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

function Navbar() {
  return (
    <div className='w-full h-15 bg-white/50 backdrop-blur-xl text-stone-900 fixed z-50'>
      <ul className='flex flex-row justify-between '>
        <li className='m-2'>TaskSphere</li>
        <li className='mt-2 mr-2'>
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
        </li>
      </ul>
    </div>
  )
}

export default Navbar