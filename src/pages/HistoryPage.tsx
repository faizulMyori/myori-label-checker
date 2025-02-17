import React, { useState, useEffect } from 'react'
import { ArrowUpDown } from 'lucide-react'
import TableWithPagination from '@/components/ui/TableWithPagination'
import { Button } from '@/components/ui/button'
import Footer from '@/components/template/Footer'


export default function Index({ histories }: any) {
  const [openNews, setOpenNews] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [formType, setFormType] = useState<'create' | 'update'>('create')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortColumn, setSortColumn] = useState<string>('variant_id')
  const [openAudit, setOpenAudit] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')

  // const { data, setData, post, processing, errors, reset } = useForm({
  //     id: '',
  //     title: '',
  //     desc: '',
  //     type: '',
  //     status: '0'
  // })

  // useEffect(() => {
  //     if (!openNews) {
  //         reset()
  //     }
  // }, [openNews])

  const columns = [
    {
      key: 'title',
      label: <Button
        variant="ghost"
        onClick={() => handleSort('title')}
      >
        Title
        < ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>,
      hidden: false,
      render: (item: any) => (
        item.title
      )
    },
    {
      key: 'updated_at',
      style: 'hidden md:table-cell',
      label: <Button
        variant="ghost"
        onClick={() => handleSort('updated_at')}
      >
        Updated At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>,
      hidden: false,
      render: (item: any) => (
        new Date(item.updated_at).toLocaleDateString("en-GB")
      )
    },
    {
      key: 'notify',
      label: 'Notify',
      hidden: false,
      render: (item: any) => (
        item.status === '0' ? (
          <Button size="sm" onClick={(e) => {
            e.preventDefault()
            // handleNotify(item.id)
          }}>Notify</Button>
        ) : 'Notified'
      )
    },
  ]

  const actions = [
    {
      permission: 'can:view:audit',
      label: 'Audit',
      onClick: (item: any) => {
        setOpenAudit(true);
        setAuditData(item)
      },
    },
    {
      permission: 'can:update:histories',
      label: 'Update',
      onClick: (item: any) => {
        // setData(item)
        setOpenNews(true)
        setFormType('update')
      },
    },
    {
      permission: 'can:delete:histories',
      label: 'Delete',
      onClick: (item: any) => {
        // setData(item)
        setOpenDeleteDialog(true)
      },
    },
  ]

  const handleSearch = (query: string) => {
    // router.get('/histories', { q: query }, { preserveState: true })
  }

  const handlePageChange = (url: string) => {
    // router.get(url, {}, { preserveState: true })
  }

  const handleAdd = (e: React.MouseEvent) => {
    // reset()
    setOpenNews(true)
    setFormType('create')
  }

  const handleConfirmDelete = () => {
    // post(`/histories/destroy`, {
    //     onSuccess: () => {
    //         setOpenDeleteDialog(false)
    //         toast({
    //             title: "News Deleted",
    //             description: new Date().toLocaleDateString("en-GB"),
    //         })
    //     },
    // })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const url = formType === 'create' ? '/histories/create' : '/histories/update'

    // post(url, {
    //     onSuccess: (data: any) => {
    //         setOpenNews(false)
    //         toast({
    //             title: `News ${formType === 'create' ? 'Created' : 'Updated'}`,
    //             description: new Date().toLocaleDateString("en-GB"),
    //         })
    //     },
    //     onError: (err: any) => {
    //         console.log(err)
    //     }
    // })
  }

  const handleSort = (column: string) => {
    const newDirection = column === sortColumn && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortDirection(newDirection)
    setSortColumn(column)
    // router.get(
    //     '/histories',
    //     {
    //         sort: column,
    //         order: newDirection
    //     },
    //     {
    //         replace: true,
    //         preserveState: true,
    //     }
    // )
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex flex-1 flex-col gap-2">
        <span className="text-2xl font-semibold leading-none tracking-tight pt-8">History</span>

        <TableWithPagination
          title="History"
          description="Manage histories and view their data."
          columns={columns}
          data={histories?.data || []}
          pagination={{
            currentPage: histories?.current_page || 1,
            perPage: histories?.per_page || 10,
            total: histories?.total || 0,
            from: histories?.from || 0,
            to: histories?.to || 0,
            nextUrl: histories?.next_page_url || null,
            prevUrl: histories?.prev_page_url || null,
          }}
          actions={actions || []}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          // onAdd={handleAdd}
          addPermission="can:create:histories"
        />
      </div>
      <Footer />
    </div>
  )
}