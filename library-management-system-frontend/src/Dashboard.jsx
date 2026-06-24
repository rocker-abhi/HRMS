import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BookOpen, ShieldAlert, Award, FileText, Settings } from 'lucide-react';
import UserManagement from './UserManagement.jsx';

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'User';
  const username = localStorage.getItem('user_id') || 'Abhishek';
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#0c0e17] text-gray-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#090b11] p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-md shadow-purple-500/20 flex items-center justify-center">
              <span className="font-bold text-white tracking-wider">HR</span>
            </div>
            <span className="text-xl font-semibold text-white tracking-wide">H.R.M.S</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-white text-gray-400'}`}
            >
              <Award className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-purple-400' : ''}`} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setActiveTab('employees')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'employees' ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-white text-gray-400'}`}
            >
              <Users className={`w-5 h-5 ${activeTab === 'employees' ? 'text-purple-400' : ''}`} />
              <span>Employees</span>
            </button>
            <button 
              onClick={() => setActiveTab('library')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'library' ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-white text-gray-400'}`}
            >
              <BookOpen className={`w-5 h-5 ${activeTab === 'library' ? 'text-purple-400' : ''}`} />
              <span>Library</span>
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'reports' ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-white text-gray-400'}`}
            >
              <FileText className={`w-5 h-5 ${activeTab === 'reports' ? 'text-purple-400' : ''}`} />
              <span>Reports</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === 'settings' ? 'bg-white/5 text-white' : 'hover:bg-white/5 hover:text-white text-gray-400'}`}
            >
              <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-purple-400' : ''}`} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full border border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-300 rounded-xl font-medium transition-all duration-300 justify-center cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Header */}
        <header className="flex items-center justify-between pb-6 border-b border-white/5 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Main Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Review system metrics, statistics, and records</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/5 px-5 py-3 rounded-xl">
            <div className="text-right">
              <div className="font-semibold text-white text-sm">{username}</div>
              <div className="text-xs text-purple-400 font-medium tracking-wider uppercase mt-0.5">{role}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white">
              {username.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Dynamic Content Section */}
        {activeTab === 'dashboard' && (
          <>
            {/* Statistics Cards Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-white">124</div>
                <div className="text-sm text-gray-400 mt-1">Total Employees</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-white">4,812</div>
                <div className="text-sm text-gray-400 mt-1">Library Catalog</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-white">98.4%</div>
                <div className="text-sm text-gray-400 mt-1">System Uptime</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-gray-400 mt-1">Critical Warnings</div>
              </div>
            </section>

            {/* Content Section Placeholder */}
            <section className="p-8 rounded-2xl bg-white/5 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none" />
              <h2 className="text-xl font-semibold text-white tracking-tight mb-4">Welcome to HRMS System</h2>
              <p className="text-gray-400 leading-relaxed text-sm max-w-2xl">
                You are currently authenticated and logged in as <span className="text-purple-400 font-semibold">{username}</span> with a role of <span className="text-indigo-400 font-semibold">{role}</span>. All administrative operations, reports, configurations, and employee catalogs are available through the left side navigation options.
              </p>
            </section>
          </>
        )}

        {activeTab === 'employees' && (
          <UserManagement />
        )}

      </main>
    </div>
  );
}
