import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Disc } from 'lucide-react';

const theme = {
  bg: "bg-[#FDF8EE]",
  textDark: "text-[#5C4A3D]",
  textLight: "text-[#A88B6E]",
  primary: "bg-[#F4B976]",
  primaryHover: "hover:bg-[#EAA962]",
  inputBorder: "border-[#E5D4C3]",
};

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center p-6 relative overflow-hidden font-sans`}>
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#F4B976]/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 flex flex-col h-full mt-12">
        <button onClick={() => navigate('/')} className={`${theme.textDark} mb-8 hover:opacity-70 transition-opacity w-fit`}>
          <ArrowLeft size={28} />
        </button>

        <div className="mb-10 text-center">
          <h1 className={`text-3xl font-bold ${theme.textDark} mb-2`}>Sign Up</h1>
          <p className={theme.textLight}>Create your team's workspace</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <User className={theme.textLight} size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Full Name" 
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} placeholder-[#C0AFA0] transition-colors`}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail className={theme.textLight} size={20} />
            </div>
            <input 
              type="email" 
              placeholder="Email address" 
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} placeholder-[#C0AFA0] transition-colors`}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Disc className={theme.textLight} size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Organization Name" 
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} placeholder-[#C0AFA0] transition-colors`}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Lock className={theme.textLight} size={20} />
            </div>
            <input 
              type="password" 
              placeholder="Password" 
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} placeholder-[#C0AFA0] transition-colors`}
            />
          </div>

          <button className={`w-full py-4 mt-4 rounded-full ${theme.primary} ${theme.primaryHover} text-white font-bold text-lg transition-all shadow-lg shadow-orange-200/50 active:scale-95`}>
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
}