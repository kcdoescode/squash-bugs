import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Disc, KeyRound, Building2 } from 'lucide-react';

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
  
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    inviteCode: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, mode }), // Send the mode to the backend
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center p-6 relative overflow-hidden font-sans`}>
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#F4B976]/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10 flex flex-col h-full mt-8">
        <button onClick={() => navigate('/')} className={`${theme.textDark} mb-6 hover:opacity-70 transition-opacity w-fit`}>
          <ArrowLeft size={28} />
        </button>

        <div className="mb-8 text-center">
          <h1 className={`text-3xl font-bold ${theme.textDark} mb-2`}>Sign Up</h1>
          <p className={theme.textLight}>Join your team to squash bugs</p>
        </div>

        {/* Toggle Mode Buttons */}
        <div className="flex bg-[#E5D4C3]/30 rounded-full p-1 mb-6">
            <button 
                onClick={() => setMode('create')}
                className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${mode === 'create' ? 'bg-white text-[#F4B976] shadow-sm' : `${theme.textLight} hover:text-[#5C4A3D]`}`}
            >
                Create Workspace
            </button>
            <button 
                 onClick={() => setMode('join')}
                 className={`flex-1 py-2 rounded-full font-bold text-sm transition-all ${mode === 'join' ? 'bg-white text-[#F4B976] shadow-sm' : `${theme.textLight} hover:text-[#5C4A3D]`}`}
            >
                Join Workspace
            </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center font-bold">{error}</div>}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <User className={theme.textLight} size={20} />
            </div>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} required
              placeholder="Full Name" 
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark}`}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail className={theme.textLight} size={20} />
            </div>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} required
              placeholder="Email address" 
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark}`}
            />
          </div>

          {/* Conditional Input based on mode */}
          {mode === 'create' ? (
              <div className="relative animate-in fade-in slide-in-from-bottom-2">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Building2 className={theme.textLight} size={20} />
                </div>
                <input 
                type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} required={mode==='create'}
                placeholder="Organization Name" 
                className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark}`}
                />
            </div>
          ) : (
             <div className="relative animate-in fade-in slide-in-from-bottom-2">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <KeyRound className={theme.textLight} size={20} />
                </div>
                <input 
                type="text" name="inviteCode" value={formData.inviteCode} onChange={handleChange} required={mode==='join'}
                placeholder="6-Digit Invite Code" 
                className={`w-full pl-12 pr-5 py-4 bg-white/50 border-2 border-dashed border-[#F4B976]/50 rounded-full focus:outline-none focus:border-solid focus:border-[#F4B976] ${theme.textDark} font-mono uppercase tracking-widest`}
                />
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Lock className={theme.textLight} size={20} />
            </div>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
              placeholder="Password" 
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark}`}
            />
          </div>

          <button type="submit" className={`w-full py-4 mt-6 rounded-full ${theme.primary} ${theme.primaryHover} text-white font-bold text-lg transition-all shadow-lg active:scale-95`}>
            {mode === 'create' ? 'Create Workspace' : 'Join Team'}
          </button>
        </form>
      </div>
    </div>
  );
}