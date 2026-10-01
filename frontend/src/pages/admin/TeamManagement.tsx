import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  UserMinus,
  UserPlus,
  Crown,
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { Team, PaginatedResponse } from '../../types';
import { useAuth } from '../../hooks/useAuth';
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

export const TeamManagement: React.FC = () => {
  const { isAdmin } = useAuth();
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
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [leaderModalOpen, setLeaderModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('');
  const [addMemberEmployeeId, setAddMemberEmployeeId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    department: 'Engineering',
    leaderId: '',
    description: '',
  });

  // Fetch teams
  const { data, isLoading } = useQuery<PaginatedResponse<Team>>({
    queryKey: ['teams', page, limit, search, department, status],
    queryFn: () =>
      api.get<PaginatedResponse<Team>>('/api/teams', {
        page,
        limit,
        search,
        department: department === 'ALL' ? undefined : department,
        status: status === 'ALL' ? undefined : status,
      }),
  });

  // Fetch candidate team leaders for leader selection
  const { data: teamLeadersData } = useQuery<any>({
    queryKey: ['team-leaders-options'],
    queryFn: () => api.get('/api/team-leaders?limit=100'),
  });

  // Fetch all staff for member assignment
  const { data: allStaffData } = useQuery<any>({
    queryKey: ['all-staff-options'],
    queryFn: () => api.get('/api/employees?limit=200&status=ACTIVE'),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newTeam: typeof formData) => api.post('/api/teams', newTeam),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
      success('Team Created', 'New corporate team initialized.');
      setCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toastError('Failed to Create Team', err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Team> }) =>
      api.put(`/api/teams/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      success('Team Updated', 'Changes saved successfully.');
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toastError('Update Failed', err.message);
    },
  });

  const assignLeaderMutation = useMutation({
    mutationFn: ({ teamId, leaderId }: { teamId: string; leaderId: string | null }) =>
      api.put(`/api/teams/${teamId}/leader`, { leaderId: leaderId || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team-leaders'] });
      success('Leader Assigned', 'Team leadership has been updated.');
      setLeaderModalOpen(false);
    },
    onError: (err: any) => {
      toastError('Assignment Failed', err.message);
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: string; employeeId: string }) =>
      api.post(`/api/teams/${teamId}/members`, { employeeId }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      // Refresh current selected team details
      if (selectedTeam) {
        const refreshed = await api.get<Team>(`/api/teams/${selectedTeam.id}`);
        setSelectedTeam(refreshed);
      }
      setAddMemberEmployeeId('');
      success('Member Added', 'Employee successfully attached to team.');
    },
    onError: (err: any) => {
      toastError('Failed to Add Member', err.message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: string; employeeId: string }) =>
      api.delete(`/api/teams/${teamId}/members/${employeeId}`),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (selectedTeam) {
        const refreshed = await api.get<Team>(`/api/teams/${selectedTeam.id}`);
        setSelectedTeam(refreshed);
      }
      success('Member Removed', 'Employee removed from team roster.');
    },
    onError: (err: any) => {
      toastError('Removal Failed', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/teams/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
      success('Team Deleted', 'Team has been removed from organization.');
      setDeleteModalOpen(false);
      setSelectedTeam(null);
    },
    onError: (err: any) => {
      toastError('Failed to Delete', err.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      department: 'Engineering',
      leaderId: '',
      description: '',
    });
  };

  const handleOpenEdit = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      department: team.department,
      leaderId: team.leaderId || '',
      description: team.description || '',
    });
    setEditModalOpen(true);
  };

  const handleOpenLeaderModal = (team: Team) => {
    setSelectedTeam(team);
    setSelectedLeaderId(team.leaderId || '');
    setLeaderModalOpen(true);
  };

  const handleOpenMembersModal = async (team: Team) => {
    try {
      const detailed = await api.get<Team>(`/api/teams/${team.id}`);
      setSelectedTeam(detailed);
      setMembersModalOpen(true);
    } catch {
      setSelectedTeam(team);
      setMembersModalOpen(true);
    }
  };

  const columns: Column<Team>[] = [
    {
      key: 'name',
      header: 'Team Name & Scope',
      render: (t) => (
        <div>
          <span className="font-semibold text-navy-900 block leading-tight">{t.name}</span>
          <span className="text-xs text-navy-500 block truncate max-w-xs">{t.description || 'No description'}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (t) => <span className="text-xs font-semibold text-navy-800">{t.department}</span>,
    },
    {
      key: 'leader',
      header: 'Assigned Team Leader',
      render: (t) => (
        <div className="flex items-center gap-2">
          {t.leader ? (
            <>
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden border border-blue-200">
                {t.leader.profilePhotoUrl ? (
                  <img src={t.leader.profilePhotoUrl} alt={t.leader.fullName} className="w-full h-full object-cover" />
                ) : (
                  t.leader.fullName.charAt(0)
                )}
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-navy-900 block leading-tight">{t.leader.fullName}</span>
                <span className="text-[10px] text-navy-500 font-mono block">{t.leader.employeeId}</span>
              </div>
            </>
          ) : (
            <span className="text-xs text-navy-400 italic">No leader assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'membersCount',
      header: 'Active Members',
      render: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenMembersModal(t);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-corporate-700 bg-corporate-50 hover:bg-corporate-100 border border-corporate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t.membersCount || 0} members</span>
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenMembersModal(t)}
            className="p-1.5 text-navy-500 hover:text-corporate-600 hover:bg-navy-100 rounded transition-colors"
            title="Manage Members"
          >
            <Users className="w-4 h-4" />
          </button>

          {isAdmin && (
            <button
              onClick={() => handleOpenLeaderModal(t)}
              className="p-1.5 text-navy-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
              title="Assign / Change Leader"
            >
              <Crown className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleOpenEdit(t)}
            className="p-1.5 text-navy-500 hover:text-corporate-600 hover:bg-navy-100 rounded transition-colors"
            title="Edit Team"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setSelectedTeam(t);
                setDeleteModalOpen(true);
              }}
              className="p-1.5 text-navy-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Delete Team"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Candidates for adding to team (exclude staff already in team)
  const availableStaff = allStaffData?.data?.filter((emp: any) => {
    return !selectedTeam?.members?.some((m) => m.id === emp.id);
  }) || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Corporate Team Management</h2>
          <p className="text-xs text-navy-500 mt-0.5">
            Organize business units, delegate leadership, and configure employee team allocations
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setCreateModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Team
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-navy-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search teams by name, description, or department..."
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

      {/* Teams Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No corporate teams found"
        emptyDescription="Create operational teams to group employees, interns, and assign leadership."
        emptyActionLabel="Create Team"
        onEmptyAction={() => setCreateModalOpen(true)}
        onRowClick={(t) => handleOpenMembersModal(t)}
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

      {/* ========================================================================= */}
      {/* 1. CREATE TEAM MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Form New Enterprise Team"
        subtitle="Establish team identity, choose department, and designate a team leader."
        size="md"
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
              Create Team
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Team Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Distributed Systems & Core API"
          />

          <Select
            label="Department"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={[
              { label: 'Engineering', value: 'Engineering' },
              { label: 'Product Design', value: 'Product Design' },
              { label: 'Quality Assurance', value: 'Quality Assurance' },
              { label: 'Executive Leadership', value: 'Executive Leadership' },
            ]}
          />

          <Select
            label="Designate Team Leader (Optional)"
            value={formData.leaderId}
            onChange={(e) => setFormData({ ...formData, leaderId: e.target.value })}
          >
            <option value="">No leader assigned (vacant)</option>
            {teamLeadersData?.data?.map((tl: any) => (
              <option key={tl.id} value={tl.id}>
                {tl.fullName} ({tl.department}) - {tl.employeeId}
              </option>
            ))}
          </Select>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-navy-700">Team Mission / Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline the core responsibilities, deliverables, or mandate of this team..."
              className="w-full bg-white text-sm text-navy-900 placeholder:text-navy-400 p-3 rounded-lg border border-navy-300 focus:outline-none focus:ring-2 focus:ring-corporate-500/20 focus:border-corporate-600 transition-all"
            />
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. EDIT TEAM MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Team: ${selectedTeam?.name}`}
        subtitle="Update name, department, or operational description."
        size="md"
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
                if (selectedTeam) {
                  updateMutation.mutate({
                    id: selectedTeam.id,
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
        <div className="space-y-4">
          <Input
            label="Team Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Select
            label="Department"
            required
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={[
              { label: 'Engineering', value: 'Engineering' },
              { label: 'Product Design', value: 'Product Design' },
              { label: 'Quality Assurance', value: 'Quality Assurance' },
              { label: 'Executive Leadership', value: 'Executive Leadership' },
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-navy-700">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white text-sm text-navy-900 p-3 rounded-lg border border-navy-300 focus:outline-none focus:ring-2 focus:ring-corporate-500/20 focus:border-corporate-600 transition-all"
            />
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. ASSIGN / CHANGE TEAM LEADER MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={leaderModalOpen}
        onClose={() => setLeaderModalOpen(false)}
        title={`Assign Leader: ${selectedTeam?.name}`}
        subtitle="Designate supervisory authority over this team's projects and submissions."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setLeaderModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={assignLeaderMutation.isPending}
              onClick={() => {
                if (selectedTeam) {
                  assignLeaderMutation.mutate({
                    teamId: selectedTeam.id,
                    leaderId: selectedLeaderId || null,
                  });
                }
              }}
            >
              Confirm Leader Assignment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Team Leader"
            value={selectedLeaderId}
            onChange={(e) => setSelectedLeaderId(e.target.value)}
          >
            <option value="">Leave Vacant (No Leader)</option>
            {teamLeadersData?.data?.map((tl: any) => (
              <option key={tl.id} value={tl.id}>
                {tl.fullName} ({tl.department}) - {tl.employeeId}
              </option>
            ))}
          </Select>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 4. MANAGE TEAM MEMBERS MODAL (ADD / REMOVE EMPLOYEES & INTERNS) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        title={`Roster Management: ${selectedTeam?.name}`}
        subtitle={`Current roster: ${selectedTeam?.members?.length || 0} active members and interns.`}
        size="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setMembersModalOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-5">
          {/* Add member toolbar */}
          <div className="p-3.5 bg-navy-50 border border-navy-200 rounded-xl flex flex-col sm:flex-row items-center gap-2.5">
            <div className="flex-1 w-full">
              <Select
                value={addMemberEmployeeId}
                onChange={(e) => setAddMemberEmployeeId(e.target.value)}
              >
                <option value="">Select employee or intern to add...</option>
                {availableStaff.map((staff: any) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} ({staff.employeeType}) — {staff.designation} ({staff.employeeId})
                  </option>
                ))}
              </Select>
            </div>

            <Button
              variant="primary"
              size="sm"
              disabled={!addMemberEmployeeId}
              isLoading={addMemberMutation.isPending}
              onClick={() => {
                if (selectedTeam && addMemberEmployeeId) {
                  addMemberMutation.mutate({
                    teamId: selectedTeam.id,
                    employeeId: addMemberEmployeeId,
                  });
                }
              }}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="shrink-0 w-full sm:w-auto"
            >
              Add to Team
            </Button>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-navy-700 uppercase tracking-wider">
              Enrolled Team Members
            </h4>

            {selectedTeam?.members && selectedTeam.members.length > 0 ? (
              <div className="divide-y divide-navy-100 border border-navy-200 rounded-xl overflow-hidden bg-white max-h-72 overflow-y-auto">
                {selectedTeam.members.map((member) => (
                  <div key={member.id} className="p-3 flex items-center justify-between hover:bg-navy-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-corporate-100 text-corporate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-corporate-200">
                        {member.profilePhotoUrl ? (
                          <img src={member.profilePhotoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                        ) : (
                          member.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-navy-900">{member.fullName}</span>
                          <StatusBadge status={member.employeeType} size="sm" />
                          <span className="text-[10px] font-mono text-navy-500">{member.employeeId}</span>
                        </div>
                        <span className="text-[11px] text-navy-500">{member.designation} • {member.department}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (selectedTeam) {
                          removeMemberMutation.mutate({
                            teamId: selectedTeam.id,
                            employeeId: member.id,
                          });
                        }
                      }}
                      className="text-navy-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors"
                      title="Remove Member from Team"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-navy-50 border border-dashed border-navy-200 rounded-xl">
                <p className="text-xs text-navy-500">No members currently assigned to this team.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 5. DELETE TEAM CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Team Decommission"
        subtitle="This action will delete the team entity and unassign all current members."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => selectedTeam && deleteMutation.mutate(selectedTeam.id)}
            >
              Confirm Deletion
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-xs text-navy-700">
          <p>
            Are you sure you want to delete team <span className="font-bold text-navy-900">{selectedTeam?.name}</span>?
          </p>
          <p className="text-rose-600">
            Employees will not be deleted, but they will be unassigned from this team roster.
          </p>
        </div>
      </Modal>
    </div>
  );
};
