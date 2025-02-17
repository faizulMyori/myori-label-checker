import React, { useState, useEffect } from 'react'
import { Archive, ArrowUpDown, Filter, Package, Tags } from 'lucide-react'
import TableWithPagination from '@/components/ui/TableWithPagination'
import { Button } from '@/components/ui/button'
import Footer from '@/components/template/Footer'


export default function Index({ products }: any) {
  const [openNews, setOpenNews] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [formType, setFormType] = useState<'create' | 'update'>('create')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [sortColumn, setSortColumn] = useState<string>('variant_id')
  const [openAudit, setOpenAudit] = useState(false);
  const [auditData, setAuditData] = useState(null);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')

  const [tab, setTab] = useState('active')
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
      permission: 'can:update:products',
      label: 'Update',
      onClick: (item: any) => {
        // setData(item)
        setOpenNews(true)
        setFormType('update')
      },
    },
    {
      permission: 'can:delete:products',
      label: 'Delete',
      onClick: (item: any) => {
        // setData(item)
        setOpenDeleteDialog(true)
      },
    },
  ]

  const handleSearch = (query: string) => {
    // router.get('/products', { q: query }, { preserveState: true })
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
    // post(`/products/destroy`, {
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
    const url = formType === 'create' ? '/products/create' : '/products/update'

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
    //     '/products',
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{tab === 'active' ? 'Products' : 'Label Rolls'}</h2>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setTab('active')}
              className={tab === 'active' ? 'bg-muted' : ''}
            >
              <Package className="h-4 w-4" />
              <span className="sr-only">Products</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setTab('inactive')}
              className={tab === 'inactive' ? 'bg-muted' : ''}
            >
              <Tags className="h-4 w-4" />
              <span className="sr-only">Label Rolls</span>
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {tab === 'active' && (
            <TableWithPagination
              title="Products"
              description="Manage products and view their data."
              columns={columns}
              data={products?.data || []}
              pagination={{
                currentPage: products?.current_page || 1,
                perPage: products?.per_page || 10,
                total: products?.total || 0,
                from: products?.from || 0,
                to: products?.to || 0,
                nextUrl: products?.next_page_url || null,
                prevUrl: products?.prev_page_url || null,
              }}
              actions={actions || []}
              onSearch={handleSearch}
              onPageChange={handlePageChange}
              onAdd={handleAdd}
            />
          )}
          {tab === 'inactive' && (
            <TableWithPagination
              title="Label Rolls"
              description="Manage label rolls and view their data."
              columns={columns}
              data={products?.data || []}
              pagination={{
                currentPage: products?.current_page || 1,
                perPage: products?.per_page || 10,
                total: products?.total || 0,
                from: products?.from || 0,
                to: products?.to || 0,
                nextUrl: products?.next_page_url || null,
                prevUrl: products?.prev_page_url || null,
              }}
              actions={actions || []}
              onSearch={handleSearch}
              onPageChange={handlePageChange}
              onAdd={handleAdd}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}