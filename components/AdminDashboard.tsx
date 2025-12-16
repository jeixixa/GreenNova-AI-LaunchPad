
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  FileText, 
  DollarSign, 
  ArrowUpRight,
  ShieldCheck,
  Lock,
  Key,
  Unlock,
  Activity,
  BarChart2,
  PieChart,
  Zap,
  MousePointer,
  RefreshCw,
  Clock,
  LogOut
} from 'lucide-react';
import GreenNovaLogo from './GreenNovaLogo';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { getAnalyticsData, AnalyticsData } from '../services/analyticsService';

const AdminDashboard: React.FC = () => {
  // Initialize auth state from local storage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
      return localStorage.getItem('sbl_admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      // Load data on mount if authenticated
      if (isAuthenticated) {
          refreshData();
      }
  }, [isAuthenticated]);

  const refreshData = () => {
      setLoading(true);
      // Simulate network fetch
      setTimeout(() => {
          const freshData = getAnalyticsData();
          setData(freshData);
          setLoading(false);
      }, 500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('sbl_admin_auth', 'true'); // Persist login
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('sbl_admin_auth');
      setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] animate-fade-in">
        <div className="w-full max-w-md bg-dark-card border border-gray-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-blue-600"></div>
           
           <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                  <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
              <p className="text-gray-400 text-sm">This dashboard is for authorized administrators only.</p>
           </div>

           <form onSubmit={handleLogin} className="space-y-4">
              <div>
                 <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Access Key"
                      className="w-full bg-dark-input border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-gray-600"
                      autoFocus
                    />
                 </div>
                 {error && <p className="text-red-500 text-xs mt-2 ml-1">Invalid access key.</p>}
              </div>
              <button 
                type="submit"
                className="w-full bg-brand-900 text-white font-bold py-3 rounded-xl hover:bg-brand-800 border-2 border-brand-700 transition-colors flex items-center justify-center"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Unlock Dashboard
              </button>
           </form>
           
           <div className="mt-6 text-center">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">SBL Admin Secure</p>
           </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const engagementChartData = [
      { name: 'Likes', value: data.engagement.likes },
      { name: 'Shares', value: data.engagement.shares },
      { name: 'Saves', value: data.engagement.saves },
      { name: 'Clicks', value: data.engagement.clicks },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-2 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
            <GreenNovaLogo className="w-10 h-10 text-brand-500" />
            <h1 className="text-2xl font-black text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-yellow-500">
                Admin Dashboard
            </h1>
        </div>
        <div className="text-right flex items-center gap-3">
            <div className="flex items-center gap-1 mr-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-500 text-[10px] font-bold uppercase">Live Tracking Active</span>
            </div>
            <button 
                onClick={refreshData}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold bg-dark-input px-3 py-1.5 rounded-lg border border-gray-700"
            >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
            </button>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-xs font-bold bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-900/30"
            >
                <LogOut className="w-3 h-3" />
                Lock
            </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Customers */}
        <div className="bg-dark-card border border-blue-900/30 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-16 h-16 text-blue-500" />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Customers</p>
            <div className="flex items-end justify-between">
                <h2 className="text-3xl font-black text-white">{data.totalCustomers}</h2>
                <Users className="w-6 h-6 text-blue-500 mb-1" />
            </div>
            <p className="text-[10px] text-blue-400/60 mt-1">Excludes leads</p>
        </div>

        {/* Total Leads */}
        <div className="bg-dark-card border border-indigo-900/30 p-6 rounded-3xl relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <UserPlus className="w-16 h-16 text-indigo-500" />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Leads</p>
            <div className="flex items-end justify-between">
                <h2 className="text-3xl font-black text-white">{data.totalLeads}</h2>
                <UserPlus className="w-6 h-6 text-indigo-500 mb-1" />
            </div>
            <p className="text-[10px] text-indigo-400/60 mt-1">Not paying yet</p>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-dark-card border border-green-900/30 p-6 rounded-3xl relative overflow-hidden group hover:border-green-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-16 h-16 text-green-500" />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Active Subs</p>
            <div className="flex items-end justify-between">
                <h2 className="text-3xl font-black text-white">{data.activeSubscriptions}</h2>
                <TrendingUp className="w-6 h-6 text-green-500 mb-1" />
            </div>
            <p className="text-[10px] text-green-400/60 mt-1 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1" /> Increasing</p>
        </div>

        {/* Total Posts */}
        <div className="bg-dark-card border border-purple-900/30 p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText className="w-16 h-16 text-purple-500" />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Total Posts Gen</p>
            <div className="flex items-end justify-between">
                <h2 className="text-3xl font-black text-white">{data.totalPostsGenerated}</h2>
                <FileText className="w-6 h-6 text-purple-500 mb-1" />
            </div>
            <p className="text-[10px] text-purple-400/60 mt-1">Lifetime generations</p>
        </div>

        {/* MRR */}
        <div className="bg-dark-card border border-orange-900/30 p-6 rounded-3xl relative overflow-hidden group hover:border-orange-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-16 h-16 text-orange-500" />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">MRR (Est.)</p>
            <div className="flex items-end justify-between">
                <h2 className="text-3xl font-black text-white">${data.mrr}</h2>
                <DollarSign className="w-6 h-6 text-orange-500 mb-1" />
            </div>
            <p className="text-[10px] text-orange-400/60 mt-1">Monthly Recurring</p>
        </div>
      </div>

      {/* ARR Large Card */}
      <div className="rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-white/5">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-black opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="w-full md:w-1/3">
                <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-2">Annual Recurring Revenue (ARR)</p>
                <h2 className="text-5xl md:text-6xl font-black text-white mb-2">${(data.mrr * 12).toLocaleString()}</h2>
                <p className="text-purple-200/60 text-sm">Projected annual revenue based on real-time data.</p>
            </div>
            
            <div className="w-full md:w-2/3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.dailyStats}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#d8b4fe" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="absolute top-8 right-8">
                <ArrowUpRight className="w-12 h-12 text-purple-400 opacity-20" />
            </div>
        </div>
      </div>

      {/* Growth Intelligence Section */}
      <div className="pt-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-brand-500" />
              Growth Intelligence & Tracking
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Event Tracking Stats */}
              <div className="bg-dark-card border border-gray-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Real-Time Engagement</h4>
                      <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-xs text-green-500 font-mono">Updating...</span>
                      </div>
                  </div>
                  <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={engagementChartData} layout="vertical">
                              <XAxis type="number" stroke="#6b7280" fontSize={10} hide />
                              <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={60} />
                              <Tooltip 
                                  cursor={{fill: 'transparent'}}
                                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                              />
                              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Integrations Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-dark-card border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-2">
                          <div className="p-2 bg-orange-900/20 rounded-lg text-orange-500">
                              <PieChart className="w-6 h-6" />
                          </div>
                          <div className="px-2 py-1 rounded bg-green-900/20 text-green-500 text-[10px] font-bold border border-green-900/30">ACTIVE</div>
                      </div>
                      <div>
                          <h4 className="font-bold text-white text-sm">Google Analytics 4</h4>
                          <p className="text-xs text-gray-500 mt-1">Traffic source & session duration tracking.</p>
                      </div>
                  </div>

                  <div className="bg-dark-card border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-2">
                          <div className="p-2 bg-purple-900/20 rounded-lg text-purple-500">
                              <BarChart2 className="w-6 h-6" />
                          </div>
                          <div className="px-2 py-1 rounded bg-green-900/20 text-green-500 text-[10px] font-bold border border-green-900/30">ACTIVE</div>
                      </div>
                      <div>
                          <h4 className="font-bold text-white text-sm">Mixpanel Events</h4>
                          <p className="text-xs text-gray-500 mt-1">Detailed user journey & retention funnels.</p>
                      </div>
                  </div>

                  <div className="bg-dark-card border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-2">
                          <div className="p-2 bg-blue-900/20 rounded-lg text-blue-500">
                              <MousePointer className="w-6 h-6" />
                          </div>
                          <div className="px-2 py-1 rounded bg-green-900/20 text-green-500 text-[10px] font-bold border border-green-900/30">ACTIVE</div>
                      </div>
                      <div>
                          <h4 className="font-bold text-white text-sm">Heatmap Tracking</h4>
                          <p className="text-xs text-gray-500 mt-1">Click & scroll monitoring.</p>
                      </div>
                  </div>

                  <div className="bg-dark-card border border-gray-800 p-5 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-2">
                          <div className="p-2 bg-yellow-900/20 rounded-lg text-yellow-500">
                              <Zap className="w-6 h-6" />
                          </div>
                          <div className="px-2 py-1 rounded bg-green-900/20 text-green-500 text-[10px] font-bold border border-green-900/30">ACTIVE</div>
                      </div>
                      <div>
                          <h4 className="font-bold text-white text-sm">Automated Reports</h4>
                          <p className="text-xs text-gray-500 mt-1">Weekly PDF summaries sent to admin.</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Live Activity Log */}
      <div className="pt-4">
        <h3 className="text-xl font-bold text-white mb-4">Live Activity Log</h3>
        <div className="bg-dark-card border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 border-b border-gray-800">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Event Name</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.events.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500 text-sm">
                                    No live events recorded in this session yet.
                                </td>
                            </tr>
                        ) : (
                            data.events.map((event, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4 text-sm font-bold text-white flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-3 ${event.name.includes('generated') ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                                        {event.name.replace('_', ' ').toUpperCase()}
                                    </td>
                                    <td className="p-4 text-sm text-gray-400 flex items-center">
                                        <Clock className="w-3 h-3 mr-2" />
                                        {new Date(event.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-green-900/30 text-green-400 text-[10px] font-bold px-2 py-1 rounded border border-green-900/50">
                                            CAPTURED
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="pt-4">
          <h3 className="text-xl font-bold text-white mb-4">Subscription Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Active Yearly */}
              <div className="bg-dark-card border border-blue-900/20 p-6 rounded-2xl">
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Active Yearly</p>
                  <h3 className="text-3xl font-black text-white">12</h3>
                  <p className="text-xs text-gray-500 mt-1">$99/year tier</p>
              </div>

              {/* Lifetime */}
              <div className="bg-dark-card border border-orange-900/20 p-6 rounded-2xl bg-gradient-to-br from-dark-card to-orange-900/10">
                  <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">Lifetime Deal</p>
                  <h3 className="text-3xl font-black text-white">5</h3>
                  <p className="text-xs text-gray-500 mt-1">Founding members</p>
              </div>

              {/* Trial Users */}
              <div className="bg-dark-card border border-cyan-900/20 p-6 rounded-2xl">
                  <div className="flex justify-between items-start">
                      <div>
                        <p className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">Trial Users</p>
                        <h3 className="text-3xl font-black text-white">68</h3>
                        <p className="text-xs text-gray-500 mt-1">Free 15-day trial</p>
                      </div>
                      <ShieldCheck className="w-8 h-8 text-cyan-500/20" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
