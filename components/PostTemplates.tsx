import React from 'react';
import FacebookThreadTemplate from './FacebookThreadTemplate';

const PostTemplates: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Viral Templates</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Proven structures to copy, paste, and profit.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <FacebookThreadTemplate />
        
        {/* Placeholder for future templates */}
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
            <span className="text-4xl mb-4">✨</span>
            <h3 className="font-bold text-lg">More Templates Coming Soon</h3>
            <p className="text-sm">We are adding new viral formats for X (Twitter) and LinkedIn.</p>
        </div>
      </div>
    </div>
  );
};

export default PostTemplates;
