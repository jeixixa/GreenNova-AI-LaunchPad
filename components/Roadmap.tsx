
import React, { useState, useEffect } from 'react';
import { generateBusinessRoadmap } from '../services/geminiService';
import { saveItem } from '../services/storageService';
import { CheckCircle, Circle, Loader2, Bookmark, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Roadmap: React.FC = () => {
  const [businessType, setBusinessType] = useState('E-commerce');
  const [roadmap, setRoadmap] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const result = await generateBusinessRoadmap(businessType);
      setRoadmap(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!roadmap) return;
    const success = saveItem({
        type: 'Post', // Using Post type for text content
        content: roadmap,
        title: `Roadmap: ${businessType} Launch Plan`,
    });
    if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!roadmap) generatePlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
         <div>
           <h1 className="text-3xl font-serif font-bold text-gray-900">Launch Roadmap</h1>
           <p className="text-gray-500 mt-1">Step-by-step plan to launch your sustainable business.</p>
         </div>
         <div className="flex items-center space-x-2">
           <select 
             value={businessType}
             onChange={(e) => setBusinessType(e.target.value)}
             className="p-2 border border-gray-300 rounded-lg text-sm"
           >
             <option>E-commerce</option>
             <option>SaaS</option>
             <option>Consulting</option>
             <option>Content Creation</option>
           </select>
           <button 
             onClick={generatePlan}
             className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
             disabled={loading}
           >
             {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Refresh Plan'}
           </button>
           {roadmap && (
                <button 
                    onClick={handleSave}
                    className="flex items-center bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 hover:text-gray-900"
                >
                    {saved ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Bookmark className="w-4 h-4 mr-2" />}
                    {saved ? 'Saved' : 'Save Plan'}
                </button>
           )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="prose prose-green max-w-none">
              <ReactMarkdown>{roadmap}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
            <h3 className="font-bold text-green-900 mb-4">Progress Tracker</h3>
            <div className="space-y-4">
               {[
                 { label: 'Define Niche', done: true },
                 { label: 'Setup Social Accounts', done: true },
                 { label: 'Generate First Content', done: true },
                 { label: 'Launch Website', done: false },
                 { label: 'First Sale', done: false },
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center">
                   {item.done ? (
                     <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                   ) : (
                     <Circle className="w-5 h-5 text-gray-400 mr-3" />
                   )}
                   <span className={item.done ? 'text-gray-900 line-through decoration-green-500/50' : 'text-gray-600'}>
                     {item.label}
                   </span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
