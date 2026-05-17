"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import OrderStatusBadge from "./order-badge";
import { useState, useMemo } from "react";
import { OrderRows, OrderRow } from "@/lib/schema/orders";
import AddOrder from "./add-order";

type Props = {
  orders: OrderRows;
};

export default function OrderTable({ orders }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        accessorKey: "ordered_at",
        header: "Ordered at",
        cell: ({ getValue }) =>
          getValue<string>()
            ? new Date(getValue<string>()).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })
            : "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <OrderStatusBadge status={getValue<string>()} />,
      },

      {
        id: "email",
        header: "E-Mail",
        accessorFn: (row) => row.customers?.email ?? "—",
        cell: ({ getValue }) => getValue<string>() ?? "—",
      },
      {
        id: "customer",
        header: "Customer",
        accessorFn: (row) => row.customers?.name ?? "—",
        cell: ({ getValue }) => getValue<string>() ?? "—",
      },
      {
        id: "itemsCount",
        header: "Items",
        accessorFn: (row) => row.order_items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0, // This will show 0 for faulty values
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ getValue }) => (typeof getValue<number>() === "number" ? getValue<number>() : "—"),
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <Button variant='outline' size='sm'>
            View
          </Button>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 25 } },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className='space-y-3'>
      <div className='flex gap-2'>
        <Input
          placeholder='Search orders...'
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className='max-w-xs mr-auto'
        />
        <AddOrder />
        <Button variant={"outline"}>Filter</Button>
      </div>

      <div className='overflow-x-auto rounded border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className='cursor-pointer'
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? " ▲" : header.column.getIsSorted() === "desc" ? " ▼" : ""}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell className='py-6 text-center text-muted-foreground' colSpan={columns.length}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-between text-sm'>
        <div>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} variant={"ghost"}>
            Prev
          </Button>
          <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} variant={"ghost"}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
