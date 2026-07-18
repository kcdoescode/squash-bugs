import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc, LogOut, Plus, Bug as BugIcon, CircleDashed, CheckCircle2, Copy, Check } from 'lucide-react';

const theme = {
  bg: "bg-[#FDF8EE]",
  textDark: "text-[#5C4A3D]",
  textLight: "text-[#A88B6E]",
  primary: "bg-[#F4B976]",
  primaryHover: "hover:bg-[#EAA962]",
  cardBg: "bg-white/60",
  inputBorder: "border-[#E5D4C3]",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });

  // Check auth and fetch bugs on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
    } else if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Fetch bugs for this user's organization
      fetchBugs(parsedUser.organizationId || parsedUser.orgId || parsedUser._id); 
    }
  }, [navigate]);

  const fetchBugs = async (orgId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bugs/${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setBugs(data);
      }
    } catch (error) {
      console.error("Failed to fetch bugs", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const copyInviteCode = () => {
    if (user?.inviteCode) {
      navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset the checkmark after 2 seconds
    }
  };

  const handleCreateBug = async (e) => {
    e.preventDefault();
    try {
      const orgId = user.organizationId || user.orgId || user._id; // Fallbacks based on your auth structure
      const response = await fetch('http://localhost:5000/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBug,
          organizationId: orgId,
          createdBy: user._id
        }),
      });

      if (response.ok) {
        const createdBug = await response.json();
        setBugs([createdBug, ...bugs]); // Add new bug to the top of the list
        setIsModalOpen(false); // Close modal
        setNewBug({ title: '', description: '', priority: 'Medium' }); // Reset form
      }
    } catch (error) {
      console.error("Error creating bug", error);
    }
  };

  if (!user) return null;

  const todoBugs = bugs.filter(b => b.status === 'To Do');
  const inProgressBugs = bugs.filter(b => b.status === 'In Progress');
  const squashedBugs = bugs.filter(b => b.status === 'Squashed');

  return (
    <div className={`min-h-screen ${theme.bg} font-sans p-6 relative`}>
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${theme.primary} text-white`}>
            <Disc size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${theme.textDark}`}>Squash Bugs</h1>
            {user?.organizationName && (
               <p className={`text-xs font-bold uppercase tracking-wider ${theme.textLight}`}>{user.organizationName}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.role === 'Admin' && user?.inviteCode && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#E5D4C3]">
               <span className={`text-xs font-bold ${theme.textLight}`}>INVITE CODE:</span>
               <span className={`font-mono font-bold ${theme.textDark} tracking-widest`}>{user.inviteCode}</span>
               <button onClick={copyInviteCode} className={`p-1 rounded-md hover:bg-gray-100 transition-colors ${copied ? 'text-green-500' : theme.textLight}`}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
               </button>
            </div>
          )}
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

      {}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${theme.textDark}`}>Bug Board</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${theme.primary} ${theme.primaryHover} text-white font-bold transition-all shadow-md active:scale-95`}
        >
          <Plus size={20} />
          New Bug
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TO DO COLUMN */}
        <div className={`flex flex-col gap-4 p-4 rounded-[2rem] ${theme.cardBg} border border-white/50 h-[70vh] overflow-y-auto shadow-sm`}>
          <h3 className={`font-bold ${theme.textDark} flex items-center gap-2 px-2`}>
            <CircleDashed size={18} className="text-[#A88B6E]" /> To Do ({todoBugs.length})
          </h3>
          {todoBugs.map(bug => (
            <div key={bug._id} className="bg-white p-4 rounded-3xl shadow-sm border border-[#E5D4C3] cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-600 rounded-full uppercase tracking-wider">{bug.priority}</span>
              </div>
              <h4 className={`font-bold ${theme.textDark} mb-1`}>{bug.title}</h4>
              <p className={`text-sm ${theme.textLight} line-clamp-2`}>{bug.description}</p>
            </div>
          ))}
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className={`flex flex-col gap-4 p-4 rounded-[2rem] ${theme.cardBg} border border-white/50 h-[70vh] overflow-y-auto shadow-sm`}>
          <h3 className={`font-bold ${theme.textDark} flex items-center gap-2 px-2`}>
            <BugIcon size={18} className="text-blue-400" /> In Progress ({inProgressBugs.length})
          </h3>
          {inProgressBugs.map(bug => (
             <div key={bug._id} className="bg-white p-4 rounded-3xl shadow-sm border border-[#E5D4C3] cursor-pointer hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-600 rounded-full uppercase tracking-wider">{bug.priority}</span>
             </div>
             <h4 className={`font-bold ${theme.textDark} mb-1`}>{bug.title}</h4>
             <p className={`text-sm ${theme.textLight} line-clamp-2`}>{bug.description}</p>
           </div>
          ))}
        </div>

        {/* SQUASHED COLUMN */}
        <div className={`flex flex-col gap-4 p-4 rounded-[2rem] ${theme.cardBg} border border-white/50 h-[70vh] overflow-y-auto shadow-sm`}>
          <h3 className={`font-bold ${theme.textDark} flex items-center gap-2 px-2`}>
            <CheckCircle2 size={18} className="text-green-500" /> Squashed ({squashedBugs.length})
          </h3>
          {squashedBugs.map(bug => (
             <div key={bug._id} className="bg-white p-4 rounded-3xl shadow-sm border border-[#E5D4C3] opacity-60 cursor-pointer hover:opacity-100 transition-opacity">
             <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-bold px-3 py-1 bg-gray-200 text-gray-600 rounded-full uppercase tracking-wider">{bug.priority}</span>
             </div>
             <h4 className={`font-bold line-through ${theme.textDark} mb-1`}>{bug.title}</h4>
             <p className={`text-sm ${theme.textLight} line-clamp-2`}>{bug.description}</p>
           </div>
          ))}
        </div>
      </div>

      {}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#5C4A3D]/40 backdrop-blur-sm p-4">
          <div className="bg-[#FDF8EE] w-full max-w-lg p-8 rounded-[2rem] shadow-2xl border-2 border-white">
            <h2 className={`text-2xl font-bold ${theme.textDark} mb-6`}>Report a Bug</h2>
            <form onSubmit={handleCreateBug} className="space-y-4">
              <div>
                <label className={`block text-sm font-bold ${theme.textDark} mb-1 px-2`}>Title</label>
                <input 
                  type="text" required
                  value={newBug.title} onChange={e => setNewBug({...newBug, title: e.target.value})}
                  className={`w-full px-5 py-3 bg-white border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark}`}
                  placeholder="e.g. Login button unresponsive"
                />
              </div>
              
              <div>
                <label className={`block text-sm font-bold ${theme.textDark} mb-1 px-2`}>Description</label>
                <textarea 
                  required rows="3"
                  value={newBug.description} onChange={e => setNewBug({...newBug, description: e.target.value})}
                  className={`w-full px-5 py-3 bg-white border-2 ${theme.inputBorder} rounded-2xl focus:outline-none focus:border-[#F4B976] ${theme.textDark} resize-none`}
                  placeholder="Steps to reproduce..."
                ></textarea>
              </div>

              <div>
                <label className={`block text-sm font-bold ${theme.textDark} mb-1 px-2`}>Priority</label>
                <select 
                  value={newBug.priority} onChange={e => setNewBug({...newBug, priority: e.target.value})}
                  className={`w-full px-5 py-3 bg-white border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} appearance-none`}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-full bg-white text-[#A88B6E] font-bold border-2 border-[#E5D4C3] hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" className={`flex-1 py-3 rounded-full ${theme.primary} ${theme.primaryHover} text-white font-bold transition-all shadow-md active:scale-95`}>
                  Save Bug
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}