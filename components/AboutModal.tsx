'use client';

import { X, ExternalLink, Code, Brain, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function AboutModal({ isOpen, onClose, isDarkMode }: AboutModalProps) {
  if (!isOpen) return null;

  const modalClass = `fixed inset-0 z-50 flex items-center justify-center p-4 ${
    isDarkMode ? 'bg-black bg-opacity-75' : 'bg-black bg-opacity-50'
  }`;

  const contentClass = `relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
  }`;

  const sectionClass = `p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`;
  const lastSectionClass = 'p-6';

  const techStackItems = [
    { name: 'Next.js 14', description: 'App Router, Server Components', icon: '⚛️' },
    { name: 'Tailwind CSS', description: 'Responsive design, dark mode', icon: '🎨' },
    { name: 'Notion API', description: 'Database integration', icon: '📝' },
    { name: 'Recharts', description: 'Analytics visualization', icon: '📊' },
    { name: 'OpenAI', description: 'Content summarization', icon: '🤖' },
    { name: 'n8n', description: 'Automated content ingestion', icon: '🔄' },
    { name: 'Windsurf (Cascade)', description: 'AI-assisted development', icon: '🏄‍♂️' }
  ];

  return (
    <div className={modalClass} onClick={onClose}>
      <div className={contentClass} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-500" />
              <div>
                <h2 className="text-2xl font-bold">AI Daily Learning Queue</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Portfolio Project by Your Name
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Problem Statement */}
        <div className={sectionClass}>
          <div className="flex items-start space-x-3">
            <Zap className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">The Problem</h3>
              <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Staying current with AI research, news, and resources is overwhelming. Information comes from 
                multiple sources, varies in quality, and requires significant time investment to process and prioritize.
              </p>
            </div>
          </div>
        </div>

        {/* Solution */}
        <div className={sectionClass}>
          <div className="flex items-start space-x-3">
            <Brain className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">The Solution</h3>
              <p className={`leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                An intelligent learning queue that automatically ingests, summarizes, and prioritizes AI content. 
                The system uses OpenAI to generate summaries and &quot;Why It Matters&quot; explanations, then presents 
                everything in a beautiful, filterable dashboard.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className="font-medium mb-1">🔄 Automated Ingestion</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    n8n workflows collect content from RSS feeds, APIs, and manual submissions
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className="font-medium mb-1">🤖 AI Processing</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    OpenAI generates summaries, relevance scores, and time estimates
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className="font-medium mb-1">📊 Smart Dashboard</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Filter, sort, and track learning progress with analytics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className={sectionClass}>
          <div className="flex items-start space-x-3">
            <Code className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Tech Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {techStackItems.map((tech, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{tech.icon}</span>
                    <div>
                      <h4 className="font-medium">{tech.name}</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {tech.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results & Portfolio Value */}
        <div className={lastSectionClass}>
          <h3 className="text-lg font-semibold mb-4">Portfolio Highlights</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${
              isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <h4 className="font-medium mb-2">🎯 Full-Stack Integration</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Demonstrates API integration, database management, responsive design, and AI workflow automation.
              </p>
            </div>
            <div className={`p-4 rounded-lg border-l-4 border-green-500 ${
              isDarkMode ? 'bg-gray-700' : 'bg-green-50'
            }`}>
              <h4 className="font-medium mb-2">🤖 AI-First Development</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Built entirely with AI assistance using Windsurf (Cascade), showcasing modern development workflows.
              </p>
            </div>
            <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${
              isDarkMode ? 'bg-gray-700' : 'bg-purple-50'
            }`}>
              <h4 className="font-medium mb-2">📈 Real Business Value</h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Solves a genuine problem while demonstrating SaaS dashboard design patterns and data visualization.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Built with ❤️ and AI assistance
              </p>
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span>View Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
