import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCheck,
  Eye,
  Edit2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { TeamLeaderSummary, PaginatedResponse, EntityStatus } from '../../types';
import { useToast } from '../../hooks/useToast';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SearchBar } from '../../components/shared/SearchBar';
import { FilterBar } from '../../components/shared/FilterBar';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const TeamLeaderManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<TeamLeaderSummary | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Team Lead',
    profilePhotoUrl: '',
    password: '',
  });

  const { data, isLoading } = useQuery<PaginatedResponse<TeamLeaderSummary>>({
    queryKey: ['team-leaders', page, limit, search, department, status],
    queryFn: () =>
      api.get<PaginatedResponse<TeamLeaderSummary>>('/api/team-leaders', {
        page,
        limit,
        search,
        department: department === 'ALL' ? undefined : department,
        status: status === 'ALL' ? undefined : status,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (newTL: typeof formData) => api.post('/api/team-leaders', newTL),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-leaders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
      success('Team Leader Created', 'New leadership account registered.');
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toastError('Creation Failed', err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeamLeaderSummary> }) =>
      api.put(`/api/team-leaders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-leaders'] });
      success('Team Leader Updated', 'Changes saved successfully.');
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toastError('Update Failed', err.message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: EntityStatus }) =>
      api.patch(`/api/team-leaders/${id}/status`, { status: newStatus }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['team-leaders'] });
      success('Status Updated', `Team leader status is now ${vars.newStatus}.`);
    },
    onError: (err: any) => {
      toastError('Action Failed', err.message);
    },
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      employeeId: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: 'Team Lead',
      profilePhotoUrl: '',
      password: '',
    });
  };

  const handleOpenEdit = (leader: TeamLeaderSummary) => {
    setSelectedLeader(leader);
    setFormData({
      fullName: leader.fullName,
      employeeId: leader.employeeId,
      email: leader.email,
      phone: leader.phone || '',
      department: leader.department,
      designation: leader.designation || 'Team Lead',
      profilePhotoUrl: leader.profilePhotoUrl || '',
      password: '',
    });
    setEditModalOpen(true);
  };

  const columns: Column<TeamLeaderSummary>[] = [
    {
      key: 'fullName',
      header: 'Team Leader',
      render: (tl) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-blue-200">
            {tl.profilePhotoUrl ? (
              <img src={tl.profilePhotoUrl} alt={tl.fullName} className="w-full h-full object-cover" />
            ) : (
              tl.fullName.charAt(0)
            )}
          </div>
          <div className="truncate">
            <span className="font-semibold text-navy-900 block leading-tight">{tl.fullName}</span>
            <span className="text-xs text-navy-500 block truncate">{tl.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (tl) => (
        <span className="font-mono text-xs text-navy-700 bg-navy-50 px-2 py-1 rounded border border-navy-200">
          {tl.employeeId}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Assigned Department',
      render: (tl) => (
        <div>
          <span className="font-semibold text-navy-900 block leading-tight">{tl.department}</span>
          <span className="text-xs text-navy-500 block">{tl.designation}</span>
        </div>
      ),
    },
    {
      key: 'assignedTeams',
      header: 'Teams Supervised',
      render: (tl) => (
        <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
          {tl.assignedTeams && tl.assignedTeams.length > 0 ? (
            tl.assignedTeams.map((team) => (
              <span
                key={team.id}
                className="text-[11px] font-medium bg-corporate-50 text-corporate-700 px-2 py-0.5 rounded border border-corporate-200"
              >
                {team.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-navy-400 italic">No assigned team yet</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (tl) => <StatusBadge status={tl.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (tl) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedLeader(tl);
              setViewModalOpen(true);
            }}
            className="p-1.5 text-navy-500 hover:text-corporate-600 hover:bg-navy-100 rounded transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleOpenEdit(tl)}
            className="p-1.5 text-navy-500 hover:text-corporate-600 hover:bg-navy-100 rounded transition-colors"
            title="Edit Leader / Department"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const newStatus = tl.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
              toggleStatusMutation.mutate({ id: tl.id, newStatus });
            }}
            className={`p-1.5 rounded transition-colors ${
              tl.status === 'ACTIVE'
                ? 'text-navy-400 hover:text-rose-600 hover:bg-rose-50'
                : 'text-navy-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={tl.status === 'ACTIVE' ? 'Deactivate Leader' : 'Activate Leader'}
          >
            {tl.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Team Leader Management</h2>
          <p className="text-xs text-navy-500 mt-0.5">
            Oversee department leaders, team assignments, and supervisory credentials
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetForm();
            setCreateModalOpen(true);
          }}
          leftIcon={<UserCheck className="w-4 h-4" />}
        >
          Add Team Leader
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-navy-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search team leaders by name, ID, or email..."
          className="max-w-md"
        />

        <FilterBar
          filters={[
            {
              id: 'dept',
              label: 'Department',
              value: department,
              onChange: (v) => {
                setDepartment(v);
                setPage(1);
              },
              options: [
                { label: 'All Departments', value: 'ALL' },
                { label: 'Engineering', value: 'Engineering' },
                { label: 'Product Design', value: 'Product Design' },
                { label: 'Quality Assurance', value: 'Quality Assurance' },
              ],
            },
            {
              id: 'status',
              label: 'Status',
              value: status,
              onChange: (v) => {
                setStatus(v);
                setPage(1);
              },
              options: [
                { label: 'All Statuses', value: 'ALL' },
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
              ],
            },
          ]}
          activeCount={(department !== 'ALL' ? 1 : 0) + (status !== 'ALL' ? 1 : 0)}
          onReset={() => {
            setDepartment('ALL');
            setStatus('ALL');
            setSearch('');
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No team leaders found"
        emptyDescription="Create a team leader to delegate team management and reviews."
        emptyActionLabel="Add Team Leader"
        onEmptyAction={() => setCreateModalOpen(true)}
        onRowClick={(tl) => {
          setSelectedLeader(tl);
          setViewModalOpen(true);
        }}
      />

      {/* Pagination */}
      {data && data.meta && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          limit={data.meta.limit}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      )}

      {/* CREATE TEAM LEADER MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Appoint New Team Leader"
        subtitle="Establish leadership credentials and assign supervision department."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate(formData)}
            >
              Appoint Leader
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. David Vance"
          />

          <Input
            label="Employee ID"
            required
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            placeholder="e.g. EMP-TL-015"
          />

          <Input
            label="Corporate Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. david.vance@corporate.com"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 018-4421"
          />

          <Select
            label="Department Assignment"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={[
              { label: 'Engineering', value: 'Engineering' },
              { label: 'Product Design', value: 'Product Design' },
              { label: 'Quality Assurance', value: 'Quality Assurance' },
            ]}
          />

          <Input
            label="Designation / Title"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="e.g. Engineering Lead"
          />

          <Input
            label="Initial Password"
            type="text"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Defaults to Leader@123456"
          />

          <Input
            label="Profile Photo URL (Optional)"
            type="url"
            value={formData.profilePhotoUrl}
            onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </Modal>

      {/* EDIT TEAM LEADER MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Team Leader: ${selectedLeader?.fullName}`}
        subtitle="Modify leadership profile or reassign department supervision."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={updateMutation.isPending}
              onClick={() => {
                if (selectedLeader) {
                  updateMutation.mutate({
                    id: selectedLeader.id,
                    data: formData,
                  });
                }
              }}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />

          <Input
            label="Employee ID"
            required
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          />

          <Input
            label="Corporate Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Select
            label="Department Assignment"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={[
              { label: 'Engineering', value: 'Engineering' },
              { label: 'Product Design', value: 'Product Design' },
              { label: 'Quality Assurance', value: 'Quality Assurance' },
            ]}
          />

          <Input
            label="Designation / Title"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />

          <div className="sm:col-span-2">
            <Input
              label="Profile Photo URL"
              type="url"
              value={formData.profilePhotoUrl}
              onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* VIEW TEAM LEADER MODAL */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Team Leader Profile"
        subtitle="Supervisory duties and assigned team responsibilities."
        size="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedLeader && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-navy-50 border border-navy-200">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-sm">
                {selectedLeader.profilePhotoUrl ? (
                  <img src={selectedLeader.profilePhotoUrl} alt={selectedLeader.fullName} className="w-full h-full object-cover" />
                ) : (
                  selectedLeader.fullName.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-900">{selectedLeader.fullName}</h3>
                <p className="text-xs text-navy-600">{selectedLeader.designation}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={selectedLeader.status} size="sm" />
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    TEAM LEADER
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Employee ID</span>
                <span className="font-mono font-bold text-navy-900">{selectedLeader.employeeId}</span>
              </div>

              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Department</span>
                <span className="font-semibold text-navy-900">{selectedLeader.department}</span>
              </div>

              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Corporate Email</span>
                <span className="font-medium text-navy-900 truncate block">{selectedLeader.email}</span>
              </div>

              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Phone Number</span>
                <span className="font-medium text-navy-900">{selectedLeader.phone || 'Not registered'}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-navy-200 rounded-lg space-y-2">
              <span className="text-xs font-bold text-navy-900 block">Supervised Teams</span>
              {selectedLeader.assignedTeams && selectedLeader.assignedTeams.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedLeader.assignedTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-2 rounded bg-navy-50 border border-navy-200 text-xs"
                    >
                      <span className="font-semibold text-navy-800">{team.name}</span>
                      <span className="text-[11px] text-navy-500">{team.department}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-navy-400 italic">Currently not assigned to head any teams.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
