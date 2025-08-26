import React from 'react'
import image1 from '../assets/image1.png'
import image2 from '../assets/image2.png'
import image3 from '../assets/image3.png'

function Hero() {
  return (
    <>
    <style jsx>{`
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .moving-gradient-text {
        background: linear-gradient(-45deg, #4f46e5, #06b6d4, #3b82f6, #8b5cf6);
        background-size: 400% 400%;
        animation: gradient-shift 3s ease infinite;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        text-fill-color: transparent;
      }
    `}</style>
    
    {/* Navigation Bar */}
    <nav className="w-full bg-white shadow-sm py-4 px-6 flex justify-between items-center relative z-30">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-indigo-600 rounded mr-3"></div>
        <span className="text-xl font-bold text-gray-800">TaskSphere</span>
      </div>
      <div className="hidden md:flex space-x-8">
        <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Home</a>
        <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">About us</a>
        <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
        <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
        <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact</a>
      </div>
      <button className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors">
        Get Started
      </button>
    </nav>

    {/* Hero Section */}
    <div className='w-full min-h-[90vh] bg-white flex items-center relative overflow-hidden '>
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-100 rounded-full opacity-20"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-blue-100 rounded-full opacity-30"></div>
      
      {/* Gradient overlay at the bottom */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-48  bg-gradient-to-t from-sky-600/50 via-purple-500/30 to-transparent"></div> */}
      
      <div className='max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10'>
        {/* Left Content */}
        <div className='space-y-8'>
          <h1 className='font-bold text-5xl lg:text-6xl text-gray-800 leading-tight'>
            TASK
            <br />
            <span className="moving-gradient-text">MANAGEMENT</span>
            <br />
            PLATFORM
          </h1>
          <p className='text-lg text-gray-600 leading-relaxed max-w-lg'>
            Streamline your workflow and boost productivity with our comprehensive task management solution. Collaborate seamlessly with your team and achieve your goals faster.
          </p>
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            More Info
          </button>
        </div>

        {/* Right Illustration */}
        <div className='relative'>
          {/* Floating Device Mockups - Outside the blue container */}
          {/* Mobile Phone - Left Side */}
          <div className="absolute -left-20 top-8 z-30 transform rotate-12 hover:rotate-6 transition-transform duration-300">
            <div className="w-40 h-64 bg-white rounded-3xl shadow-2xl p-3 relative">
              <img 
                src={image1} 
                alt="Mobile App Interface" 
                className="w-full h-full object-cover rounded-2xl"
              />
              {/* Phone frame details */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-gray-300 rounded-full"></div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-gray-300 rounded-full"></div>
            </div>
          </div>

          {/* Desktop/Tablet Screen - Right Side */}
          <div className="absolute -right-24 top-4 z-30 transform -rotate-12 hover:-rotate-6 transition-transform duration-300">
            <div className="w-60 h-40 bg-white rounded-xl shadow-2xl p-3 relative">
              <img 
                src={image2} 
                alt="Desktop Dashboard" 
                className="w-full h-full object-cover rounded-lg"
              />
              {/* Screen frame */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-3 bg-gray-800 rounded-b-xl"></div>
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-600 rounded-full"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-rose-200 rounded-3xl p-8 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-white/10 rounded-3xl"></div>
            
            {/* Third Device - Center of the box */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 rotate-3 hover:rotate-1 transition-transform duration-300">
              <div className="w-48 h-36 bg-white rounded-xl shadow-2xl p-2 relative">
                <img 
                  src={image3} 
                  alt="Additional Interface" 
                  className="w-full h-full object-cover rounded-lg"
                />
                {/* Tablet frame */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-gray-300 rounded-full bg-white"></div>
              </div>
            </div>
            
            {/* Team illustration */}
            <div className="relative z-10 h-96 flex items-center justify-center">
              <div className="text-center space-y-4">
                {/* Person 1 - Standing */}
                <div className="flex justify-center mb-8 -mt-16">
                  <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl">👨‍💼</span>
                  </div>
                </div>
                
                {/* Desk scene */}
                <div className="flex justify-center items-end space-x-6">
                  {/* Person 2 - Sitting */}
                  <div className="w-18 h-18 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">👨‍💻</span>
                  </div>
                  
                  {/* Desk */}
                  <div className="w-32 h-4 bg-gray-300 rounded"></div>
                  
                  {/* Person 3 - Sitting */}
                  <div className="w-18 h-18 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl">👩‍💻</span>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute top-8 left-8 w-16 h-12 bg-white/30 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-lg">📊</span>
                </div>
                <div className="absolute top-16 right-12 w-14 h-14 bg-white/30 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg">⚙️</span>
                </div>
                <div className="absolute bottom-24 right-8 w-18 h-10 bg-white/30 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-lg">💬</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Hero