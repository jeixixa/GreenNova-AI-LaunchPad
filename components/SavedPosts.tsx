import React, { useEffect, useState } from 'react';
import { SavedItem } from '../types';
import { getSavedItems, deleteItem } from '../services/storageService';
import { Trash2, Copy, ExternalLink, FileText, Image as ImageIcon, Video, Music, Search, LayoutGrid, List, X, Play, Pause, Download, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SavedPosts: React.FC = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Post' | 'Image' | 'Video' | 'Audio'>('All');
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    setItems(getSavedItems());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedItems = deleteItem(id);
      setItems(updatedItems);
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    // Could add toast here
  };

  const filteredItems = items.filter(item => {
    const matchesType = filter === 'All' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const renderIcon = (type: string) => {
    switch (type) {
      case 'Post': return <FileText className="w-4 h-4" />;
      case 'Image': return <ImageIcon className="w-4 h-4" />;
      case 'Video': return <Video className="w-4 h-4" />;
      case 'Audio': return <Music className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Visual Audio Player Component
  const AudioCardPreview = ({ item }: { item: SavedItem }) => (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-white relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
            <Music className="w-6 h-6 text-brand-400" />
        </div>
        <div className="flex items-center justify-center gap-1 h-8 mb-2">
            {[...Array(8)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-1 bg-brand-500 rounded-full animate-pulse"
                    style={{ 
                        height: `${Math.random() * 100}%`, 
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '1s'
                    }} 
                />
            ))}
        </div>
        <p className="text-xs text-gray-400 font-mono">Audio Clip</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col animate-fade-in">
      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 shrink-0">
        <div>
           <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Saved Content</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Your library of AI-generated assets.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* View Toggle */}
          <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
             <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                title="Gallery View"
             >
                <LayoutGrid className="w-4 h-4" />
             </button>
             <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                title="List View"
             >
                <List className="w-4 h-4" />
             </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
            />
          </div>

          {/* Type Filters */}
          <div className="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto custom-scrollbar">
            {['All', 'Post', 'Image', 'Video', 'Audio'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${filter === f ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-full mb-4 shadow-sm">
            <Bookmark className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Library is empty</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Saved content will appear here.</p>
        </div>
      ) : (
        <>
            {/* GRID VIEW */}
            {viewMode === 'grid' && (
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                        {filteredItems.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-[280px]"
                            >
                                {/* Thumbnail Area */}
                                <div className="h-[160px] bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                                    {item.type === 'Image' && (
                                        <img src={item.content} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    )}
                                    {item.type === 'Video' && (
                                        <div className="relative w-full h-full bg-black">
                                            <video 
                                                src={item.content} 
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                                                muted 
                                                loop 
                                                onMouseOver={(e) => e.currentTarget.play()} 
                                                onMouseOut={(e) => e.currentTarget.pause()}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                                                    <Play className="w-4 h-4 text-white fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {item.type === 'Audio' && <AudioCardPreview item={item} />}
                                    {item.type === 'Post' && (
                                        <div className="p-4 h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-[10px] text-gray-500 dark:text-gray-400 overflow-hidden relative">
                                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
                                            <ReactMarkdown className="prose prose-xs dark:prose-invert max-w-none">{item.content.substring(0, 300)}</ReactMarkdown>
                                        </div>
                                    )}

                                    {/* Type Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`
                                            text-[10px] font-bold uppercase px-2 py-1 rounded-lg backdrop-blur-md shadow-sm flex items-center gap-1 border border-white/10
                                            ${item.type === 'Post' ? 'bg-blue-500/90 text-white' : 
                                            item.type === 'Image' ? 'bg-purple-500/90 text-white' :
                                            item.type === 'Video' ? 'bg-red-500/90 text-white' : 'bg-amber-500/90 text-white'}
                                        `}>
                                            {renderIcon(item.type)}
                                            {item.type}
                                        </span>
                                    </div>

                                    {/* Delete Button */}
                                    <button 
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Info Area */}
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-brand-500 transition-colors">{item.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                            View Details <ExternalLink className="w-3 h-3 ml-1" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* LIST VIEW */}
            {viewMode === 'list' && (
                <div className="flex-1 flex gap-6 overflow-hidden flex-col md:flex-row">
                    <div className="w-full md:w-1/3 lg:w-1/4 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {filteredItems.map(item => (
                        <div 
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`
                            p-4 rounded-xl border cursor-pointer transition-all group relative
                            ${selectedItem?.id === item.id 
                            ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-700 ring-1 ring-brand-200 dark:ring-brand-700' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-brand-200 hover:shadow-sm'}
                        `}
                        >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`
                            text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1
                            ${item.type === 'Post' ? 'bg-blue-100 text-blue-700' : 
                                item.type === 'Image' ? 'bg-purple-100 text-purple-700' :
                                item.type === 'Video' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}
                            `}>
                            {renderIcon(item.type)}
                            {item.type}
                            </span>
                            <span className="text-[10px] text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 mb-1">{item.title}</h3>
                        
                        <button 
                            onClick={(e) => handleDelete(item.id, e)}
                            className="absolute top-2 right-2 z-20 p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all border border-gray-100 dark:border-gray-600 shadow-sm backdrop-blur-sm"
                            title="Delete Item"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                    ))}
                    </div>

                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full md:h-auto">
                        {selectedItem ? (
                           // Re-use preview logic (extracted or inline)
                           <PreviewPane item={selectedItem} handleCopy={handleCopy} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <p>Select an item to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
      )}

      {/* Modal for Grid View Detail */}
      {viewMode === 'grid' && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedItem(null)}>
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-md">{selectedItem.title}</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            {renderIcon(selectedItem.type)} {selectedItem.type} • {new Date(selectedItem.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedItem.type === 'Post' && (
                            <button onClick={() => handleCopy(selectedItem.content)} className="flex items-center text-xs font-bold px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600">
                                <Copy className="w-3 h-3 mr-1.5" /> Copy Text
                            </button>
                        )}
                        <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-black/50 flex items-center justify-center custom-scrollbar">
                    <PreviewPane item={selectedItem} handleCopy={handleCopy} isModal />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Extracted Preview Pane for reuse
const PreviewPane = ({ item, handleCopy, isModal = false }: { item: SavedItem, handleCopy: (t: string) => void, isModal?: boolean }) => {
    return (
        <div className={`w-full ${isModal ? '' : 'h-full flex flex-col'}`}>
             {!isModal && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                    <div className="min-w-0 mr-4">
                        <h2 className="font-bold text-gray-900 dark:text-white truncate">{item.title}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Created {new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        {item.type === 'Post' && (
                            <button onClick={() => handleCopy(item.content)} className="text-xs font-bold flex items-center px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <Copy className="w-3 h-3 mr-1.5" /> Copy
                            </button>
                        )}
                    </div>
                </div>
             )}
            
            <div className={`flex-1 ${isModal ? '' : 'p-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50'} flex items-center justify-center`}>
                {item.type === 'Post' && (
                    <div className="prose prose-sm prose-brand dark:prose-invert w-full max-w-none bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <ReactMarkdown>{item.content}</ReactMarkdown>
                    </div>
                )}

                {item.type === 'Image' && (
                    <div className="relative max-w-full text-center">
                        <img src={item.content} alt={item.title} className="max-h-[70vh] max-w-full rounded-lg shadow-2xl object-contain mx-auto" />
                        <a href={item.content} download={`image-${item.id}.png`} className="inline-flex items-center mt-4 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full font-bold text-sm backdrop-blur-md border border-white/20 transition-all">
                            <Download className="w-4 h-4 mr-2" /> Download Original
                        </a>
                    </div>
                )}

                {item.type === 'Video' && (
                    <div className="text-center w-full max-w-3xl">
                        <video src={item.content} controls className="w-full rounded-xl shadow-2xl bg-black max-h-[70vh]" />
                        <a href={item.content} download={`video-${item.id}.mp4`} className="inline-flex items-center mt-6 text-brand-600 dark:text-brand-400 font-bold text-sm hover:underline">
                            <Download className="w-4 h-4 mr-2" /> Download Video MP4
                        </a>
                        <p className="text-xs text-gray-500 mt-2">Check 'My Computer' downloads folder after saving.</p>
                    </div>
                )}

                {item.type === 'Audio' && (
                    <div className="w-full max-w-lg">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative group">
                                <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping opacity-75"></div>
                                <Music className="w-10 h-10 text-brand-500 relative z-10" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Audio Recording</h3>
                            <p className="text-sm text-gray-500 mb-6">{item.title}</p>
                            
                            <audio controls src={item.content} className="w-full mb-6" />
                            
                            <a href={item.content} download={`audio-${item.id}.wav`} className="inline-flex items-center justify-center w-full py-3 rounded-xl font-bold text-white bg-gray-900 dark:bg-brand-600 hover:bg-gray-800 dark:hover:bg-brand-700 transition-colors">
                                <Download className="w-4 h-4 mr-2" /> Download WAV
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SavedPosts;