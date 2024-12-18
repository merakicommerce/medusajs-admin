import { LineItem } from "@medusajs/medusa"
import ImagePlaceholder from "../../../../components/fundamentals/image-placeholder"
import { formatAmountWithSymbol } from "../../../../utils/prices"

type OrderLineProps = {
  item: LineItem
  currencyCode: string
}

const OrderLine = ({ item, currencyCode }: OrderLineProps) => {
  const total = item.quantity * item.unit_price
  return (
    <div className="flex justify-between mb-1 h-[64px] py-2 mx-[-5px] px-[5px] hover:bg-grey-5 rounded-rounded">
      <div className="flex justify-center space-x-4">
        <div className="flex h-[48px] w-[36px] rounded-rounded overflow-hidden">
          {item.thumbnail ? (
            <img src={item.thumbnail} className="object-cover" />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
        <div className="flex flex-col justify-center max-w-[185px]">
          <span className="truncate inter-small-regular text-grey-90">
            {item.title}
          </span>
          {item?.variant && (
            <span className="truncate inter-small-regular text-grey-50">
              {`${item.variant.title}${
                item.variant.sku ? ` (${item.variant.sku})` : ""
              }`}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex mr-3 small:space-x-2 medium:space-x-4 large:space-x-6">
          <div className="inter-small-regular text-grey-50">
            {formatAmountWithSymbol({
              amount: item.unit_price,
              currency: currencyCode,
              digits: 2,
              tax: [],
            })}
          </div>
          <div className="inter-small-regular text-grey-50">
            x {item.quantity}
          </div>
          <div className="inter-small-regular text-grey-90">
            {formatAmountWithSymbol({
              amount: total ?? 0,
              currency: currencyCode,
              digits: 2,
              tax: [],
            })}
          </div>
        </div>
        <div className="inter-small-regular text-grey-50">
          {currencyCode.toUpperCase()}
        </div>
      </div>
    </div>
  )
}

export default OrderLine
