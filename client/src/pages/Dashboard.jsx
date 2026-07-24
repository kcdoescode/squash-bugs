import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc, LogOut, Plus, Bug as BugIcon, CircleDashed, CheckCircle2, Copy, Check, ArrowRight, MessageSquare, Bot, Sparkles, User as UserIcon, Edit2, Save, X } from 'lucide-react';

const theme = {
  bg: "bg-[#FDF8EE]",
  textDark: "text-[#5C4A3D]",
  textLight: "text-[#A88B6E]",
  primary: "bg-[#F4B976]",
  primaryHover: "hover:bg-[#EAA962]",
  cardBg: "bg-white/60",
  inputBorder: "border-[#E5D4C3]",
};

// Utility to clean up AI markdown asterisks
const formatAIResponse = (text) => {
    if (!text) return "";
    // Replace **bold** with actual bold tags or just strip them for clean text
    return text.replace(/\*\*(.*?)\*\*/g, '$1'); 
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bugs, setBugs] = useState([]);
  
  const [isNewBugModalOpen, setIsNewBugModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Expanded Bug View State
  const [selectedBug, setSelectedBug] = useState(null);
  
  // Edit Bug State
  const [isEditingBug, setIsEditingBug] = useState(false);
  const [editBugData, setEditBugData] = useState({ title: '', description: '', priority: '' });
  
  // Tab State: 'solution' or 'prompt'
  const [aiTab, setAiTab] = useState('solution');
  
  // Prompt Generator States
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);

  // In-App AI Solution States
  const [aiSolution, setAiSolution] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
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
    if (e) e.stopPropagation(); 
    
    try {
      const response = await fetch(`http://localhost:5000/api/bugs/${bugId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        setBugs(bugs.map(bug => bug._id === bugId ? updated : bug));
        if (selectedBug && selectedBug._id === bugId) {
            setSelectedBug(updated);
        }
      }
    } catch (error) {
      console.error("Error updating bug", error);
    }
  };

  // --- Save Edited Bug ---
  const handleSaveEdit = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bugs/${selectedBug._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editBugData),
        });

        if (response.ok) {
          const updated = await response.json();
          setBugs(bugs.map(b => b._id === selectedBug._id ? updated : b));
          setSelectedBug(updated);
          setIsEditingBug(false);
        }
      } catch (error) {
        console.error("Error saving edits", error);
      }
  };

  const handleAskAI = async () => {
      if (!selectedBug) return;
      setIsAiLoading(true);
      
      try {
          const response = await fetch('http://localhost:5000/api/bugs/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  title: selectedBug.title,
                  description: selectedBug.description
              })
          });
          
          if (response.ok) {
              const data = await response.json();
              setAiSolution(data.solution);
          } else {
              setAiSolution("Error connecting to the AI server.");
          }
      } catch (error) {
          setAiSolution("Network error while trying to reach the AI.");
      } finally {
          setIsAiLoading(false);
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

  const closeExpandedBug = () => {
      setSelectedBug(null); 
      setGeneratedPrompt('');
      setAiSolution('');
      setAiTab('solution');
      setIsEditingBug(false);
  };

  const openExpandedBug = (bug) => {
      setSelectedBug(bug);
      setEditBugData({ title: bug.title, description: bug.description, priority: bug.priority });
  };

  if (!user) return null;

  const todoBugs = bugs.filter(b => b.status === 'To Do');
  const inProgressBugs = bugs.filter(b => b.status === 'In Progress');
  const squashedBugs = bugs.filter(b => b.status === 'Squashed');

  return (
    <div className={`min-h-screen ${theme.bg} font-sans p-6 relative`}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TO DO COLUMN */}
        <div className={`flex flex-col gap-4 p-4 rounded-[2rem] ${theme.cardBg} border border-white/50 h-[70vh] overflow-y-auto shadow-sm`}>
          <h3 className={`font-bold ${theme.textDark} flex items-center gap-2 px-2`}>
            <CircleDashed size={18} className="text-[#A88B6E]" /> To Do ({todoBugs.length})
          </h3>
          {todoBugs.map(bug => (
            <div 
                key={bug._id} 
                onClick={() => openExpandedBug(bug)}
                className="bg-white p-4 rounded-3xl shadow-sm border border-[#E5D4C3] cursor-pointer hover:shadow-md transition-shadow group flex flex-col"
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
              
              <div className="mt-auto pt-3">
                  {bug.tags && bug.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mb-2">
                        {bug.tags.map((tag, idx) => (
                           <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-600 rounded-md uppercase tracking-wider">
                              {tag}
                           </span>
                        ))}
                     </div>
                  )}
                  {bug.createdBy && (
                     <div className="flex items-center gap-1.5 text-[#A88B6E]">
                        <UserIcon size={12} />
                        <span className="text-[10px] font-medium truncate">{bug.createdBy.name}</span>
                     </div>
                  )}
              </div>
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
                onClick={() => openExpandedBug(bug)}
                className="bg-white p-4 rounded-3xl shadow-sm border border-[#E5D4C3] cursor-pointer hover:shadow-md transition-shadow group flex flex-col"
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

              <div className="mt-auto pt-3">
                  {bug.tags && bug.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mb-2">
                        {bug.tags.map((tag, idx) => (
                           <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-600 rounded-md uppercase tracking-wider">
                              {tag}
                           </span>
                        ))}
                     </div>
                  )}
                  {bug.createdBy && (
                     <div className="flex items-center gap-1.5 text-[#A88B6E]">
                        <UserIcon size={12} />
                        <span className="text-[10px] font-medium truncate">{bug.createdBy.name}</span>
                     </div>
                  )}
              </div>
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
                onClick={() => openExpandedBug(bug)}
                className="bg-white p-4 rounded-3xl shadow-sm border border-[#E5D4C3] opacity-60 cursor-pointer hover:opacity-100 transition-opacity flex flex-col"
             >
             <div className="flex justify-between items-start mb-2">
               <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${bug.priority === 'Critical' ? 'bg-red-100 text-red-600' : bug.priority === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                    {bug.priority}
                </span>
             </div>
             <h4 className={`font-bold line-through ${theme.textDark} mb-1`}>{bug.title}</h4>

              <div className="mt-auto pt-3">
                  {bug.tags && bug.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mb-2 opacity-60">
                        {bug.tags.map((tag, idx) => (
                           <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-500 rounded-md uppercase tracking-wider">
                              {tag}
                           </span>
                        ))}
                     </div>
                  )}
                  {bug.createdBy && (
                     <div className="flex items-center gap-1.5 text-gray-400">
                        <UserIcon size={12} />
                        <span className="text-[10px] font-medium truncate">{bug.createdBy.name}</span>
                     </div>
                  )}
              </div>
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
                <div className="w-1/2 p-8 border-r border-[#E5D4C3] overflow-y-auto flex flex-col relative">
                    {/* EDIT TOGGLE BUTTON - Only show if current user created it */}
                    {selectedBug.createdBy && selectedBug.createdBy._id === user._id && !isEditingBug && (
                       <button 
                         onClick={() => setIsEditingBug(true)}
                         className="absolute top-8 right-8 p-2 bg-white rounded-full text-[#A88B6E] hover:text-[#5C4A3D] hover:bg-gray-100 transition-colors shadow-sm"
                         title="Edit Bug"
                       >
                          <Edit2 size={18} />
                       </button>
                    )}

                    <div className="flex justify-between items-start mb-6 pr-10">
                        {isEditingBug ? (
                            <select 
                                value={editBugData.priority} onChange={e => setEditBugData({...editBugData, priority: e.target.value})}
                                className={`px-4 py-2 bg-white border-2 ${theme.inputBorder} rounded-full focus:outline-none focus:border-[#F4B976] ${theme.textDark} text-xs font-bold uppercase`}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        ) : (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${selectedBug.priority === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'}`}>
                                {selectedBug.priority} Priority
                            </span>
                        )}
                        <span className={`text-sm font-bold ${theme.textLight}`}>{selectedBug.status}</span>
                    </div>

                    {!isEditingBug && selectedBug.tags && selectedBug.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedBug.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-600 rounded-md uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    
                    {isEditingBug ? (
                        <input 
                            type="text" 
                            value={editBugData.title} onChange={e => setEditBugData({...editBugData, title: e.target.value})}
                            className={`w-full text-2xl font-bold px-4 py-3 bg-white border-2 ${theme.inputBorder} rounded-2xl focus:outline-none focus:border-[#F4B976] ${theme.textDark} mb-4`}
                        />
                    ) : (
                        <h2 className={`text-3xl font-bold ${theme.textDark} mb-4 pr-10`}>{selectedBug.title}</h2>
                    )}
                    
                    <div className="mb-4">
                         {selectedBug.createdBy && (
                             <div className="flex items-center gap-2 text-[#A88B6E] bg-white w-fit px-3 py-1.5 rounded-full shadow-sm border border-[#E5D4C3]">
                                <UserIcon size={14} />
                                <span className="text-xs font-bold tracking-wider">Reported by {selectedBug.createdBy.name}</span>
                             </div>
                          )}
                    </div>

                    <div className="mb-6 flex-grow">
                        <h3 className={`text-sm font-bold ${theme.textLight} mb-2 uppercase tracking-wider`}>Description</h3>
                        {isEditingBug ? (
                            <textarea 
                                rows="8"
                                value={editBugData.description} onChange={e => setEditBugData({...editBugData, description: e.target.value})}
                                className={`w-full px-4 py-3 bg-white border-2 ${theme.inputBorder} rounded-2xl focus:outline-none focus:border-[#F4B976] ${theme.textDark} resize-none`}
                            ></textarea>
                        ) : (
                            <p className={`text-base ${theme.textDark} whitespace-pre-wrap`}>{selectedBug.description}</p>
                        )}
                    </div>

                    <div className="mt-auto flex gap-4 pt-6 border-t border-[#E5D4C3]">
                        {isEditingBug ? (
                            <>
                                <button onClick={() => setIsEditingBug(false)} className="flex-1 py-3 rounded-full bg-white text-[#A88B6E] font-bold border-2 border-[#E5D4C3] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                    <X size={18} /> Cancel
                                </button>
                                <button onClick={handleSaveEdit} className={`flex-1 py-3 rounded-full ${theme.primary} ${theme.primaryHover} text-white font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2`}>
                                    <Save size={18} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <>
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
                                <button onClick={closeExpandedBug} className={`px-6 py-3 rounded-full bg-white ${theme.textLight} font-bold border-2 ${theme.inputBorder} hover:bg-gray-50 transition-colors`}>
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Side: AI Assistant Tabs */}
                <div className="w-1/2 flex flex-col bg-white/50 overflow-hidden">
                    
                    {/* Tab Navigation */}
                    <div className="flex border-b border-[#E5D4C3] bg-white">
                        <button 
                            onClick={() => setAiTab('solution')}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${aiTab === 'solution' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Bot size={18} /> In-App AI Fix
                        </button>
                        <button 
                            onClick={() => setAiTab('prompt')}
                            className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${aiTab === 'prompt' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Copy size={18} /> Prompt Engine
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto flex-grow">
                        
                        {/* TAB 1: IN-APP AI */}
                        {aiTab === 'solution' && (
                            <div className="animate-in fade-in h-full flex flex-col">
                                <p className={`text-sm ${theme.textDark} mb-6`}>
                                    Ask the AI to instantly analyze this bug and suggest a fix directly in your dashboard.
                                </p>
                                
                                {!aiSolution && !isAiLoading ? (
                                    <button 
                                        onClick={handleAskAI}
                                        className="w-full py-4 rounded-2xl bg-purple-100 text-purple-700 font-bold border-2 border-purple-200 hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Sparkles size={20} /> Ask AI For Solution
                                    </button>
                                ) : isAiLoading ? (
                                    <div className="flex-grow flex flex-col items-center justify-center text-purple-500 opacity-70">
                                        <Bot size={48} className="mb-4 animate-bounce" />
                                        <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Analyzing Bug...</p>
                                    </div>
                                ) : (
                                    <div className="flex-grow flex flex-col">
                                        <h3 className="text-sm font-bold text-purple-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                                            <Sparkles size={16}/> AI Suggestion
                                        </h3>
                                        <div className="flex-grow p-5 bg-white border-2 border-purple-200 rounded-2xl text-sm text-gray-700 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                                            {formatAIResponse(aiSolution)}
                                        </div>
                                        <button 
                                            onClick={() => setAiSolution('')}
                                            className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider self-center"
                                        >
                                            Clear Response
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: PROMPT GENERATOR */}
                        {aiTab === 'prompt' && (
                            <div className="animate-in fade-in h-full flex flex-col">
                                <p className={`text-sm ${theme.textDark} mb-6`}>
                                    Want to use your own custom GPT? Generate an optimized prompt tailored to this specific bug, then paste it into your favorite tool.
                                </p>

                                {!generatedPrompt ? (
                                    <button 
                                        onClick={generatePrompt}
                                        className="w-full py-4 rounded-2xl bg-white text-gray-700 font-bold border-2 border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <Copy size={20} /> Generate Copy/Paste Prompt
                                    </button>
                                ) : (
                                    <div className="flex-grow flex flex-col">
                                        <div className="relative flex-grow flex flex-col">
                                            <textarea 
                                                readOnly
                                                value={generatedPrompt}
                                                className={`flex-grow w-full p-5 bg-white border-2 border-gray-200 rounded-2xl text-sm font-mono text-gray-600 resize-none focus:outline-none shadow-inner`}
                                            />
                                            <button 
                                                onClick={copyPrompt}
                                                className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
                                                title="Copy Prompt"
                                            >
                                                {promptCopied ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                        
                                        <div className="mt-6">
                                            <p className={`text-sm font-bold ${theme.textLight} mb-3 uppercase tracking-wider`}>Try it here:</p>
                                            <div className="flex gap-3">
                                                <a href="https://chat.openai.com/" target="_blank" rel="noreferrer" className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 hover:border-green-400 hover:text-green-600 transition-colors shadow-sm">
                                                    <MessageSquare size={16} /> ChatGPT
                                                </a>
                                                <a href="https://gemini.google.com/" target="_blank" rel="noreferrer" className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">
                                                    <Sparkles size={16} /> Gemini
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
      )}
    </div>
  );
}