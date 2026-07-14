import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

const theme = {
  bg: "bg-[#FDF8EE]",
  textDark: "text-[#5C4A3D]",
  textLight: "text-[#A88B6E]",
  primary: "bg-[#F4B976]",
  primaryHover: "hover:bg-[#EAA962]",
  inputBorder: "border-[#E5D4C3]",
};

export default function Login() {
  const navigate = useNavigate();
  
  // 1. State for inputs and errors
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // 2. Handle typing
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit credentials to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Save token and redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        alert('Welcome back to your workspace!');
        navigate('/dashboard');
      } else {
        // Show error (e.g., "Invalid email or password")
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center p-6 relative overflow-hidden font-sans`}>
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#F4B976]/20 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10 flex flex-col h-full mt-12">
        <button onClick={() => navigate('/')} className={`${theme.textDark} mb-8 hover:opacity-70 transition-opacity w-fit`}>
          <ArrowLeft size={28} />
        </button>

        <div className="mb-10 text-center">
          <h1 className={`text-3xl font-bold ${theme.textDark} mb-2`}>Welcome back.</h1>
          <p className={theme.textLight}>Login to your workspace</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {error && <div className="text-red-500 text-sm text-center font-bold">{error}</div>}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail className={theme.textLight} size={20} />
            </div>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address" 
              required
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} placeholder-[#C0AFA0] transition-colors`}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Lock className={theme.textLight} size={20} />
            </div>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password" 
              required
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} placeholder-[#C0AFA0] transition-colors`}
            />
          </div>

          <div className="flex justify-end px-2">
            <a href="#" className={`text-sm font-medium ${theme.textLight} hover:${theme.textDark}`}>Forgot password?</a>
          </div>

          <button type="submit" className={`w-full py-4 mt-4 rounded-full ${theme.primary} ${theme.primaryHover} text-white font-bold text-lg transition-all shadow-lg shadow-orange-200/50 active:scale-95`}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}