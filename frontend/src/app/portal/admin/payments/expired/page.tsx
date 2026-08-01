'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '@/components/DataTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import { useDarkMode } from '@/context/ThemeContext';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useExtendExpiredPaymentMutation, useGetExpiredPaymentsQuery } from '@/lib/api/paymentApi';

const formatDate = (value?: string | null) => value
  ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : 'N/A';

function formatDuration(totalSeconds: number | null) {
  if (totalSeconds == null) return 'No expiry set';
  const expired = totalSeconds < 0;
  let seconds = Math.abs(totalSeconds);
  const months = Math.floor(seconds / 2592000);
  seconds %= 2592000;
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [months && `${months}mo`, days && `${days}d`, hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean);
  const duration = parts.slice(0, 3).join(' ') || 'less than 1m';
  return expired ? `Expired ${duration} ago` : `${duration} remaining`;
}

export default function ExpiredPaymentsPage() {
  const { isDark } = useDarkMode();
  const { canView, canEdit } = usePagePermissions('payments', 'expired_payments');
  const { data: rows = [], isLoading, isError, refetch } = useGetExpiredPaymentsQuery();
  const [extendPayment, { isLoading: isExtending }] = useExtendExpiredPaymentMutation();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('days');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRows = useMemo(
    () => statusFilter === 'all' ? rows : rows.filter((row: any) => row.access_status === statusFilter),
    [rows, statusFilter],
  );
  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((row: any) => row.access_status === 'active').length,
    expired: rows.filter((row: any) => row.access_status === 'expired').length,
    noExpiry: rows.filter((row: any) => row.access_status === 'no_expiry').length,
  }), [rows]);

  const closeExtendModal = () => {
    if (!isExtending) setSelectedStudent(null);
  };

  const handleExtend = async () => {
    if (!selectedStudent || !Number.isInteger(quantity) || quantity < 1) {
      toast.error('Enter a valid whole number.');
      return;
    }
    try {
      const result = await extendPayment({ studentId: selectedStudent.student_id, quantity, unit }).unwrap();
      toast.success(result.message || 'Student access extended.');
      setSelectedStudent(null);
      setQuantity(1);
      setUnit('days');
    } catch (error: any) {
      toast.error(error?.data?.error || 'Unable to extend student access.');
    }
  };

  const columns = [
    {
      key: 'full_name', label: 'Student',
      render: (_: unknown, row: any) => <div><p className='font-semibold'>{row.full_name}</p><p className='text-xs text-gray-500'>{row.student_id}</p></div>,
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: (value: string | null) => value || 'N/A' },
    {
      key: 'chosen_program', label: 'Program / Course',
      render: (_: unknown, row: any) => <div><p>{row.chosen_program || 'N/A'}</p>{row.chosen_subprogram && <p className='text-xs text-gray-500'>{row.chosen_subprogram}</p>}</div>,
    },
    {
      key: 'last_payment_amount', label: 'Last Payment',
      render: (value: number | null, row: any) => <div><p className='font-semibold'>{value == null ? 'N/A' : `$${Number(value).toFixed(2)}`}</p><p className='text-xs text-gray-500'>{row.payment_method?.toUpperCase() || 'No payment record'}</p></div>,
    },
    { key: 'last_payment_date', label: 'Payment Date', render: (value: string | null) => formatDate(value) },
    {
      key: 'access_status', label: 'Access Status',
      render: (value: string) => {
        const styles = value === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : value === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
        const label = value === 'active' ? 'Confirmed / Active' : value === 'expired' ? 'Expired' : 'No Expiry';
        return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>{label}</span>;
      },
    },
    { key: 'expiry_date', label: 'Expiry Date', render: (value: string | null) => <span className='font-semibold'>{formatDate(value)}</span> },
    {
      key: 'remaining_seconds', label: 'Time Remaining / Expired',
      render: (value: number | null, row: any) => <span className={`font-semibold ${row.access_status === 'active' ? 'text-green-600 dark:text-green-400' : row.access_status === 'expired' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>{formatDuration(value)}</span>,
    },
    {
      key: 'actions', label: 'Action',
      render: (_: unknown, row: any) => (
        <div className='flex items-center gap-2'>
          {canEdit && <button type='button' onClick={() => setSelectedStudent(row)} className='rounded-lg p-2 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20' title='Extend access' aria-label={`Extend access for ${row.full_name}`}><svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 5v4m2-2h-4' /></svg></button>}
          {canView && <Link href={`/portal/admin/students/${row.student_id}`} className='rounded-lg p-2 text-[#010080] hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20' title='View student' aria-label={`View ${row.full_name}`}><svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' /><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' /></svg></Link>}
        </div>
      ),
    },
  ];

  if (isLoading) return <main className='flex flex-1 items-center justify-center'><LoadingSpinner /></main>;

  return (
    <>
    <main className={`flex-1 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className='w-full px-6 py-6'>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Payment Access</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>View every student, payment confirmation, expiry status, and remaining access time</p>
          </div>
        </div>

        <div className='mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {[
            { label: 'All Students', value: stats.total, color: 'text-blue-700 dark:text-blue-300' },
            { label: 'Confirmed / Active', value: stats.active, color: 'text-green-700 dark:text-green-300' },
            { label: 'Expired', value: stats.expired, color: 'text-red-700 dark:text-red-300' },
            { label: 'No Expiry', value: stats.noExpiry, color: 'text-gray-700 dark:text-gray-300' },
          ].map((item) => <div key={item.label} className={`rounded-xl border p-4 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}><p className='text-xs font-semibold uppercase text-gray-500'>{item.label}</p><p className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</p></div>)}
        </div>

        {isError ? (
          <div className='rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700'>
            <p>Unable to load student payment access.</p>
            <button type='button' onClick={() => refetch()} className='mt-3 font-semibold underline'>Try again</button>
          </div>
        ) : (
          <DataTable
            title='All Student Access'
            columns={columns}
            data={filteredRows}
            showAddButton={false}
            rowsPerPage={15}
            emptyMessage='No students match this status.'
            customHeaderLeft={<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className='h-8 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-white'><option value='all'>All statuses</option><option value='active'>Confirmed / Active</option><option value='expired'>Expired</option><option value='no_expiry'>No Expiry</option></select>}
          />
        )}
      </div>
    </main>
    <Modal isOpen={!!selectedStudent} onClose={closeExtendModal} title='Extend Student Access' size='sm' closeOnClickOutside={!isExtending}>
      {selectedStudent && (
        <div className='space-y-5'>
          <div className='rounded-lg bg-gray-50 p-4 dark:bg-gray-800'>
            <p className='font-semibold text-gray-900 dark:text-white'>{selectedStudent.full_name}</p>
            <p className='mt-1 text-sm text-gray-500'>Current expiry: {formatDate(selectedStudent.expiry_date)}</p>
            <p className={`text-sm font-semibold ${selectedStudent.access_status === 'active' ? 'text-green-600' : selectedStudent.access_status === 'expired' ? 'text-red-600' : 'text-gray-500'}`}>{formatDuration(selectedStudent.remaining_seconds)}</p>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200'>Duration</label>
              <input type='number' min={1} max={10000} step={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className='w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white' />
            </div>
            <div>
              <label className='mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200'>Unit</label>
              <select value={unit} onChange={(event) => setUnit(event.target.value)} className='w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white'>
                <option value='hours'>Hours</option>
                <option value='days'>Days</option>
                <option value='weeks'>Weeks</option>
                <option value='months'>Months</option>
              </select>
            </div>
          </div>
          <p className='text-xs text-gray-500'>Expired access starts from now. Active access is added after its current expiry time.</p>
          <div className='flex justify-end gap-3'>
            <button type='button' disabled={isExtending} onClick={closeExtendModal} className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200'>Cancel</button>
            <button type='button' disabled={isExtending || quantity < 1} onClick={handleExtend} className='rounded-lg bg-[#010080] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50'>{isExtending ? 'Extending...' : 'Extend access'}</button>
          </div>
        </div>
      )}
    </Modal>
    </>
  );
}
