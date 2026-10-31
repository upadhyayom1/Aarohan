import React, { useState, useEffect, useMemo } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { api } from '../../lib/api';
import { Button, Input, Select } from '../../components/ui';
import { Search, Loader2 } from 'lucide-react';

export function AdminAuditLogsPage() {
  const store = useCampusStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    let mounted = true;
    async function fetchLogs() {
      try {
        setLoading(true);
        const res = await api.admin.getAuditLogs({
          role: roleFilter !== 'All' ? roleFilter.toLowerCase() : undefined,
          search: searchQuery.trim() || undefined,
        });
        if (mounted && res?.logs) {
          setLogs(res.logs);
        }
      } catch (err) {
        console.warn('Backend audit logs unavailable, falling back to local store', err);
        if (mounted && store.auditLogs) {
          setLogs(store.auditLogs);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const timer = setTimeout(fetchLogs, 250);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [roleFilter, searchQuery]);

  const displayLogs = useMemo(() => {
    const list = logs.length > 0 ? logs : store.auditLogs;
    return list.filter(log => {
      const actorRole = (log.actor_role || log.actorRole || '').toLowerCase();
      if (roleFilter !== 'All' && actorRole !== roleFilter.toLowerCase()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const actor = (log.actor || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const entity = (log.entity || '').toLowerCase();
        const summary = (log.summary || '').toLowerCase();
        if (!actor.includes(q) && !action.includes(q) && !entity.includes(q) && !summary.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [logs, store.auditLogs, roleFilter, searchQuery]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E4E4E1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#858585] block mb-1">
            IMMUTABLE GOVERNANCE AUDIT TRAIL
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
            Placement Audit Registry
          </h1>
          <p className="text-sm text-[#666666] mt-1 max-w-xl">
            Immutable chronological record of administrative authorizations, status changes, and student dossier modifications.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by actor, action, or entity..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <span className="text-[#858585]">Role:</span>
          <Select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-40"
          >
            <option value="All">All Roles</option>
            <option value="student">Student</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Administrator</option>
          </Select>
        </div>
      </div>

      {/* Audit Registry Table */}
      <div className="border border-[#222222] bg-white">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-xs font-mono text-[#858585] gap-2">
            <Loader2 className="animate-spin text-[#111111]" size={18} />
            <span>Retrieving institutional governance audit trail...</span>
          </div>
        ) : displayLogs.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-[#858585]">
            No governance events logged matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#FAFAF9] border-b border-[#E4E4E1] text-[#858585] uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4 text-right">Summary Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E1]">
                {displayLogs.map(log => {
                  const id = log.id;
                  const ts = log.timestamp || 'Just now';
                  const actor = log.actor || 'System';
                  const role = log.actor_role || log.actorRole || 'admin';
                  const action = log.action || 'MUTATION';
                  const entity = log.entity || 'General';
                  const summary = log.summary || log.details || 'System operation executed';

                  return (
                    <tr key={id} className="hover:bg-[#F5F5F3]">
                      <td className="py-3.5 px-4 text-[#858585] whitespace-nowrap">
                        {typeof ts === 'string' && ts.includes('T') ? ts.replace('T', ' ').slice(0, 19) : ts}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-[#111111] block">{actor}</strong>
                        <span className="text-[10px] uppercase text-[#858585]">{role}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase bg-[#FAFAF9] border border-[#222222] px-2 py-0.5 rounded-[2px] font-bold">
                          {action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#111111]">{entity}</td>
                      <td className="py-3.5 px-4 text-right text-[#666666] max-w-md">{summary}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
