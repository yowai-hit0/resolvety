'use client';

import { ReactNode } from 'react';
import Icon, { faSpinner, faChevronUp, faChevronDown } from './Icon';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (row: any) => void;
}

export default function DataTable({
  columns,
  data,
  loading = false,
  onSort,
  sortKey,
  sortDirection,
  onRowClick,
}: DataTableProps) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const newDirection = 
      sortKey === key && sortDirection === 'asc' 
        ? 'desc' 
        : 'asc';
    onSort(key, newDirection);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Icon icon={faSpinner} spin className="text-primary" size="2x" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortKey === column.key && (
                      <Icon
                        icon={sortDirection === 'asc' ? faChevronUp : faChevronDown}
                        className="text-primary"
                        size="xs"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr 
                key={index} 
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

