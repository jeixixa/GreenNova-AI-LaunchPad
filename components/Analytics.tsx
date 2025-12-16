
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Play, Clock, Activity, Video, ArrowUpRight, Eye } from 'lucide-react';

const data = [
  { name: 'Mon', clicks: 400, reach: 2400 },
  { name: 'Tue', clicks: 300, reach: 1398 },
  { name: 'Wed', clicks: 200, reach: 9800 },
  { name: 'Thu', clicks: 278, reach: 3908 },
  { name: 'Fri', clicks: 189, reach: 4800 },
  { name: 'Sat', clicks: 239, reach: 3800 },
  { name: 'Sun', clicks: 349, reach: 4300 },
];

const videoData = [
  { name: 'Mon', views: 120, completion: 65 },
  { name: 'Tue', views: 180, completion: 70 },
  { name: 'Wed', views: 250, completion: 68 },
  { name: 'Thu', views: 310, completion: 75 },
  { name: 'Fri', views: 280, completion: 72 },
  { name: 'Sat', views: 450, completion: 85 },
  { name: 'Sun', views: 390, completion: 82 },
];

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.ElementType }> = ({ title, value, trend, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full flex items-center">
        {trend} <ArrowUpRight className="w-3 h-3 ml-1" />
      </span>
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
  </div>
);

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Deep dive into your performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reach Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-96">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Weekly Reach</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.2} />
              <Area type="monotone" dataKey="reach" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-96">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Link Clicks</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="clicks" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Video Metrics Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Video className="w-5 h-5 mr-2 text-brand-500" />
            Video Performance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Views" value="24.5K" trend="+22%" icon={Eye} />
            <StatCard title="Total Watch Time" value="1,240h" trend="+15%" icon={Clock} />
            <StatCard title="Avg. Completion Rate" value="68.4%" trend="+4%" icon={Activity} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-96">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Views & Completion Trends</h3>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={videoData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.2} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="views" name="Views" stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981'}} activeDot={{r: 6}} />
                    <Line yAxisId="right" type="monotone" dataKey="completion" name="Completion Rate" stroke="#6366F1" strokeWidth={3} dot={{r: 4, fill: '#6366F1'}} activeDot={{r: 6}} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-4">AI Performance Recommendations</h3>
        <ul className="space-y-3">
          <li className="flex items-start text-indigo-800 dark:text-indigo-300 text-sm">
            <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-bold px-2 py-1 rounded mr-2 mt-0.5">Tip</span>
            Your Wednesday reach spike suggests high engagement mid-week. Schedule your most important product launches for Wednesday mornings.
          </li>
          <li className="flex items-start text-indigo-800 dark:text-indigo-300 text-sm">
            <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-bold px-2 py-1 rounded mr-2 mt-0.5">Tip</span>
            Link clicks are lower on Fridays. Consider shifting "hard sell" posts to earlier in the week and focusing on lighter, inspirational content on Fridays.
          </li>
          <li className="flex items-start text-indigo-800 dark:text-indigo-300 text-sm">
            <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-bold px-2 py-1 rounded mr-2 mt-0.5">Video</span>
            Video completion rate peaks on weekends. Post longer-form educational videos on Saturday mornings.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
