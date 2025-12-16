
import React, { useState, useEffect, DragEvent } from 'react';
import { getSavedItems } from '../services/storageService';
import { SavedItem } from '../types';
import { Calendar, GripVertical, FileText, Image as ImageIcon, Video, Music, Trash2, Clock } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['09:00', '12:00', '15:00', '18:00', '21:00'];

// Mapping key format: "Day-Time" (e.g., "Mon-09:00")
type ScheduleMap = Record<string, SavedItem>;

const Scheduler: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleMap>({});
  const [draggedItem, setDraggedItem] = useState<SavedItem | null>(null);
  const [dragSource, setDragSource] = useState<'sidebar' | string>('sidebar'); // 'sidebar' or 'Day-Time'

  // Load data on mount
  useEffect(() => {
    // 1. Load available assets
    const items = getSavedItems();
    setSavedItems(items);

    // 2. Load existing schedule
    const storedSchedule = localStorage.getItem('sbl_schedule');
    if (storedSchedule) {
      try {
        setSchedule(JSON.parse(storedSchedule));
      } catch (e) {
        console.error("Failed to load schedule", e);
      }
    }
  }, []);

  // Save schedule whenever it changes
  useEffect(() => {
    localStorage.setItem('sbl_schedule', JSON.stringify(schedule));
  }, [schedule]);

  // Handle Drag Start
  const handleDragStart = (e: DragEvent, item: SavedItem, source: 'sidebar' | string) => {
    setDraggedItem(item);
    setDragSource(source);
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  // Allow Drop
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle Drop on Grid Slot
  const handleDrop = (e: DragEvent, day: string, time: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const targetKey = `${day}-${time}`;

    // Update Schedule
    setSchedule(prev => {
      const newSchedule = { ...prev };
      
      // If we are moving from another slot in the grid, clear the old slot
      if (dragSource !== 'sidebar') {
        delete newSchedule[dragSource];
      }

      // Place item in new slot (overwrite if exists)
      newSchedule[targetKey] = draggedItem;
      return newSchedule;
    });

    setDraggedItem(null);
  };

  // Handle Drop back to Sidebar (Remove from schedule)
  const handleRemoveFromSchedule = (e: DragEvent) => {
    e.preventDefault();
    if (dragSource !== 'sidebar' && draggedItem) {
        setSchedule(prev => {
            const newSchedule = { ...prev };
            delete newSchedule[dragSource];
            return newSchedule;
        });
    }
    setDraggedItem(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Post': return <FileText className="w-3 h-3" />;
      case 'Image': return <ImageIcon className="w-3 h-3" />;
      case 'Video': return <Video className="w-3 h-3" />;
      case 'Audio': return <Music className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  // Filter out items that are already scheduled to avoid duplicates in sidebar? 
  // For now, we allow dragging multiple times from sidebar (copies), but moving within grid (moves).
  
  return (
    <div className="h-full flex flex-col animate-fade-in max-h-[calc(100vh-100px)]">
       <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-brand-500" />
            Content Scheduler
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Drag assets onto the calendar to plan your week.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden flex-col lg:flex-row">
        
        {/* SIDEBAR: Draggable Assets */}
        <div 
            className="w-full lg:w-72 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col shrink-0 overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={handleRemoveFromSchedule}
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">Unscheduled Assets</h3>
                <p className="text-xs text-gray-500 mt-1">Drag to calendar to schedule</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-gray-100 dark:bg-black/20">
                {savedItems.length === 0 ? (
                    <div className="text-center p-4 text-gray-400 text-xs">
                        No saved items found. Create content in the generators first.
                    </div>
                ) : (
                    savedItems.map(item => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item, 'sidebar')}
                            className="bg-white dark:bg-gray-700 p-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${item.type === 'Post' ? 'bg-blue-100 text-blue-700' : item.type === 'Video' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {getIcon(item.type)} {item.type}
                                </span>
                                <GripVertical className="w-4 h-4 text-gray-300" />
                            </div>
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed">
                                {item.title}
                            </p>
                        </div>
                    ))
                )}
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/20 text-center">
                <p className="text-[10px] text-red-500 font-bold flex items-center justify-center">
                    <Trash2 className="w-3 h-3 mr-1" /> Drop here to unschedule
                </p>
            </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
            {/* Header Row */}
            <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="p-4 text-xs font-bold text-gray-400 uppercase flex items-center justify-center border-r border-gray-200 dark:border-gray-800">
                    <Clock className="w-4 h-4" />
                </div>
                {DAYS.map(day => (
                    <div key={day} className="p-4 text-xs font-black text-gray-600 dark:text-gray-300 uppercase text-center border-r border-gray-200 dark:border-gray-800 last:border-0">
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Grid Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800">
                {TIMES.map(time => (
                    <div key={time} className="grid grid-cols-8 min-h-[140px] border-b border-gray-100 dark:border-gray-700/50">
                        {/* Time Label */}
                        <div className="p-3 text-xs font-bold text-gray-400 border-r border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-center">
                            {time}
                        </div>

                        {/* Day Columns */}
                        {DAYS.map(day => {
                            const key = `${day}-${time}`;
                            const scheduledItem = schedule[key];

                            return (
                                <div 
                                    key={key}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day, time)}
                                    className={`
                                        border-r border-gray-100 dark:border-gray-700/50 p-2 transition-colors relative group
                                        ${scheduledItem ? 'bg-brand-50/30 dark:bg-brand-900/5' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}
                                    `}
                                >
                                    {scheduledItem ? (
                                        <div 
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, scheduledItem, key)}
                                            className="w-full h-full bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-brand-200 dark:border-gray-600 p-2 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-brand-400 transition-all flex flex-col justify-between"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${scheduledItem.type === 'Video' ? 'bg-red-100 text-red-800' : 'bg-brand-100 text-brand-800'}`}>
                                                    {scheduledItem.type}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-medium text-gray-700 dark:text-gray-200 line-clamp-3 leading-tight">
                                                {scheduledItem.title}
                                            </p>
                                            {scheduledItem.type === 'Image' && (
                                                <div className="mt-1 h-8 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                                    <img src={scheduledItem.content} alt="" className="w-full h-full object-cover opacity-70" />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg w-full h-full flex items-center justify-center">
                                                <span className="text-gray-300 text-[10px] font-bold">+ Drop</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
