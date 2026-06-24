import React, { useState, useMemo } from 'react';
import { Users, Edit2, Trash2, Plus, X, Shield, Mail, User, AlertCircle, Search, Filter } from 'lucide-react';

const DUMMY_USERS = [
  { id: '1', username: 'john_doe', email: 'john@example.com', account_type: 'ADMIN', is_active: true, role: 'Admin' },
  { id: '2', username: 'jane_smith', email: 'jane@example.com', account_type: 'SUPERVISOR', is_active: true, role: 'Supervisor' },
  { id: '3', username: 'mike_ross', email: 'mike@example.com', account_type: 'CUSTOMER', is_active: false, role: 'Student' },
  { id: '4', username: 'rachel_zane', email: 'rachel@example.com', account_type: 'CUSTOMER', is_active: true, role: 'Student' },
];

export default function UserManagement() {
  const [users, setUsers] = useState(DUMMY_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', account_type: 'CUSTOMER', is_active: true });

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || user.account_type === filterType;
      const matchesStatus = filterStatus === 'ALL' || 
                            (filterStatus === 'ACTIVE' && user.is_active) || 
                            (filterStatus === 'INACTIVE' && !user.is_active);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [users, searchTerm, filterType, filterStatus]);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ username: user.username, email: user.email, account_type: user.account_type, is_active: user.is_active });
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', account_type: 'CUSTOMER', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      // Update existing
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      // Create new
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        role: formData.account_type === 'ADMIN' ? 'Admin' : formData.account_type === 'SUPERVISOR' ? 'Supervisor' : 'Student'
      };
      setUsers([...users, newUser]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const toggleActive = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">Employee Directory</h2>
          <p className="text-gray-400 text-sm mt-1">Manage user accounts, roles, and permissions.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add User</span>
        </button>
      </div>

      {/* Filters section */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative min-w-[160px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Shield className="w-4 h-4" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 appearance-none transition-all cursor-pointer"
            >
              <option value="ALL" className="bg-[#131620]">All Types</option>
              <option value="ADMIN" className="bg-[#131620]">Admin</option>
              <option value="SUPERVISOR" className="bg-[#131620]">Supervisor</option>
              <option value="CUSTOMER" className="bg-[#131620]">Customer</option>
            </select>
          </div>
          <div className="relative min-w-[160px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 appearance-none transition-all cursor-pointer"
            >
              <option value="ALL" className="bg-[#131620]">All Status</option>
              <option value="ACTIVE" className="bg-[#131620]">Active</option>
              <option value="INACTIVE" className="bg-[#131620]">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="rounded-2xl bg-white/5 border border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-black/20 text-gray-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">User</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Account Type</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold uppercase shrink-0">
                        {user.username.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{user.username}</div>
                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${user.account_type === 'ADMIN' ? 'text-red-400' : user.account_type === 'SUPERVISOR' ? 'text-emerald-400' : 'text-blue-400'}`} />
                      <span className="font-medium">{user.account_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleActive(user.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        user.is_active 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p>No users found matching your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131620] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-semibold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    required 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Account Type</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Shield className="w-4 h-4" />
                    </span>
                    <select 
                      value={formData.account_type}
                      onChange={e => setFormData({...formData, account_type: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                    >
                      <option value="SUPERVISOR" className="bg-[#131620]">Supervisor</option>
                      <option value="CUSTOMER" className="bg-[#131620]">Customer (Student)</option>
                    </select>
                  </div>
                </div>
              )}

              {editingUser && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Account Status</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Filter className="w-4 h-4" />
                    </span>
                    <select 
                      value={formData.is_active ? 'ACTIVE' : 'INACTIVE'}
                      onChange={e => setFormData({...formData, is_active: e.target.value === 'ACTIVE'})}
                      className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                    >
                      <option value="ACTIVE" className="bg-[#131620]">Active</option>
                      <option value="INACTIVE" className="bg-[#131620]">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
