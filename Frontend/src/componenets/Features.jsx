import React, { useState } from 'react'
import image from '../assets/image.png'

function Features() {
  const [activeCard, setActiveCard] = useState(0);
  const [hoverStats, setHoverStats] = useState(null);

  const features = [
    { icon: "📋", title: "Task Management", desc: "Organize and track your tasks efficiently" },
    { icon: "👥", title: "Team Collaboration", desc: "Work together seamlessly with your team" },
    { icon: "📊", title: "Progress Tracking", desc: "Monitor project progress in real-time" },
    { icon: "🎯", title: "Goal Setting", desc: "Set and achieve your project milestones" },
    { icon: "⚡", title: "Fast Performance", desc: "Lightning-fast task execution and updates" },
    { icon: "🔒", title: "Secure & Private", desc: "Your data is protected with enterprise security" }
  ];

  const stats = [
    { number: "500+", label: "Tasks Completed", color: "text-green-400" },
    { number: "50+", label: "Active Projects", color: "text-blue-400" },
    { number: "20+", label: "Team Members", color: "text-purple-400" },
    { number: "99%", label: "Success Rate", color: "text-yellow-400" }
  ];

  return (
    <div className='w-full min-h-screen relative py-20 '>
      {/* Background image with margin and shadow */}
      <div 
        className="absolute inset-8 bg-cover bg-center bg-no-repeat rounded-3xl shadow-2xl"
        style={{ backgroundImage: `url(${image})` }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 rounded-3xl"></div>
        
        {/* Left edge gradient */}
        <div className="absolute top-0 left-0 bottom-0 w-64 bg-gradient-to-r from-sky-400/70 via-teal-600/30 to-transparent rounded-l-3xl"></div>
      </div>
      
      <div className="relative z-10">
        <h1 className='text-center font-bold text-4xl md:text-5xl m-10 text-white drop-shadow-lg'>
          ✨ Amazing Features
        </h1>
        
        {/* Interactive Feature Cards */}
        <div className="w-full max-w-7xl mx-auto px-5 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20 ${
                  activeCard === index ? 'ring-2 ring-white/50 bg-white/20' : ''
                }`}
                onClick={() => setActiveCard(index)}
                onMouseEnter={() => setActiveCard(index)}
              >
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2 text-center">{feature.title}</h3>
                <p className="text-white/80 text-sm text-center">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

       

        {/* Interactive Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-5">
        
        </div>
      </div>
    </div>
  );
}

export default Features;