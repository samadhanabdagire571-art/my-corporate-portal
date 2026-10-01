import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { Employee, PaginatedResponse, EntityStatus, EmployeeType } from '../../types';
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
import { formatDate } from '../../lib/utils';

const getInitialFormData = () => ({
  fullName: '',
  employeeId: '',
  email: '',
  phone: '',
  department: 'Engineering',
  designation: '',
  employeeType: 'EMPLOYEE' as EmployeeType,
  joiningDate: '',
  profilePhotoUrl: '',
  password: '',
  teamId: '',
});

export const EmployeeManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // Query state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form states for Add/Edit
  const [formData, setFormData] = useState(getInitialFormData);

  // Fetch employees list
  const { data, isLoading } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['employees', page, limit, search, department, status, type],
    queryFn: () =>
      api.get<PaginatedResponse<Employee>>('/api/employees', {
        page,
        limit,
        search,
        department: department === 'ALL' ? undefined : department,
        status: status === 'ALL' ? undefined : status,
        type: type === 'ALL' ? undefined : type,
      }),
  });

  // Fetch teams for team assignment dropdown
  const { data: teamsData } = useQuery<any>({
    queryKey: ['teams-list-options'],
    queryFn: () => api.get('/api/teams?limit=100'),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newEmp: typeof formData) => api.post('/api/employees', newEmp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
      success('Employee Registered', 'New personnel has been successfully added.');
      setAddModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toastError('Registration Failed', err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      api.put(`/api/employees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      success('Record Updated', 'Employee details have been saved.');
      setEditModalOpen(false);
    },
    onError: (err: any) => {
      toastError('Update Failed', err.message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: EntityStatus }) =>
      api.patch(`/api/employees/${id}/status`, { status: newStatus }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      success('Status Changed', `Employee status is now ${vars.newStatus}.`);
    },
    onError: (err: any) => {
      toastError('Action Failed', err.message);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => api.post<{ temporaryPassword?: string }>(`/api/employees/${id}/reset-password`),
    onSuccess: (res) => {
      setGeneratedPassword(res.temporaryPassword || 'Corp@' + Math.floor(100000 + Math.random() * 900000));
      success('Password Reset', 'A temporary password has been generated.');
    },
    onError: (err: any) => {
      toastError('Reset Failed', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/employees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
      success('Record Removed', 'Employee was removed from registry.');
      setDeleteModalOpen(false);
      setSelectedEmployee(null);
    },
    onError: (err: any) => {
      toastError('Deletion Failed', err.message);
    },
  });

  const resetForm = () => {
    setFormData(getInitialFormData());
  };

  const handleViewAsEmployee = async (emp: Employee) => {
    try {
      const currentToken = localStorage.getItem('corporate_token');
      const currentUser = localStorage.getItem('corporate_user');

      const res = await api.post<any>('/auth/impersonate', {
        targetEmployeeId: emp.id,
      });

      if (res.accessToken) {
        if (currentToken && currentUser) {
          localStorage.setItem('corporate_admin_backup_token', currentToken);
          localStorage.setItem('corporate_admin_backup_user', currentUser);
        }
        localStorage.setItem('corporate_impersonating', 'true');
        localStorage.setItem('corporate_token', res.accessToken);
        localStorage.setItem('corporate_user', JSON.stringify(res.user));
        success('Admin View Mode Activated', `Viewing the portal as ${emp.fullName}.`);
        window.location.href = res.redirectUrl || '/employee/dashboard';
      }
    } catch (err: any) {
      toastError('Failed to start View Mode', err.message || 'Error initializing view mode');
    }
  };

  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      employeeId: emp.employeeId,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      designation: emp.designation,
      employeeType: emp.employeeType,
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
      profilePhotoUrl: emp.profilePhotoUrl || '',
      password: '',
      teamId: '',
    });
    setEditModalOpen(true);
  };

  const handleCopyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Table Columns
  const columns: Column<Employee>[] = [
    {
      key: 'fullName',
      header: 'Employee / Staff',
      render: (emp) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-corporate-100 text-corporate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-corporate-200">
            {emp.profilePhotoUrl ? (
              <img src={emp.profilePhotoUrl} alt={emp.fullName} className="w-full h-full object-cover" />
            ) : (
              emp.fullName.charAt(0)
            )}
          </div>
          <div className="truncate">
            <span className="font-semibold text-navy-900 block leading-tight">{emp.fullName}</span>
            <span className="text-xs text-navy-500 block truncate">{emp.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (emp) => (
        <span className="font-mono text-xs text-navy-700 bg-navy-50 px-2 py-1 rounded border border-navy-200">
          {emp.employeeId}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department & Role',
      render: (emp) => (
        <div>
          <span className="font-medium text-navy-900 block leading-tight">{emp.department}</span>
          <span className="text-xs text-navy-500 block">{emp.designation}</span>
        </div>
      ),
    },
    {
      key: 'employeeType',
      header: 'Type',
      render: (emp) => <StatusBadge status={emp.employeeType} size="sm" />,
    },
    {
      key: 'teamName',
      header: 'Assigned Team',
      render: (emp) => (
        <span className="text-xs text-navy-700">
          {emp.teamName || <span className="text-navy-400 italic">No team assigned</span>}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (emp) => <StatusBadge status={emp.status} size="sm" />,
    },
    {
      key: 'joiningDate',
      header: 'Joining Date',
      render: (emp) => <span className="text-xs text-navy-600">{formatDate(emp.joiningDate)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (emp) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setSelectedEmployee(emp);
              setViewModalOpen(true);
            }}
            className="p-1.5 text-navy-500 hover:text-corporate-600 hover:bg-navy-100 rounded transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEdit(emp)}
                className="p-1.5 text-navy-500 hover:text-corporate-600 hover:bg-navy-100 rounded transition-colors"
                title="Edit Employee"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setSelectedEmployee(emp);
                  setGeneratedPassword(null);
                  setResetModalOpen(true);
                }}
                className="p-1.5 text-navy-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="Reset Password"
              >
                <KeyRound className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleViewAsEmployee(emp)}
                className="p-1.5 text-navy-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="View Portal as this Employee (Admin View Mode)"
              >
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                onClick={() => {
                  const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                  toggleStatusMutation.mutate({ id: emp.id, newStatus });
                }}
                className={`p-1.5 rounded transition-colors ${
                  emp.status === 'ACTIVE'
                    ? 'text-navy-400 hover:text-rose-600 hover:bg-rose-50'
                    : 'text-navy-400 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                title={emp.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
              >
                {emp.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setSelectedEmployee(emp);
                  setDeleteModalOpen(true);
                }}
                className="p-1.5 text-navy-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                title="Delete Employee"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900 tracking-tight">Employee & Intern Directory</h2>
          <p className="text-xs text-navy-500 mt-0.5">
            Manage organization staff records, role assignments, accounts, and directory search
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setAddModalOpen(true);
            }}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add New Employee
          </Button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-navy-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search staff by name, email, or employee ID..."
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
                { label: 'Executive Leadership', value: 'Executive Leadership' },
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
            {
              id: 'type',
              label: 'Staff Type',
              value: type,
              onChange: (v) => {
                setType(v);
                setPage(1);
              },
              options: [
                { label: 'All Types', value: 'ALL' },
                { label: 'Regular Employees', value: 'EMPLOYEE' },
                { label: 'Interns', value: 'INTERN' },
              ],
            },
          ]}
          activeCount={(department !== 'ALL' ? 1 : 0) + (status !== 'ALL' ? 1 : 0) + (type !== 'ALL' ? 1 : 0)}
          onReset={() => {
            setDepartment('ALL');
            setStatus('ALL');
            setType('ALL');
            setSearch('');
            setPage(1);
          }}
        />
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        emptyTitle="No staff members found"
        emptyDescription="Try adjusting your search criteria or filter selections to view registered employees."
        emptyActionLabel="Add Employee"
        onEmptyAction={() => setAddModalOpen(true)}
        onRowClick={(emp) => {
          setSelectedEmployee(emp);
          setViewModalOpen(true);
        }}
      />

      {/* Pagination Controls */}
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
      {/* 1. ADD EMPLOYEE MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Employee or Intern"
        subtitle="Create an enterprise personnel record and issue system login credentials."
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate(formData)}
            >
              Confirm & Create Account
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
            placeholder="e.g. Eleanor Vance"
          />

          <Input
            label="Employee ID"
            required
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            placeholder="e.g. EMP-ENG-042"
          />

          <Input
            label="Corporate Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. eleanor.vance@corporate.com"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 019-4821"
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

          <Input
            label="Designation / Job Title"
            required
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="e.g. Frontend Engineer"
          />

          <Select
            label="Staff Type"
            required
            value={formData.employeeType}
            onChange={(e) => setFormData({ ...formData, employeeType: e.target.value as EmployeeType })}
            options={[
              { label: 'Regular Employee', value: 'EMPLOYEE' },
              { label: 'Intern', value: 'INTERN' },
            ]}
          />

          <Input
            label="Joining Date"
            type="date"
            required
            value={formData.joiningDate}
            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
          />

          <Select
            label="Assign to Team (Optional)"
            value={formData.teamId}
            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
          >
            <option value="">No initial team assignment</option>
            {teamsData?.data?.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.department})
              </option>
            ))}
          </Select>

          <Input
            label="Initial Password (Optional)"
            type="text"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Defaults to Corporate@123"
          />

          <div className="sm:col-span-2">
            <Input
              label="Profile Photo URL (Optional)"
              type="url"
              value={formData.profilePhotoUrl}
              onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. EDIT EMPLOYEE MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Personnel: ${selectedEmployee?.fullName}`}
        subtitle="Update employee contact info, department, designation, or status."
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
                if (selectedEmployee) {
                  updateMutation.mutate({
                    id: selectedEmployee.id,
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

          <Input
            label="Designation / Title"
            required
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
          />

          <Select
            label="Staff Type"
            required
            value={formData.employeeType}
            onChange={(e) => setFormData({ ...formData, employeeType: e.target.value as EmployeeType })}
            options={[
              { label: 'Regular Employee', value: 'EMPLOYEE' },
              { label: 'Intern', value: 'INTERN' },
            ]}
          />

          <Input
            label="Joining Date"
            type="date"
            value={formData.joiningDate}
            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
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

      {/* ========================================================================= */}
      {/* 3. VIEW EMPLOYEE MODAL / DETAILS DRAWER */}
      {/* ========================================================================= */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Personnel Record Details"
        subtitle="Complete employee profile and system assignment overview."
        size="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-navy-50 border border-navy-200">
              <div className="w-14 h-14 rounded-full bg-corporate-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-sm">
                {selectedEmployee.profilePhotoUrl ? (
                  <img src={selectedEmployee.profilePhotoUrl} alt={selectedEmployee.fullName} className="w-full h-full object-cover" />
                ) : (
                  selectedEmployee.fullName.charAt(0)
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-900">{selectedEmployee.fullName}</h3>
                <p className="text-xs text-navy-600">{selectedEmployee.designation}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={selectedEmployee.status} size="sm" />
                  <StatusBadge status={selectedEmployee.employeeType} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Employee ID</span>
                <span className="font-mono font-bold text-navy-900">{selectedEmployee.employeeId}</span>
              </div>

              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Department</span>
                <span className="font-semibold text-navy-900">{selectedEmployee.department}</span>
              </div>

              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Corporate Email</span>
                <span className="font-medium text-navy-900 truncate block">{selectedEmployee.email}</span>
              </div>

              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Phone Number</span>
                <span className="font-medium text-navy-900">{selectedEmployee.phone || 'Not registered'}</span>
              </div>

              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Joining Date</span>
                <span className="font-medium text-navy-900">{formatDate(selectedEmployee.joiningDate)}</span>
              </div>

              <div className="p-3 bg-white border border-navy-200 rounded-lg">
                <span className="text-navy-400 block mb-1">Assigned Team</span>
                <span className="font-semibold text-corporate-700">
                  {selectedEmployee.teamName || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 4. RESET PASSWORD MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Admin Password Reset"
        subtitle={`Generate a secure temporary password for ${selectedEmployee?.fullName}.`}
        size="sm"
        footer={
          <Button variant="outline" size="sm" onClick={() => setResetModalOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-navy-600">
            Resetting password will invalidate existing sessions and require the user to change password upon next sign in.
          </p>

          {!generatedPassword ? (
            <Button
              variant="primary"
              size="sm"
              isLoading={resetPasswordMutation.isPending}
              onClick={() => selectedEmployee && resetPasswordMutation.mutate(selectedEmployee.id)}
              className="w-full"
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Generate Temporary Password
            </Button>
          ) : (
            <div className="p-3.5 bg-corporate-50 border border-corporate-200 rounded-lg space-y-2">
              <span className="text-[10px] font-bold text-corporate-800 uppercase tracking-wider block">
                Temporary Password Issued:
              </span>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded border border-corporate-300">
                <code className="font-mono text-sm font-bold text-corporate-900 select-all">
                  {generatedPassword}
                </code>
                <button
                  onClick={handleCopyPassword}
                  className="text-corporate-600 hover:text-corporate-800 p-1 rounded"
                  title="Copy password"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-corporate-700">
                Provide this password to the employee. They will be directed to change it on login.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 5. DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Personnel Removal"
        subtitle="This action will delete the employee record and linked authentication user."
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
              onClick={() => selectedEmployee && deleteMutation.mutate(selectedEmployee.id)}
            >
              Confirm Deletion
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-xs text-navy-700">
          <p>
            Are you sure you want to permanently delete{' '}
            <span className="font-bold text-navy-900">{selectedEmployee?.fullName}</span> (
            <span className="font-mono">{selectedEmployee?.employeeId}</span>)?
          </p>
          <p className="text-rose-600 font-medium">
            This will also revoke their access from assigned teams and projects.
          </p>
        </div>
      </Modal>
    </div>
  );
};
