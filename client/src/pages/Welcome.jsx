import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc } from 'lucide-react';

const theme = {
  bg: "bg-[#FDF8EE]",
  textDark: "text-[#5C4A3D]",
  textLight: "text-[#A88B6E]",
  primary: "bg-[#F4B976]",
  primaryHover: "hover:bg-[#EAA962]",
  cardBg: "bg-white/40",
};

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center relative overflow-hidden font-sans`}>
      <div className="absolute top-0 left-0 w-full h-64 bg-[#F4B976]/20 rounded-b-[100%] -translate-y-32 scale-150"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E5C9A8]/30 rounded-full translate-x-32 translate-y-32"></div>

      <div className="relative z-10 flex flex-col items-center p-8 w-full max-w-md">
        <div className="mb-12 flex flex-col items-center">
          <div className={`p-4 rounded-full ${theme.primary} text-white mb-4 shadow-lg shadow-orange-200/50`}>
            <Disc size={48} />
          </div>
          <h1 className={`text-4xl font-bold ${theme.textDark} tracking-tight`}>Squash Bugs</h1>
          <p className={`${theme.textLight} mt-2 font-medium tracking-widest uppercase text-sm`}>Workspace</p>
        </div>

        <div className={`w-full ${theme.cardBg} backdrop-blur-sm p-8 rounded-[2rem] shadow-xl shadow-[#E5D4C3]/50 border border-white/50 text-center`}>
          <h2 className={`text-3xl font-bold ${theme.textDark} mb-2`}>Welcome!</h2>
          <p className={`${theme.textLight} mb-8`}>Squash bugs in style. Login or create a workspace to get started.</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={() => navigate('/login')}
              className={`flex-1 py-4 rounded-full ${theme.primary} ${theme.primaryHover} text-white font-bold transition-all shadow-md active:scale-95`}
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className={`flex-1 py-4 rounded-full bg-white text-[#F4B976] border-2 border-[#F4B976] hover:bg-[#FFFDF9] font-bold transition-all shadow-md active:scale-95`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}