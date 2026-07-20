import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc, LogOut, Plus, Bug as BugIcon, CircleDashed, CheckCircle2, Copy, Check, ArrowRight, MessageSquare, Code2, Sparkles, Bot } from 'lucide-react';

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
  
  // Modal States
  const [isNewBugModalOpen, setIsNewBugModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Expanded Bug View State
  const [selectedBug, setSelectedBug] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);
  
  const [newBug, setNewBug] = useState({
    title: '',
    description: '',
    priority: 'Medium'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
    } else if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      const orgIdToFetch = parsedUser.organization || parsedUser.organizationId;
      if (orgIdToFetch) {
        fetchBugs(orgIdToFetch); 
      }
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
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateBug = async (e) => {
    e.preventDefault();
    try {
      const orgId = user.organization || user.organizationId;
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
        setBugs([createdBug, ...bugs]);
        setIsNewBugModalOpen(false);
        setNewBug({ title: '', description: '', priority: 'Medium' });
      }
    } catch (error) {
      console.error("Error creating bug", error);
    }
  };

  const handleUpdateStatus = async (bugId, newStatus, e) => {
    // Prevent the click from bubbling up to the card and opening the modal
    if (e) e.stopPropagation(); 
    
    try {
      const response = await fetch(`http://localhost:5000/api/bugs/${bugId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setBugs(bugs.map(bug => 
          bug._id === bugId ? { ...bug, status: newStatus } : bug
        ));
        
        // If the expanded view is open, update its status too
        if (selectedBug && selectedBug._id === bugId) {
            setSelectedBug({...selectedBug, status: newStatus});
        }
      }
    } catch (error) {
      console.error("Error updating bug", error);
    }
  };

  const generatePrompt = () => {
      if (!selectedBug) return;
      
      const prompt = `I am a developer working on a web application. I have encountered a bug and I need help troubleshooting it.

Bug Title: ${selectedBug.title}
Severity/Priority: ${selectedBug.priority}
Current Status: ${selectedBug.status}

Bug Description:
${selectedBug.description}

Based on this information, please:
1. Provide a short summary of potential causes for this issue.
2. Suggest 2-3 specific areas in the code or architecture I should investigate.
3. If the description is too vague, please tell me exactly what files, code snippets, or error logs you need me to provide to diagnose this properly.`;

      setGeneratedPrompt(prompt);
  };

  const copyPrompt = () => {
      navigator.clipboard.writeText(generatedPrompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
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

      {/* Header and Controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${theme.textDark}`}>Bug Board</h2>
        <button 
          onClick={() => setIsNewBugModalOpen(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${theme.primary} ${theme.primaryHover} text-white font-bold transition-all shadow-md active:scale-95`}
        >
          <Plus size={20} />
          New Bug
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TO DO COLUMN */}
        <div className={`flex flex-col gap-4 p-4 rounded-[2rem] ${theme.cardBg} border border-white/50 h-[70vh] overflow-y-auto shadow-sm`}>
          <h3 className={`font-bold ${theme.textDark} flex items-center gap-2 px-2`}>
            <CircleDashed size={18} className="text-[#A88B6E]" /> To Do ({todoBugs.length})
          </h3>
          {todoBugs.map(bug => (
            <div 
                key={bug._id} 
                onClick={() => setSelectedBug(bug)}
                className="bg-white p-4 rounded-3xl shadow-sm border border-[#E5D4C3] cursor-pointer hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${bug.priority === 'Critical' ? 'bg-red-100 text-red-600' : bug.priority === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                    {bug.priority}
                </span>
                <button 
                  onClick={(e) => handleUpdateStatus(bug._id, 'In Progress', e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-[#FDF8EE] hover:bg-[#F4B976] hover:text-white text-[#A88B6E] rounded-full transition-all"
                  title="Move to In Progress"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              <h4 className={`font-bold ${theme.textDark} mb-1`}>{bug.title}</h4>
              <p className={`text-sm ${theme.textLight} line-clamp-2`}>{bug.description}</p>
              
              {/* Render AI Tags for To Do */}
              {bug.tags && bug.tags.length > 0 && (
                 <div className="flex flex-wrap gap-1 mt-3">
                    {bug.tags.map((tag, idx) => (
                       <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-600 rounded-md uppercase tracking-wider">
                          {tag}
                       </span>
                    ))}
                 </div>
              )}
            </div>
          ))}
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className={`flex flex-col gap-4 p-4 rounded-[2rem] ${theme.cardBg} border border-white/50 h-[70vh] overflow-y-auto shadow-sm`}>
          <h3 className={`font-bold ${theme.textDark} flex items-center gap-2 px-2`}>
            <BugIcon size={18} className="text-blue-400" /> In Progress ({inProgressBugs.length})
          </h3>
          {inProgressBugs.map(bug => (
             <div 
                key={bug._id} 
                onClick={() => setSelectedBug(bug)}
                className="bg-white p-4 rounded-3xl shadow-sm border border-[#E5D4C3] cursor-pointer hover:shadow-md transition-shadow group"
             >
             <div className="flex justify-between items-start mb-2">
               <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${bug.priority === 'Critical' ? 'bg-red-100 text-red-600' : bug.priority === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                    {bug.priority}
                </span>
               <button 
                  onClick={(e) => handleUpdateStatus(bug._id, 'Squashed', e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-[#FDF8EE] hover:bg-green-500 hover:text-white text-[#A88B6E] rounded-full transition-all"
                  title="Mark as Squashed"
                >
                  <Check size={16} />
                </button>
             </div>
             <h4 className={`font-bold ${theme.textDark} mb-1`}>{bug.title}</h4>
             <p className={`text-sm ${theme.textLight} line-clamp-2`}>{bug.description}</p>

              {/* Render AI Tags for In Progress */}
              {bug.tags && bug.tags.length > 0 && (
                 <div className="flex flex-wrap gap-1 mt-3">
                    {bug.tags.map((tag, idx) => (
                       <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-600 rounded-md uppercase tracking-wider">
                          {tag}
                       </span>
                    ))}
                 </div>
              )}
           </div>
          ))}
        </div>

        {/* SQUASHED COLUMN */}
        <div className={`flex flex-col gap-4 p-4 rounded-[2rem] ${theme.cardBg} border border-white/50 h-[70vh] overflow-y-auto shadow-sm`}>
          <h3 className={`font-bold ${theme.textDark} flex items-center gap-2 px-2`}>
            <CheckCircle2 size={18} className="text-green-500" /> Squashed ({squashedBugs.length})
          </h3>
          {squashedBugs.map(bug => (
             <div 
                key={bug._id} 
                onClick={() => setSelectedBug(bug)}
                className="bg-white p-4 rounded-3xl shadow-sm border border-[#E5D4C3] opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
             >
             <div className="flex justify-between items-start mb-2">
               <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${bug.priority === 'Critical' ? 'bg-red-100 text-red-600' : bug.priority === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                    {bug.priority}
                </span>
             </div>
             <h4 className={`font-bold line-through ${theme.textDark} mb-1`}>{bug.title}</h4>
             <p className={`text-sm ${theme.textLight} line-clamp-2`}>{bug.description}</p>

              {/* Render AI Tags for Squashed */}
              {bug.tags && bug.tags.length > 0 && (
                 <div className="flex flex-wrap gap-1 mt-3 opacity-60">
                    {bug.tags.map((tag, idx) => (
                       <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-500 rounded-md uppercase tracking-wider">
                          {tag}
                       </span>
                    ))}
                 </div>
              )}
           </div>
          ))}
        </div>
      </div>

      {/* NEW BUG MODAL */}
      {isNewBugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#5C4A3D]/40 backdrop-blur-sm p-4">
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
                <button type="button" onClick={() => setIsNewBugModalOpen(false)} className="flex-1 py-3 rounded-full bg-white text-[#A88B6E] font-bold border-2 border-[#E5D4C3] hover:bg-gray-50 transition-colors">
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

      {/* EXPANDED BUG / AI MODAL */}
      {selectedBug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#5C4A3D]/40 backdrop-blur-sm p-4">
            <div className="bg-[#FDF8EE] w-full max-w-5xl h-[80vh] flex rounded-[2rem] shadow-2xl border-2 border-white overflow-hidden">
                
                {/* Left Side: Bug Details */}
                <div className="w-1/2 p-8 border-r border-[#E5D4C3] overflow-y-auto flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${selectedBug.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'}`}>
                            {selectedBug.priority} Priority
                        </span>
                        <span className={`text-sm font-bold ${theme.textLight}`}>{selectedBug.status}</span>
                    </div>

                    {/* Show tags inside the expanded modal too */}
                    {selectedBug.tags && selectedBug.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedBug.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-600 rounded-md uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    <h2 className={`text-3xl font-bold ${theme.textDark} mb-4`}>{selectedBug.title}</h2>
                    
                    <div className="mb-6 flex-grow">
                        <h3 className={`text-sm font-bold ${theme.textLight} mb-2 uppercase tracking-wider`}>Description</h3>
                        <p className={`text-base ${theme.textDark} whitespace-pre-wrap`}>{selectedBug.description}</p>
                    </div>

                    <div className="mt-auto flex gap-4 pt-6 border-t border-[#E5D4C3]">
                        {selectedBug.status === 'To Do' && (
                             <button onClick={() => handleUpdateStatus(selectedBug._id, 'In Progress', null)} className="flex-1 py-3 rounded-full bg-white text-blue-500 font-bold border-2 border-blue-200 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                Start Working
                             </button>
                        )}
                         {selectedBug.status === 'In Progress' && (
                             <button onClick={() => handleUpdateStatus(selectedBug._id, 'Squashed', null)} className="flex-1 py-3 rounded-full bg-green-500 text-white font-bold shadow-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                                <Check size={18} /> Squash Bug
                             </button>
                        )}
                        <button onClick={() => { setSelectedBug(null); setGeneratedPrompt(''); }} className={`px-6 py-3 rounded-full bg-white ${theme.textLight} font-bold border-2 ${theme.inputBorder} hover:bg-gray-50 transition-colors`}>
                            Close
                        </button>
                    </div>
                </div>

                {/* Right Side: AI Prompt Generator */}
                <div className="w-1/2 p-8 bg-white/50 overflow-y-auto">
                    <div className="flex items-center gap-3 mb-6 text-purple-600">
                        <Bot size={28} />
                        <h2 className="text-2xl font-bold">AI Debug Assistant</h2>
                    </div>
                    
                    <p className={`text-sm ${theme.textDark} mb-6`}>
                        Need help fixing this? Generate an optimized prompt tailored to this specific bug, then paste it into your favorite AI tool for suggestions.
                    </p>

                    {!generatedPrompt ? (
                        <button 
                            onClick={generatePrompt}
                            className="w-full py-4 rounded-2xl bg-purple-100 text-purple-700 font-bold border-2 border-purple-200 hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Sparkles size={20} /> Generate Debugging Prompt
                        </button>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <div className="relative">
                                <textarea 
                                    readOnly
                                    value={generatedPrompt}
                                    className={`w-full h-64 p-4 bg-white border-2 border-purple-200 rounded-2xl text-sm font-mono text-gray-700 resize-none focus:outline-none`}
                                />
                                <button 
                                    onClick={copyPrompt}
                                    className="absolute top-4 right-4 p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                    title="Copy Prompt"
                                >
                                    {promptCopied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                            
                            <div className="mt-6">
                                <p className={`text-sm font-bold ${theme.textLight} mb-3 uppercase tracking-wider`}>Try it here:</p>
                                <div className="flex gap-3">
                                    <a href="https://chat.openai.com/" target="_blank" rel="noreferrer" className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 hover:border-green-400 hover:text-green-600 transition-colors">
                                        <MessageSquare size={16} /> ChatGPT
                                    </a>
                                    <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors">
                                        <Sparkles size={16} /> Gemini
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
      )}
    </div>
  );
}