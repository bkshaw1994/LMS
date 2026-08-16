'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/authContext';
import { fetchApi } from '../../../lib/api';
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  Eye,
  Clock,
  Search,
  RefreshCw,
  Trash2,
  Globe,
  Monitor,
  Activity,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Calendar,
  Filter,
  BarChart3,
  UserCheck,
  GraduationCap,
  Mail,
  UserX,
  CheckCircle2,
} from 'lucide-react';

export default function TrainerVisitorsPage() {
  const { user, loading: authLoading } = useAuth();
  const isTrainerRole = user && (user.role === 'trainer' || user.role === 'admin' || user.role === 'instructor');

  const [visitors, setVisitors] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUniqueVisitors: 0,
    totalPageVisits: 0,
    studentVisitorsCount: 0,
    guestVisitorsCount: 0,
    activeToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'students' | 'guests'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'popular' | 'oldest'
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isTrainerRole) {
      loadVisitors();
    }
  }, [isTrainerRole]);

  const loadVisitors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi('/trainer/visitors');
      if (res.success) {
        setVisitors(res.visitors || []);
        setMetrics(
          res.metrics || {
            totalUniqueVisitors: 0,
            totalPageVisits: 0,
            studentVisitorsCount: 0,
            guestVisitorsCount: 0,
            activeToday: 0,
          }
        );
      } else {
        setError(res.message || 'Failed to load visitor tracking logs');
      }
    } catch (err) {
      setError(err.message || 'Network error fetching visitor list');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVisitor = async (id) => {
    if (!confirm('Are you sure you want to remove this IP visitor record from the log?')) return;
    setDeletingId(id);
    try {
      const res = await fetchApi(`/trainer/visitors/${id}`, { method: 'DELETE' });
      if (res.success) {
        setVisitors((prev) => prev.filter((v) => v._id !== id));
        setMetrics((prev) => ({
          ...prev,
          totalUniqueVisitors: Math.max(0, prev.totalUniqueVisitors - 1),
        }));
      } else {
        alert(res.message || 'Failed to delete visitor log');
      }
    } catch (err) {
      alert(err.message || 'Error deleting visitor log');
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to format date strings cleanly
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper to format user agent strings cleanly
  const formatUserAgent = (uaStr) => {
    if (!uaStr || uaStr === 'Unknown Browser / Device') return 'Standard HTTP Request';
    if (uaStr.includes('Chrome')) return 'Google Chrome';
    if (uaStr.includes('Safari') && !uaStr.includes('Chrome')) return 'Apple Safari';
    if (uaStr.includes('Firefox')) return 'Mozilla Firefox';
    if (uaStr.includes('Edge')) return 'Microsoft Edge';
    if (uaStr.includes('Postman')) return 'Postman API Client';
    if (uaStr.includes('curl')) return 'cURL CLI Tool';
    return uaStr.length > 35 ? uaStr.substring(0, 35) + '...' : uaStr;
  };

  // Filter & sort visitors list
  const filteredVisitors = visitors
    .filter((v) => {
      // Role filter check
      const isStudent = v.userRole === 'student' || (v.user && v.user.role === 'student') || !!v.studentName;
      if (roleFilter === 'students' && !isStudent) return false;
      if (roleFilter === 'guests' && isStudent) return false;

      // Search query check
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        (v.ipAddress && v.ipAddress.toLowerCase().includes(query)) ||
        (v.studentName && v.studentName.toLowerCase().includes(query)) ||
        (v.studentEmail && v.studentEmail.toLowerCase().includes(query)) ||
        (v.user && v.user.name && v.user.name.toLowerCase().includes(query)) ||
        (v.user && v.user.email && v.user.email.toLowerCase().includes(query)) ||
        (v.lastPath && v.lastPath.toLowerCase().includes(query)) ||
        (v.userAgent && v.userAgent.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.lastVisitedAt) - new Date(a.lastVisitedAt);
      if (sortBy === 'oldest') return new Date(a.lastVisitedAt) - new Date(b.lastVisitedAt);
      if (sortBy === 'popular') return (b.visitCount || 0) - (a.visitCount || 0);
      return 0;
    });

  // Auth Protection Check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-md border border-slate-200">
          <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
          <span className="text-sm font-semibold text-slate-700">Verifying Trainer Authorization...</span>
        </div>
      </div>
    );
  }

  if (!isTrainerRole) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-600 text-sm mb-6">
            The Visitor Tracking Dashboard is strictly reserved for course trainers, instructors, and system administrators.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 w-full gradient-bg-indigo text-white font-bold py-3 rounded-xl shadow-md hover:scale-[1.02] transition-transform text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Curriculum Roadmap</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Link
                  href="/trainer"
                  className="inline-flex items-center text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Back to Instructor Portal</span>
                </Link>
                <span className="inline-flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Trainer Access Only</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <Globe className="w-8 h-8 text-indigo-400" />
                <span>Visitor & Student IP Activity Dashboard</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time website traffic logs detailing IP addresses, logged-in student user identities, page visits, and browser signatures.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadVisitors}
                disabled={loading}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-xs focus:outline-none"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
                <span>Refresh Logs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Unique IPs</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{metrics.totalUniqueVisitors}</span>
              <span className="text-xs text-slate-500 ml-2 font-medium">Distinct IP Addresses</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Logged-in Students</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-700">{metrics.studentVisitorsCount || 0}</span>
              <span className="text-xs text-slate-500 ml-2 font-medium">Authenticated Students</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guest Visitors</span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-800">{metrics.guestVisitorsCount || 0}</span>
              <span className="text-xs text-slate-500 ml-2 font-medium">Anonymous Guests</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Page Visits</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{metrics.totalPageVisits}</span>
              <span className="text-xs text-slate-500 ml-2 font-medium">Total HTTP Requests</span>
            </div>
          </div>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setRoleFilter('all')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                roleFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Visitors ({visitors.length})
            </button>
            <button
              onClick={() => setRoleFilter('students')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                roleFilter === 'students'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Logged-in Students ({metrics.studentVisitorsCount || 0})</span>
            </button>
            <button
              onClick={() => setRoleFilter('guests')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                roleFilter === 'guests'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anonymous Guests ({metrics.guestVisitorsCount || 0})
            </button>
          </div>

          {/* Search Input & Sort */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Visits</option>
              <option value="oldest">First Visited</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-2xl flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            <button onClick={loadVisitors} className="text-xs font-bold text-red-800 underline hover:text-red-900">
              Try Again
            </button>
          </div>
        )}

        {/* Visitors Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Website Visitors & Student Identity Logs</h2>
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {filteredVisitors.length}
              </span>
            </div>
            {(searchQuery || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Reset Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">Loading Visitor & Student Logs...</p>
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">No Visitor Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || roleFilter !== 'all'
                  ? 'No visitor logs match your search or filter selection. Try resetting filters.'
                  : 'No visitor IP logs recorded yet. Visit any page on the site to trigger automatic logging.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-6">Visitor Identity / Student Profile</th>
                    <th className="py-3.5 px-6">Visitor IP Address</th>
                    <th className="py-3.5 px-6">Total Visits</th>
                    <th className="py-3.5 px-6">Last Path</th>
                    <th className="py-3.5 px-6">Device / Browser</th>
                    <th className="py-3.5 px-6">Last Visited Time</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredVisitors.map((visitor) => {
                    const isStudent = visitor.userRole === 'student' || (visitor.user && visitor.user.role === 'student') || !!visitor.studentName;
                    const studentName = visitor.studentName || (visitor.user ? visitor.user.name : '');
                    const studentEmail = visitor.studentEmail || (visitor.user ? visitor.user.email : '');

                    return (
                      <tr key={visitor._id} className={`hover:bg-indigo-50/30 transition-colors ${isStudent ? 'bg-emerald-50/20' : ''}`}>
                        {/* Visitor Identity / Student Profile */}
                        <td className="py-4 px-6">
                          {isStudent && studentName ? (
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl gradient-bg-indigo flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                                {studentName[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-extrabold text-slate-900 text-xs">{studentName}</span>
                                  <span className="inline-flex items-center space-x-1 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    <GraduationCap className="w-3 h-3 text-emerald-600" />
                                    <span>Student</span>
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[180px]">
                                  {studentEmail}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2.5">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                                <UserX className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-700 text-xs block">Anonymous Visitor</span>
                                <span className="text-[10px] text-slate-400 font-medium">Guest / Not Logged In</span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* IP Address */}
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {visitor.ipAddress}
                          </span>
                        </td>

                        {/* Total Visits */}
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700">
                            {visitor.visitCount || 1} {visitor.visitCount === 1 ? 'visit' : 'visits'}
                          </span>
                        </td>

                        {/* Last Path */}
                        <td className="py-4 px-6">
                          <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {visitor.lastPath || '/'}
                          </span>
                        </td>

                        {/* Device / Browser */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                            <Monitor className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span title={visitor.userAgent}>{formatUserAgent(visitor.userAgent)}</span>
                          </div>
                        </td>

                        {/* Last Visited Time */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(visitor.lastVisitedAt)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteVisitor(visitor._id)}
                            disabled={deletingId === visitor._id}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
                            title="Delete IP Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
