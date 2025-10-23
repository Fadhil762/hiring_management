"use client";

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnResizeMode,
  type Header,
} from '@tanstack/react-table';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CandidateAttr } from '@/lib/types';

type Row = { id: string; attributes: CandidateAttr[] };

type TableData = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  gender: string;
  linkedin_link: string;
  domicile: string;
  applied_at: string;
};

const DraggableHeader = ({ header }: { header: Header<TableData, unknown> }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative px-4 py-4 text-left text-sm font-bold text-white border-r border-teal-500 last:border-r-0 uppercase tracking-wide"
    >
      {flexRender(header.column.columnDef.header, header.getContext())}
      <div
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        className={`absolute right-0 top-0 h-full w-1 bg-teal-400 cursor-col-resize hover:bg-yellow-300 ${
          header.column.getIsResizing() ? 'bg-yellow-300' : ''
        }`}
      />
    </th>
  );
};

export default function CandidatesTable({ rows }: { rows: Row[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'name',
    'email',
    'phone_number',
    'gender',
    'linkedin_link',
    'domicile',
    'applied_at',
  ]);
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');

  const lookup = (attrs: CandidateAttr[], key: string) => attrs.find(a => a.key === key)?.value ?? '';

  const tableData: TableData[] = useMemo(
    () =>
      rows.map(r => ({
        id: r.id,
        name: lookup(r.attributes, 'full_name') || `Candidate ${r.id.slice(0, 6)}`,
        email: lookup(r.attributes, 'email'),
        phone_number: lookup(r.attributes, 'phone_number'),
        gender: lookup(r.attributes, 'gender'),
        linkedin_link: lookup(r.attributes, 'linkedin_link'),
        domicile: lookup(r.attributes, 'domicile'),
        applied_at: lookup(r.attributes, 'applied_at'),
      })),
    [rows]
  );

  const columns = useMemo<ColumnDef<TableData>[]>(
    () => [
      { accessorKey: 'name', header: 'Name', size: 180 },
      { accessorKey: 'email', header: 'Email', size: 200 },
      { accessorKey: 'phone_number', header: 'Phone', size: 140 },
      { accessorKey: 'gender', header: 'Gender', size: 100 },
      { 
        accessorKey: 'linkedin_link', 
        header: 'LinkedIn', 
        size: 180, 
        cell: (info) => {
          const val = info.getValue() as string;
          return val ? <a href={val} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Profile</a> : '—';
        }
      },
      { accessorKey: 'domicile', header: 'Domicile', size: 150 },
      { 
        accessorKey: 'applied_at', 
        header: 'Applied', 
        size: 120, 
        cell: (info) => {
          const val = info.getValue() as string;
          if (!val) return '—';
          try {
            return new Date(val).toLocaleDateString();
          } catch {
            return val;
          }
        }
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnOrder,
    },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setColumnOrder(columns => {
        const oldIndex = columns.indexOf(active.id as string);
        const newIndex = columns.indexOf(over.id as string);
        return arrayMove(columns, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="font-semibold text-blue-900 mb-1">Pro Tips:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Drag column headers</strong> to reorder them</li>
              <li>• <strong>Drag column borders</strong> to resize width</li>
              <li>• <strong>Click column headers</strong> to sort data</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto border-2 border-gray-200 rounded-xl shadow-lg bg-white">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="min-w-full" style={{ width: table.getCenterTotalSize() }}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <SortableContext
                  key={headerGroup.id}
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  <tr className="bg-gradient-to-r from-teal-600 to-teal-700">
                    {headerGroup.headers.map(header => (
                      <DraggableHeader key={header.id} header={header} />
                    ))}
                  </tr>
                </SortableContext>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td className="p-12 text-center" colSpan={columns.length}>
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates yet</h3>
                    <p className="text-gray-600">Applications will appear here once submitted</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-teal-50/50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="px-4 py-4 text-sm text-gray-900"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DndContext>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{tableData.length}</span> candidate{tableData.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            ← Previous
          </button>
          <div className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-sm font-semibold border-2 border-teal-200">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
