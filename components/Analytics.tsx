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
  Legend
} from 'recharts';

const data = [
  { name: 'Mon', clicks: 400, reach: 2400 },
  { name: 'Tue', clicks: 300, reach: 1398 },
  { name: 'Wed', clicks: 200, reach: 9800 },
  { name: 'Thu', clicks: 278, reach: 3908 },
  { name: 'Fri', clicks: 189, reach: 4800 },
  { name: 'Sat', clicks: 239, reach: 3800 },
  { name: 'Sun', clicks: 349, reach: 4300 },
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Deep dive into your performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reach Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Reach</h3>
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
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <Area type="monotone" dataKey="reach" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Link Clicks</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="clicks" fill="#111827" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-900 mb-4">AI Performance Recommendations</h3>
        <ul className="space-y-3">
          <li className="flex items-start text-indigo-800 text-sm">
            <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-2 py-1 rounded mr-2 mt-0.5">Tip</span>
            Your Wednesday reach spike suggests high engagement mid-week. Schedule your most important product launches for Wednesday mornings.
          </li>
          <li className="flex items-start text-indigo-800 text-sm">
            <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-2 py-1 rounded mr-2 mt-0.5">Tip</span>
            Link clicks are lower on Fridays. Consider shifting "hard sell" posts to earlier in the week and focusing on lighter, inspirational content on Fridays.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Analytics;