import clsx from "clsx"
import moment from "moment"
import { useLayoutEffect, useMemo, useState } from "react"
import { Route, Routes, useNavigate, useParams } from "react-router-dom"
import { usePagination, useTable } from "react-table"
import Avatar from "../../components/atoms/avatar"
import DatePicker from "../../components/atoms/date-picker/date-picker"
import Spinner from "../../components/atoms/spinner"
import Tooltip from "../../components/atoms/tooltip"
import Button from "../../components/fundamentals/button"
import ArrowDownIcon from "../../components/fundamentals/icons/arrow-down-icon"
import ArrowUpIcon from "../../components/fundamentals/icons/arrow-up-icon"
import ClipboardCopyIcon from "../../components/fundamentals/icons/clipboard-copy-icon"
import DetailsIcon from "../../components/fundamentals/icons/details-icon"
import RefreshIcon from "../../components/fundamentals/icons/refresh-icon"
import { ActionType } from "../../components/molecules/actionables"
import Modal from "../../components/molecules/modal"
import Table from "../../components/molecules/table"
import BodyCard from "../../components/organisms/body-card"
import TableViewHeader from "../../components/organisms/custom-table-header"
import TableContainer from "../../components/organisms/table-container"
import useToggleState from "../../hooks/use-toggle-state"
import Medusa from "../../services/api"
import OrderLine from "./details/order-line"
import { DisplayTotal } from "./details/templates/display-total"
const VIEWS = ["Abandoned Checkouts"]
let cachedata = []
const AbadonedCartsTable = ({ data }) => {
  const columns = useMemo(
    () => [
      {
        Header: "Index",
        accessor: "index",
        Cell: ({ cell: { value } }) => <div>{value}</div>,
      },
      {
        Header: "Date added",
        accessor: "created_at",
        Cell: ({ cell: { value } }) => (
          <div>
            <Tooltip content={moment(value).format("DD MMM YYYY hh:mm a")}>
              {moment(value).format("DD MMM YYYY")}
            </Tooltip>
          </div>
        ),
      },
      {
        Header: "Customer",
        accessor: "customer_id",
        Cell: ({ row, cell: { value } }) => <div>{value}</div>,
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ row, cell: { value } }) => <div>{value}</div>,
      },
    ],
    []
  )
  let count = data?.length || 0
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    // Get the state from the instance
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data: data || [],
      manualPagination: true,
      initialState: {
        pageSize: Math.min(20, count),
        pageIndex: 0,
      },
      pageCount: Math.max(1, Math.floor(count / 20) + 1),
      autoResetPage: false,
    },
    usePagination
  )
  const isLoading = Boolean(!data)
  const queryObject = {
    offset: 0,
  }
  const handleNext = () => {
    if (canNextPage) {
      nextPage()
    }
  }

  const handlePrev = () => {
    if (canPreviousPage) {
      previousPage()
    }
  }
  return (
    <TableContainer
      isLoading={isLoading}
      hasPagination
      numberOfRows={20}
      pagingState={{
        count,
        offset: queryObject.offset,
        pageSize: pageIndex * queryObject.offset + Math.min(20, count),
        title: "Abadoned carts",
        currentPage: pageIndex + 1,
        pageCount: pageCount,
        nextPage: handleNext,
        prevPage: handlePrev,
        hasNext: canNextPage,
        hasPrev: canPreviousPage,
      }}
    >
      <Table {...getTableProps()} className={clsx({ ["relative"]: isLoading })}>
        <Table.Head>
          {headerGroups?.map((headerGroup) => (
            <Table.HeadRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((col) => (
                <Table.HeadCell {...col.getHeaderProps()}>
                  {col.render("Header")}
                </Table.HeadCell>
              ))}
            </Table.HeadRow>
          ))}
        </Table.Head>
        <Table.Body {...getTableBodyProps()}>
          {rows
            .filter((_, index) => {
              if (Math.floor(index / 20) === pageIndex) {
                return true
              }
              return false
            })
            .map((row) => {
              prepareRow(row)
              return (
                <Table.Row
                  color={"inherit"}
                  linkTo={row.original.id}
                  {...row.getRowProps()}
                  className="group"
                >
                  {row.cells.map((cell) => {
                    return (
                      <Table.Cell {...cell.getCellProps()}>
                        {cell.render("Cell")}
                      </Table.Cell>
                    )
                  })}
                </Table.Row>
              )
            })}
        </Table.Body>
      </Table>
    </TableContainer>
  )
}
const filter = (item) => Boolean(item.email)
const OrderIndex = () => {
  const view = "Abandoned Checkouts"
  const [data = [], setData] = useState(cachedata)
  useLayoutEffect(() => {
    Medusa.abadonedCarts.list().then((res) => {
      cachedata = res.data.filter(filter)
      setData(cachedata)
    })
  }, [])
  const navigate = useNavigate()
  const { state, toggle } = useToggleState()
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const compareEndDate = moment(endDate).add("days", 1)
  return (
    <>
      <div className="flex flex-col h-full grow">
        <div className="flex flex-col w-full grow">
          <BodyCard
            customHeader={
              <TableViewHeader
                views={VIEWS}
                setActiveView={(v) => {
                  if (v === "drafts") {
                    navigate(`/a/checkouts`)
                  }
                }}
                activeView={view}
              />
            }
            actionables={[
              {
                label: "Refresh",
                icon: <RefreshIcon />,
                disabled: !data,
                onClick() {
                  setData(null)
                  Medusa.abadonedCarts.list().then((res) => {
                    cachedata = res.data.filter(filter)
                    setData(cachedata)
                  })
                },
              },
            ]}
            className="h-fit"
          >
            <div className="z-10 flex items-end">
              <div className="flex justify-start flex-1 gap-3">
                <div className="max-w-xs">
                  <DatePicker
                    date={startDate}
                    label="Start date"
                    onSubmitDate={setStartDate}
                  />
                </div>
                <div className="max-w-xs">
                  <DatePicker
                    date={endDate}
                    label="End date"
                    onSubmitDate={setEndDate}
                  />
                </div>
                <div className="flex-1" />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setStartDate(null)
                    setEndDate(null)
                  }}
                  size="small"
                  variant="secondary"
                >
                  Clear filters
                </Button>
                <Button onClick={toggle} size="small" variant="secondary">
                  {state ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  Sort by Date
                </Button>
              </div>
            </div>
            <AbadonedCartsTable
              key={String(state)}
              {...{
                data: (data || [])
                  .sort((a, b) => {
                    return state
                      ? new Date(a.created_at) - new Date(b.created_at)
                      : -(new Date(a.created_at) - new Date(b.created_at))
                  })
                  .filter((item) => {
                    if (!startDate || !endDate) return true
                    return (
                      new Date(item.created_at) > new Date(startDate) &&
                      new Date(item.created_at) < new Date(compareEndDate)
                    )
                  }),
              }}
            />
          </BodyCard>
        </div>
      </div>
    </>
  )
}
const DetailsModal = ({ handleCancel }) => {
  const { id } = useParams()
  const [data, setData] = useState()
  const [customer, setCustomer] = useState()
  const navigate = useNavigate()
  useLayoutEffect(() => {
    Medusa.abadonedCarts.retrieve(id).then((res) => {
      setData(res.data)
    })
  }, [id])
  useLayoutEffect(() => {
    if (data?.cart?.customer_id) {
      Medusa.customers.retrieve(data?.cart?.customer_id).then((res) => {
        setCustomer(res.data.customer)
      })
    }
  }, [data?.cart?.customer_id])
  let items = data?.lineItems || []
  let total = items.reduce((result, item) => {
    result = result + item.quantity * item.unit_price
    return result
  }, 0)
  let currencyCode =data?.cart?.currency_code "GBP"
  const customerActionables: ActionType[] = [
    {
      label: "Go to Customer",
      icon: <DetailsIcon size={"20"} />,
      onClick: () => navigate(`/a/customers/${data?.cart?.customer_id}`),
    },
  ]
  return (
    <Modal handleClose={handleCancel} isLargeModal>
      <Modal.Body>
        <Modal.Header handleClose={handleCancel}>
          <Tooltip side="top" content={"Copy ID"}>
            <button className="flex items-center cursor-pointer inter-xlarge-semibold text-grey-90 active:text-violet-90 gap-x-2">
              #{id} <ClipboardCopyIcon size={16} />
            </button>
          </Tooltip>
        </Modal.Header>
        <Modal.Content>
          <div className="flex flex-col">
            <BodyCard className={"w-full mb-4 min-h-0 h-auto"} title="Summary">
              <div className="mt-6">
                {data?.lineItems?.map((item, i) => (
                  <OrderLine key={i} item={item} currencyCode={currencyCode} />
                ))}
                {!data && (
                  <div className="flex justify-center w-full p-6">
                    <Spinner size={"large"} variant={"secondary"} />
                  </div>
                )}
                <DisplayTotal
                  variant="label"
                  currency={currencyCode}
                  totalAmount={total}
                  totalTitle={"Total"}
                />
              </div>
            </BodyCard>
            <BodyCard
              className={"w-full mb-4 min-h-0 h-auto"}
              title="Customer"
              actionables={customerActionables}
            >
              <div className="mt-6">
                <div className="flex items-center w-full space-x-4">
                  <div className="flex w-[40px] h-[40px] ">
                    <Avatar
                      user={customer}
                      font="inter-large-semibold"
                      color="bg-fuschia-40"
                    />
                  </div>
                  {customer ? (
                    <div>
                      <div>{customer.first_name}</div>
                      <div>{data?.cart.email}</div>
                    </div>
                  ) : (
                    <Spinner size={"large"} variant={"secondary"} />
                  )}
                </div>
              </div>
            </BodyCard>
          </div>
        </Modal.Content>
      </Modal.Body>
    </Modal>
  )
}
const Checkouts = () => {
  const navigate = useNavigate()
  return (
    <div>
      <OrderIndex />
      <Routes>
        <Route
          path="/:id"
          element={<DetailsModal handleCancel={() => navigate(-1)} />}
        />
      </Routes>
    </div>
  )
}

export default Checkouts
