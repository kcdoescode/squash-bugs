import React, { useState } from 'react';
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
  
  // 1. Create state to hold the form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
    password: ''
  });
  const [error, setError] = useState('');

  // 2. Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Save the VIP token to the browser
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        alert('Workspace created successfully!');
        navigate('/dashboard');
      } else {
        // The server sent back an error (like "User already exists")
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to connect to the server. Is it running?');
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
          <h1 className={`text-3xl font-bold ${theme.textDark} mb-2`}>Sign Up</h1>
          <p className={theme.textLight}>Create your team's workspace</p>
        </div>

        {/* 4. Connect the submit function to the form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {/* Display error message if there is one */}
          {error && <div className="text-red-500 text-sm text-center font-bold">{error}</div>}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <User className={theme.textLight} size={20} />
            </div>
            <input 
              type="text" 
              name="name" // Added name attribute
              value={formData.name} // Connected to state
              onChange={handleChange} // Updates state when typing
              placeholder="Full Name" 
              required
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} placeholder-[#C0AFA0] transition-colors`}
            />
          </div>

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
              <Disc className={theme.textLight} size={20} />
            </div>
            <input 
              type="text" 
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="Organization Name" 
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
              minLength="6"
              className={`w-full pl-12 pr-5 py-4 bg-transparent border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} placeholder-[#C0AFA0] transition-colors`}
            />
          </div>

          <button type="submit" className={`w-full py-4 mt-4 rounded-full ${theme.primary} ${theme.primaryHover} text-white font-bold text-lg transition-all shadow-lg shadow-orange-200/50 active:scale-95`}>
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
}