import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc, LogOut } from 'lucide-react';

const theme = {
  bg: "bg-[#FDF8EE]",
  textDark: "text-[#5C4A3D]",
  textLight: "text-[#A88B6E]",
  primary: "bg-[#F4B976]",
  cardBg: "bg-white/40",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Check for the VIP token when the page loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      // If no token, kick them back to login
      navigate('/login');
    } else if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null; // Prevent flicker while checking token

  return (
    <div className={`min-h-screen ${theme.bg} font-sans p-6`}>
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${theme.primary} text-white`}>
            <Disc size={24} />
          </div>
          <h1 className={`text-2xl font-bold ${theme.textDark}`}>Squash Bugs</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`font-medium ${theme.textDark}`}>Hi, {user.name}</span>
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#E5D4C3] ${theme.textDark} hover:bg-white transition-colors`}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Workspace Area */}
      <div className={`w-full h-[70vh] ${theme.cardBg} backdrop-blur-sm p-8 rounded-[2rem] shadow-xl shadow-[#E5D4C3]/50 border border-white/50 flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${theme.textDark} mb-2`}>Your Workspace is Empty</h2>
          <p className={theme.textLight}>We will build the bug tracking board here next!</p>
        </div>
      </div>
    </div>
  );
}