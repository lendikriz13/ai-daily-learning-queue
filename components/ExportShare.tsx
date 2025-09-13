'use client';

import { useState } from 'react';
import { Download, Share2, FileText, Table, Link, Copy, Check, Mail, Twitter, Linkedin } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  sourceType: string;
  summary: string;
  whyItMatters: string;
  tags: string[];
  score: number | null;
  estimatedTime: number | null;
  consumed: boolean;
  dateAdded: string | null;
  publicationDate: string | null;
  link: string | null;
}

interface ExportShareProps {
  items: Item[];
  bookmarkedItems: Set<string>;
  isDarkMode: boolean;
}

export default function ExportShare({ items, bookmarkedItems, isDarkMode }: ExportShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'bookmarked' | 'consumed'>('bookmarked');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const getFilteredItems = () => {
    switch (exportType) {
      case 'bookmarked':
        return items.filter(item => bookmarkedItems.has(item.id));
      case 'consumed':
        return items.filter(item => item.consumed);
      case 'all':
      default:
        return items;
    }
  };

  const exportToPDF = async () => {
    const filteredItems = getFilteredItems();
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Daily Learning Queue - ${exportType.charAt(0).toUpperCase() + exportType.slice(1)} Items</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2C3E50; padding-bottom: 20px; }
          .item { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .title { font-size: 18px; font-weight: bold; color: #2C3E50; margin-bottom: 10px; }
          .meta { font-size: 12px; color: #666; margin-bottom: 15px; }
          .summary { margin-bottom: 15px; line-height: 1.6; }
          .why-matters { background: #f8f9fa; padding: 15px; border-left: 4px solid #5DADE2; margin-bottom: 15px; }
          .tags { margin-top: 10px; }
          .tag { display: inline-block; background: #e9ecef; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 11px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AI Daily Learning Queue</h1>
          <p>${exportType.charAt(0).toUpperCase() + exportType.slice(1)} Items (${filteredItems.length} total)</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        ${filteredItems.map(item => `
          <div class="item">
            <div class="title">${item.title}</div>
            <div class="meta">
              ${item.sourceType} • Score: ${item.score ?? 'N/A'} • 
              ${item.estimatedTime ? `${item.estimatedTime} min read` : 'Time unknown'} • 
              ${item.consumed ? 'Consumed' : 'Not consumed'}
            </div>
            <div class="summary">${item.summary}</div>
            <div class="why-matters">
              <strong>Why It Matters:</strong> ${item.whyItMatters}
            </div>
            ${item.tags.length > 0 ? `
              <div class="tags">
                <strong>Tags:</strong> 
                ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
            ${item.link ? `<div style="margin-top: 10px;"><strong>Link:</strong> <a href="${item.link}">${item.link}</a></div>` : ''}
          </div>
        `).join('')}
        <div class="footer">
          <p>Exported from AI Daily Learning Queue Dashboard</p>
        </div>
      </body>
      </html>
    `;

    // Create and download PDF (using browser's print functionality)
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const exportToCSV = () => {
    const filteredItems = getFilteredItems();
    
    const headers = ['Title', 'Source Type', 'Summary', 'Why It Matters', 'Tags', 'Score', 'Estimated Time', 'Consumed', 'Date Added', 'Link'];
    
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(item => [
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.sourceType}"`,
        `"${item.summary.replace(/"/g, '""')}"`,
        `"${item.whyItMatters.replace(/"/g, '""')}"`,
        `"${item.tags.join('; ')}"`,
        item.score ?? '',
        item.estimatedTime ?? '',
        item.consumed ? 'Yes' : 'No',
        item.dateAdded ?? '',
        item.link ?? ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ai-learning-queue-${exportType}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateShareableLink = async () => {
    const filteredItems = getFilteredItems();
    const shareData = {
      type: exportType,
      items: filteredItems.map(item => ({
        title: item.title,
        sourceType: item.sourceType,
        summary: item.summary,
        tags: item.tags,
        score: item.score,
        link: item.link
      })),
      generatedAt: new Date().toISOString()
    };

    // In a real app, you'd send this to your backend and get a share ID
    // For demo, we'll create a data URL
    const encodedData = btoa(JSON.stringify(shareData));
    const shareUrl = `${window.location.origin}/shared/${encodedData}`;
    setShareUrl(shareUrl);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `Check out my curated AI learning collection from AI Daily Learning Queue! ${getFilteredItems().length} ${exportType} items.`;
    const url = shareUrl || window.location.href;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent('AI Learning Collection')}&body=${encodeURIComponent(text + '\n\n' + url)}`
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isDarkMode 
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Share2 className="w-4 h-4" />
        Export & Share
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-md w-full rounded-xl p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Export & Share
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        {/* Export Type Selection */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            What to export:
          </label>
          <div className="space-y-2">
            {[
              { value: 'bookmarked', label: `Bookmarked Items (${items.filter(item => bookmarkedItems.has(item.id)).length})` },
              { value: 'consumed', label: `Consumed Items (${items.filter(item => item.consumed).length})` },
              { value: 'all', label: `All Items (${items.length})` }
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="exportType"
                  value={option.value}
                  checked={exportType === option.value}
                  onChange={(e) => setExportType(e.target.value as any)}
                  className="mr-3"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3 mb-6">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Export Options
          </h3>
          
          <button
            onClick={exportToPDF}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'border-gray-600 hover:bg-gray-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5 text-red-500" />
            <div className="text-left">
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Export as PDF
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Formatted document for reading
              </div>
            </div>
          </button>

          <button
            onClick={exportToCSV}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'border-gray-600 hover:bg-gray-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Table className="w-5 h-5 text-green-500" />
            <div className="text-left">
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Export as CSV
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Spreadsheet format for analysis
              </div>
            </div>
          </button>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Share Collection
          </h3>
          
          <button
            onClick={generateShareableLink}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'border-gray-600 hover:bg-gray-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Link className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Generate Shareable Link
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Create a link others can view
              </div>
            </div>
          </button>

          {shareUrl && (
            <div className={`p-3 rounded-lg border ${
              isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className={`flex-1 px-2 py-1 text-sm rounded border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-gray-300' 
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                />
                <button
                  onClick={() => copyToClipboard(shareUrl)}
                  className={`p-1 rounded ${
                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => shareToSocial('twitter')}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  <Twitter className="w-3 h-3" />
                  Twitter
                </button>
                <button
                  onClick={() => shareToSocial('linkedin')}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-700 text-white hover:bg-blue-800"
                >
                  <Linkedin className="w-3 h-3" />
                  LinkedIn
                </button>
                <button
                  onClick={() => shareToSocial('email')}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-700"
                >
                  <Mail className="w-3 h-3" />
                  Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
