'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { RefreshCw, Calendar, MapPin, User, AlertCircle, ArrowLeft, Phone, Download } from 'lucide-react';
import Link from 'next/link';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Grievance {
  id: string;
  conversation_id: string;
  language: string;
  transcript: string;
  submitter_name: string | null;
  submitter_contact: string | null;
  incident_date: string | null;
  incident_location: string | null;
  people_involved: string | null;
  category: string | null;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingAudio, setDownloadingAudio] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    name: '',
    location: '',
    category: '',
    urgency: '',
    description: ''
  });

  // Fetch grievances
  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('labor_grievances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrievances(data || []);
    } catch (error) {
      console.error('Error fetching grievances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  // Apply filters FIRST
  const filteredGrievances = grievances.filter(g => {
    if (filters.dateFrom && new Date(g.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(g.created_at) > new Date(filters.dateTo)) return false;
    if (filters.name && !g.submitter_name?.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.location && !g.incident_location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.category && g.category !== filters.category) return false;
    if (filters.urgency && g.urgency !== filters.urgency) return false;
    if (filters.description && !g.description?.toLowerCase().includes(filters.description.toLowerCase())) return false;
    return true;
  });

  // Calculate stats FROM FILTERED DATA
  const stats = {
    total: filteredGrievances.length,
    high: filteredGrievances.filter(g => g.urgency === 'high').length,
    medium: filteredGrievances.filter(g => g.urgency === 'medium').length,
    low: filteredGrievances.filter(g => g.urgency === 'low').length,
  };

  // Count by category FROM FILTERED DATA
  const categoryCount = filteredGrievances.reduce((acc, g) => {
    const cat = g.category || 'other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(categoryCount), 1);

  // Toggle urgency filter
  const toggleUrgencyFilter = (urgency: string) => {
    setFilters(prev => ({
      ...prev,
      urgency: prev.urgency === urgency ? '' : urgency
    }));
  };

  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Download audio recording
  const downloadAudio = async (conversationId: string) => {
    setDownloadingAudio(conversationId);
    try {
      const response = await fetch(`/api/get-audio?chat_id=${conversationId}`);

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to get audio URL:', error);
        alert(error.error || 'Failed to download audio');
        return;
      }

      const data = await response.json();

      // Open the signed URL in a new tab to download
      window.open(data.audioUrl, '_blank');

    } catch (error) {
      console.error('Error downloading audio:', error);
      alert('Failed to download audio recording');
    } finally {
      setDownloadingAudio(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grievance Dashboard</h1>
            <p className="text-gray-600 mt-1">Mozambique Labour Voice - Analytics</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <Phone className="w-4 h-4" />
              Report Grievance
            </Link>
            <button
              onClick={fetchGrievances}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards - NOW CLICKABLE FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600 mt-1">Total Grievances</div>
          </div>
          <button
            onClick={() => toggleUrgencyFilter('high')}
            className={`bg-white rounded-lg shadow p-6 border-l-4 border-red-500 text-left hover:bg-red-50 transition ${
              filters.urgency === 'high' ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <div className="text-3xl font-bold text-red-600">{stats.high}</div>
            <div className="text-gray-600 mt-1">High Urgency {filters.urgency === 'high' && '✓'}</div>
          </button>
          <button
            onClick={() => toggleUrgencyFilter('medium')}
            className={`bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500 text-left hover:bg-yellow-50 transition ${
              filters.urgency === 'medium' ? 'ring-2 ring-yellow-500' : ''
            }`}
          >
            <div className="text-3xl font-bold text-yellow-600">{stats.medium}</div>
            <div className="text-gray-600 mt-1">Medium Urgency {filters.urgency === 'medium' && '✓'}</div>
          </button>
          <button
            onClick={() => toggleUrgencyFilter('low')}
            className={`bg-white rounded-lg shadow p-6 border-l-4 border-green-500 text-left hover:bg-green-50 transition ${
              filters.urgency === 'low' ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="text-3xl font-bold text-green-600">{stats.low}</div>
            <div className="text-gray-600 mt-1">Low Urgency {filters.urgency === 'low' && '✓'}</div>
          </button>
        </div>

        {/* Category Chart - NOW CLICKABLE FILTERS */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Grievances by Category (click to filter)</h2>
          <div className="space-y-3">
            {Object.entries(categoryCount).map(([category, count]) => (
              <button
                key={category}
                onClick={() => toggleCategoryFilter(category)}
                className={`w-full flex items-center gap-3 hover:bg-purple-50 rounded p-2 -m-2 transition ${
                  filters.category === category ? 'bg-purple-100' : ''
                }`}
              >
                <div className="w-32 text-sm font-medium text-gray-700 capitalize text-left">
                  {category.replace('_', ' ')}
                  {filters.category === category && ' ✓'}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className={`h-6 rounded-full flex items-center justify-end px-2 ${
                      filters.category === category ? 'bg-purple-700' : 'bg-purple-600'
                    }`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-white">{count}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Additional Filters</h2>
            {(filters.urgency || filters.category || filters.name || filters.location || filters.dateFrom || filters.dateTo) && (
              <button
                onClick={() => setFilters({
                  dateFrom: '',
                  dateTo: '',
                  name: '',
                  location: '',
                  category: '',
                  urgency: '',
                  description: ''
                })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value})}
                placeholder="Search name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                placeholder="Search location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Grievances Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Grievances ({filteredGrievances.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGrievances.map((grievance) => (
                  <tr key={grievance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(grievance.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grievance.submitter_name || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{grievance.incident_location || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {grievance.category?.replace('_', ' ') || 'Other'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(grievance.urgency)}`}>
                        {grievance.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {grievance.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => downloadAudio(grievance.conversation_id)}
                        disabled={downloadingAudio === grievance.conversation_id}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className={`w-3 h-3 ${downloadingAudio === grievance.conversation_id ? 'animate-pulse' : ''}`} />
                        {downloadingAudio === grievance.conversation_id ? 'Loading...' : 'Download'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
