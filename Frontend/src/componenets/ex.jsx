<>
<div className='flex'> 
<button
      className='lg:hidden bg-slate-950 p-4 text-white fixed z-50 rounded-full'
      onClick={toggleMenu}
    >
      ☰
    </button>
    {activeMenu ?
     (<div className='bg-slate-950 w-[20%] h-screen text-white fixed'> 
     
     <ul className='flex flex-col justify-between h-[80%] text-center mt-10 '>
        <li className='hover:text-cyan-500  transition-colors duration-200 p-5 cursor-pointer ml-5 mr-5 hover:bg-slate-900 rounded-3xl '>
            <Link to='/dashboard/home'>Home</Link></li>
        <li className='hover:text-cyan-500  transition-colors duration-200 p-5 cursor-pointer  ml-5 mr-5 hover:bg-slate-900 rounded-3xl '>
            <Link to='/dashboard/tasks'>Tasks</Link>
        </li>
        <li className='hover:text-cyan-500  transition-colors duration-200 p-5 cursor-pointer  ml-5 mr-5 hover:bg-slate-900 rounded-3xl '>
            <Link to='/dashboard/calendar'>Calendar</Link>
        </li>
        <li className='hover:text-cyan-500  transition-colors duration-200 p-5 cursor-pointer  ml-5 mr-5 hover:bg-slate-900 rounded-3xl '>
            <Link to='/dashboard/connect'>Connect</Link>
        </li>
        <li className='hover:text-cyan-500  transition-colors duration-200 p-5 cursor-pointer  ml-5 mr-5 hover:bg-slate-900 rounded-3xl '>
            <Link to='/dashboard/projects'>Projects</Link>
        </li>
        <li className='hover:text-cyan-500  transition-colors duration-200 p-5 cursor-pointer  ml-5 mr-5 hover:bg-slate-900 rounded-3xl '> <SignedOut>

<SignInButton mode="modal" forceRedirectUrl="/dashboard">
<button className="bg-blue-500 text-white px-4 py-2 rounded-full transition duration-200 ease-in-out hover:bg-blue-700 active:bg-blue-900 focus:outline-none ml-2">
Sign In
</button>
</SignInButton>
</SignedOut>
<SignedIn>
<UserButton />
</SignedIn></li>
     </ul>
      </div>) : (<div> <button className='md:hidden bg-slate-950 p-4 text-white fixed z-50 rounded-full' onClick={toggleMenu}>
  ☰
  </button> </div>)}  
      
</div>


</>