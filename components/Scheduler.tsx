import React from 'react';

const Scheduler: React.FC = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['09:00', '12:00', '15:00', '18:00'];

  return (
    <div className="h-full flex flex-col animate-fade-in">
       <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">Content Scheduler</h1>
        <p className="text-gray-500 mt-1">Drag and drop to organize your posting schedule.</p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
          <div className="p-4 text-xs font-bold text-gray-400 uppercase">Time</div>
          {days.map(day => (
            <div key={day} className="p-4 text-xs font-bold text-gray-500 uppercase text-center border-l border-gray-200">
              {day}
            </div>
          ))}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {times.map(time => (
            <div key={time} className="grid grid-cols-8 min-h-[120px] border-b border-gray-100">
              <div className="p-4 text-sm text-gray-400 border-r border-gray-100">{time}</div>
              {days.map((day, idx) => (
                <div key={`${day}-${time}`} className="border-r border-gray-100 relative p-2 group transition-colors hover:bg-gray-50">
                  {/* Mock Content Card */}
                  {(day === 'Mon' && time === '09:00') && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                      <p className="text-xs font-bold text-blue-900 truncate">New Launch Blog</p>
                      <p className="text-[10px] text-blue-700">Blog Post</p>
                    </div>
                  )}
                   {(day === 'Wed' && time === '15:00') && (
                    <div className="bg-pink-100 border-l-4 border-pink-500 p-2 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                      <p className="text-xs font-bold text-pink-900 truncate">Insta Reel</p>
                      <p className="text-[10px] text-pink-700">Instagram</p>
                    </div>
                  )}
                  <button className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <span className="bg-white border border-gray-200 text-gray-500 text-xs px-2 py-1 rounded shadow-sm hover:text-gray-900 hover:border-gray-300">+ Add</span>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scheduler;