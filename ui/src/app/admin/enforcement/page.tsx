'use client';

import { useEffect, useState } from 'react';
import {
  ShieldExclamationIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface RiskScore {
  id: string;
  user: {
    id: string;
    full_name: string;
    role: string;
    email: string | null;
  };
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  violation_count: number;
  last_violation_at: string | null;
  notes: string | null;
  created_at: string;
}

interface EnforcementAction {
  id: string;
  action_type: string;
  description: string;
  severity: string;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  risk_score: {
    user: {
      full_name: string;
      role: string;
    };
  };
  taken_by_user: {
    full_name: string;
    role: string;
  };
}

interface Summary {
  total: number;
  byLevel: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentViolations: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function EnforcementDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [actions, setActions] = useState<EnforcementAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setError(null);
      const [summaryRes, scoresRes, actionsRes] = await Promise.all([
        fetch(`${API_BASE}/enforcement/risk-scores/summary`),
        fetch(`${API_BASE}/enforcement/risk-scores${filter ? `?level=${filter}` : ''}`),
        fetch(`${API_BASE}/enforcement/actions/recent?limit=20`),
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (scoresRes.ok) setRiskScores(await scoresRes.json());
      if (actionsRes.ok) setActions(await actionsRes.json());

      setLastUpdated(new Date());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load enforcement data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return <XCircleIcon className="w-5 h-5" />;
      case 'MEDIUM':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'LOW':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <ShieldExclamationIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-900 font-semibold">Loading enforcement data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <XCircleIcon className="w-6 h-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShieldExclamationIcon className="w-8 h-8 mr-3 text-red-600" />
              Enforcement & Risk Management
            </h1>
            <p className="text-gray-600 mt-1">Monitor staff risk scores and enforcement actions</p>
          </div>
          <div className="text-right">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
            <p className="text-sm text-gray-500 mt-2">
              <ClockIcon className="w-4 h-4 inline mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-2">
                <UserIcon className="w-6 h-6 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-600 ml-2">Total Staff</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">{summary.total}</p>
            </div>

            <div className="bg-green-50 rounded-lg shadow p-6 border-2 border-green-200">
              <div className="flex items-center mb-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-sm font-medium text-green-800 ml-2">Low Risk</h3>
              </div>
              <p className="text-3xl font-bold text-green-900">{summary.byLevel.low}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg shadow p-6 border-2 border-yellow-200">
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                <h3 className="text-sm font-medium text-yellow-800 ml-2">Medium Risk</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-900">{summary.byLevel.medium}</p>
            </div>

            <div className="bg-orange-50 rounded-lg shadow p-6 border-2 border-orange-200">
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                <h3 className="text-sm font-medium text-orange-800 ml-2">High Risk</h3>
              </div>
              <p className="text-3xl font-bold text-orange-900">{summary.byLevel.high}</p>
            </div>

            <div className="bg-red-50 rounded-lg shadow p-6 border-2 border-red-200">
              <div className="flex items-center mb-2">
                <XCircleIcon className="w-6 h-6 text-red-600" />
                <h3 className="text-sm font-medium text-red-800 ml-2">Critical Risk</h3>
              </div>
              <p className="text-3xl font-bold text-red-900">{summary.byLevel.critical}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Risk Level:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>

        {/* Risk Scores Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Staff Risk Scores</h2>
          </div>
          <div className="overflow-x-auto">
            {riskScores.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <ShieldExclamationIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No risk scores found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Violations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Violation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {riskScores.map((score) => (
                    <tr key={score.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{score.user.full_name}</div>
                            <div className="text-sm text-gray-500">{score.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{score.user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full border ${getRiskLevelColor(score.risk_level)}`}>
                          {getRiskLevelIcon(score.risk_level)}
                          {score.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl font-bold text-gray-900">{score.risk_score}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{score.violation_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.last_violation_at ? new Date(score.last_violation_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {score.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Enforcement Actions</h2>
          </div>
          <div className="p-6">
            {actions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No enforcement actions recorded</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actions.map((action) => (
                  <div key={action.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskLevelColor(action.severity)}`}>
                            {action.action_type}
                          </span>
                          <span className="text-sm text-gray-600">
                            for {action.risk_score.user.full_name} ({action.risk_score.user.role})
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-2">{action.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Taken by: {action.taken_by_user.full_name}</span>
                          <span>Date: {new Date(action.created_at).toLocaleString()}</span>
                        </div>
                        {action.resolution && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-xs text-green-800">
                              <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                              Resolved: {action.resolution}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              {new Date(action.resolved_at!).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
