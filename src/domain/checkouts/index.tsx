import clsx from "clsx"
import { useAdminRegions } from "medusa-react"
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
type AbadonedCart = {
  "cart": "cart_01JD1QT2RNVQ0WWXTGYW8QF3QC",
  "address": {
    "id": "addr_01JD1QT373WXZZYAB5Y56KVBMW",
    "customer_id": null,
    "company": "",
    "first_name": "Roman",
    "last_name": "Seer",
    "address_1": "Freyweg 30",
    "address_2": "",
    "city": "Bergheim",
    "country_code": "at",
    "province": "",
    "postal_code": "5101",
    "phone": "+4366488854313",
    "created_at": "2024-11-19T08:14:49.033Z",
    "updated_at": "2024-11-19T08:27:25.687Z",
    "deleted_at": null,
    "metadata": null
  },
  "lineItems": [
    {
      "id": "item_01JD1REXFW5MTCXVSTYYWG5B2E",
      "cart_id": "cart_01JD1QT2RNVQ0WWXTGYW8QF3QC",
      "order_id": null,
      "swap_id": null,
      "title": "Eames Style Hang It All Coat Rack",
      "description": "Green Multitone",
      "thumbnail": "https://imageproxy.designereditions.com/api/images/dfgbpib38/image/upload/e_trim/media/catalog/product/5/a/5aa00c788a7ae.png",
      "is_giftcard": false,
      "should_merge": true,
      "allow_discounts": true,
      "has_shipping": true,
      "unit_price": 7079,
      "variant_id": "variant_01GPR3XC7A8YSQDQTAKWYA2QFQ",
      "quantity": 1,
      "fulfilled_quantity": null,
      "returned_quantity": null,
      "shipped_quantity": null,
      "created_at": "2024-11-19T08:26:11.300Z",
      "updated_at": "2024-11-19T08:27:26.018Z",
      "metadata": {},
      "claim_order_id": null,
      "is_return": false
    }
  ],
  "email": "roman.seer@gmx.at",
  "billing_address_id": "addr_01JD1RH64XWD0VWERM7SRJFD6W",
  "shipping_address_id": "addr_01JD1QT373WXZZYAB5Y56KVBMW",
  "region_id": "reg_01GRN5YPG0WVZD6TK8CZRGQ60J",
  "customer_id": "cus_01JD1RH64GQ6QRFM1SN5GZF6ET",
  "payment_id": null,
  "type": "default",
  "completed_at": null,
  "created_at": "2024-11-19T08:14:48.592Z",
  "updated_at": "2024-11-19T08:27:25.687Z",
  "deleted_at": null,
  "metadata": null,
  "idempotency_key": null,
  "context": {
    "ip": "80.120.140.228",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  },
  "payment_authorized_at": null
}
let cachedata: AbadonedCart[] = []
const AbadonedCartsTable = ({ data }: {
  data: AbadonedCart[]
}) => {
  const columns = useMemo(
    () => [
      {
        Header: "Index",
        accessor: "index",
        Cell: ({ cell: { value } }) => <div>{value}</div>,
      },
      {
        Header: "Last updated",
        accessor: "updated_at",
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
                  linkTo={row.original.cart || row.original.id}
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
const filter = (item: AbadonedCart) => Boolean(item.email)
const OrderIndex = () => {
  const view = "Abandoned Checkouts"
  const [data = [], setData] = useState<AbadonedCart[] | null>(cachedata)
  useLayoutEffect(() => {
    Medusa.abadonedCarts.list().then((res) => {
      cachedata = res.filter(filter)
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
                icon: data?.length ? <RefreshIcon /> : <RefreshIcon className="animate-spin" />,
                disabled: !data?.length,
                onClick() {
                  setData(null)
                  Medusa.abadonedCarts.list().then((res) => {
                    cachedata = res.filter(filter)
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
                data: (data)
                  ?.sort((a, b) => {
                    return state
                      ? new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
                      : -(new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
                  })
                  .filter((item) => {
                    if (!startDate || !endDate) return true
                    return (
                      new Date(item.updated_at) > new Date(startDate) &&
                      new Date(item.updated_at) < new Date(compareEndDate)
                    )
                  }) || [],
              }}
            />
          </BodyCard>
        </div>
      </div>
    </>
  )
}
const DetailsModal = ({ handleCancel, regions }) => {
  const { id } = useParams()
  const [data, setData] = useState<AbadonedCart | undefined>()
  const [customer, setCustomer] = useState<{
    "id": "cus_01J27FX1VJPGPT8DYH94KB0PKS",
    "created_at": "2024-07-07T20:59:23.886Z",
    "updated_at": "2024-07-07T21:02:16.367Z",
    "deleted_at": null,
    "email": "bjerrehoej@hotmail.com",
    "first_name": "Bjørn",
    "last_name": "Bjerrehøj",
    "billing_address_id": null,
    "phone": "+4530951983",
    "has_account": true,
    "metadata": {
      "stripe_id": "cus_QQu1giyj5A9PUu"
    },
    "orders": [
      {
        "object": "order",
        "id": "order_01J2B33QDDCTBJD6EA51BWVTJB",
        "created_at": "2024-07-09T06:32:48.510Z",
        "updated_at": "2024-07-09T06:32:49.256Z",
        "status": "pending",
        "fulfillment_status": "not_fulfilled",
        "payment_status": "captured",
        "display_id": 3522,
        "cart_id": "cart_01J28GQXVPVD6CNF0BPMSVJZ1Y",
        "customer_id": "cus_01J27FX1VJPGPT8DYH94KB0PKS",
        "email": "bjerrehoej@hotmail.com",
        "billing_address_id": "addr_01J2B2YPNMZKK4CFXKQ47W2PWP",
        "shipping_address_id": "addr_01J28GQY2PVZC2JWX0XZHH2X9B",
        "region_id": "reg_01H18MYMM1RGYHX9KVZ6REB8KG",
        "currency_code": "gbp",
        "tax_rate": null,
        "draft_order_id": null,
        "canceled_at": null,
        "metadata": {},
        "no_notification": null,
        "idempotency_key": null,
        "external_id": null,
        "sales_channel_id": "sc_01GPN8RM7FB1G8KWMW1AG6W410"
      }
    ],
    "shipping_addresses": []
  } | undefined>()
  const navigate = useNavigate()
  useLayoutEffect(() => {
    Medusa.abadonedCarts.retrieve(id).then((res) => {
      setData(res)
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
  console.log({ regions, data })
  let currencyCode = regions.find(reg => reg.id === data?.cart.region_id)?.currency_code || "GBP"
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
              {data?.reason && <div className="">
                <div className="font-bold">
                  Reason:
                </div>
                {
                  data?.reason
                }
              </div>}
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

              {
                data?.address && <div className="p-6 mt-6 space-y-3 border">
                  <div className="mb-6 font-bold">Address</div>
                  {
                    Object.entries(data?.address).map(([key, value], i) => {
                      let igonreList = ['id', 'customer_id', 'created_at', 'updated_at', 'deleted_at', 'metadata']
                      if (igonreList.includes(key))
                        return null
                      return <div key={i} className="flex gap-3">
                        <div className="font-bold text-xs flex-shrink-0 w-1/4 min-w-[120px] capitalize">{key.replaceAll("_", " ")}</div>
                        <div>: {String(value) || "-----"}</div>
                      </div>
                    })
                  }
                </div>
              }
            </BodyCard>
          </div>
        </Modal.Content>
      </Modal.Body>
    </Modal>
  )
}
const Checkouts = () => {
  const navigate = useNavigate()
  const [regionsPagination, setRegionsPagination] = useState({
    offset: 0,
    limit: 99,
  })
  const {
    regions,
    count,
    isLoading: isLoadingRegions,
  } = useAdminRegions(regionsPagination)

  return (
    <div>
      <OrderIndex />
      <Routes>
        <Route
          path="/:id"
          element={<DetailsModal regions={regions} handleCancel={() => navigate(-1)} />}
        />
      </Routes>
    </div>
  )
}

export default Checkouts
