import React, { useState, useMemo } from 'react';
import { useCampusStore } from '../../lib/useStore';
import { Button, Input, Select } from '../../components/ui';
import { ShieldAlert, Search, Filter, ShieldCheck } from 'lucide-react';

export function AdminAuditLogsPage() {
  const { auditLogs } = useCampusStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (roleFilter !== 'All' && log.actorRole !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !log.actor.toLowerCase().includes(q) &&
          !log.action.toLowerCase().includes(q) &&
          !log.entity.toLowerCase().includes(q) &&
          !log.summary.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, roleFilter, searchQuery]);

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
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#F5F5F3]">
                  <td className="py-3.5 px-4 text-[#858585] whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <strong className="text-[#111111] block">{log.actor}</strong>
                    <span className="text-[10px] uppercase text-[#858585]">{log.actorRole}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] uppercase bg-[#FAFAF9] border border-[#222222] px-2 py-0.5 rounded-[2px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#111111]">{log.entity}</td>
                  <td className="py-3.5 px-4 text-right text-[#666666] max-w-md">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
