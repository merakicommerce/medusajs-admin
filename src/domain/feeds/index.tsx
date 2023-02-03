import { useAdminRegions } from "medusa-react"
import React from "react"
import { Route, Routes } from "react-router-dom"
import PageDescription from "../../components/atoms/page-description"
import ChevronRightIcon from "../../components/fundamentals/icons/chevron-right-icon"
import MapPinIcon from "../../components/fundamentals/icons/map-pin-icon"
const SettingsOverview: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div>
      <PageDescription
        title={"Feeds"}
        subtitle={"Manage feeds for your Medusa store"}
      />
      <div className="grid grid-cols-1 medium:grid-cols-2 auto-cols-fr gap-x-base gap-y-xsmall">
        {children}
      </div>
    </div>
  )
}

type SettingsCardProps = {
  icon: React.ReactNode
  heading: string
  description: string
  to: string
  externalLink?: string
  disabled: boolean
}
const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  heading,
  description,
  to = null,
  externalLink = null,
  disabled = false,
}) => {
  if (disabled) {
    to = null
  }

  return (
    <a href={to} target={"_blank"} className="flex items-center flex-1">
      <button
        className="flex items-center flex-1 h-full border group bg-grey-0 rounded-rounded p-large border-grey-20"
        disabled={disabled}
      >
        <div className="flex items-center justify-center h-2xlarge w-2xlarge bg-violet-20 rounded-circle text-violet-60 group-disabled:bg-grey-10 group-disabled:text-grey-40">
          {icon}
        </div>
        <div className="flex-1 text-left mx-large">
          <h3 className="m-0 inter-large-semibold text-grey-90 group-disabled:text-grey-40">
            {heading}
          </h3>
          <p className="m-0 inter-base-regular text-grey-50 group-disabled:text-grey-40">
            {description}
          </p>
        </div>
        <div className="text-grey-40 group-disabled:text-grey-30">
          <ChevronRightIcon />
        </div>
      </button>
    </a>
  )
}
const Index = () => {
  const { regions, isLoading } = useAdminRegions(undefined, {
    onSuccess: ({ regions, count }) => {
      console.log({ regions, count })
    },
  })
  console.log({ regions })
  return (
    <SettingsOverview>
      {regions.map((r) => {
        return (
          <SettingsCard
            key={r.id}
            heading={`${r.name} (${r.currency_code})`}
            description={new Date().toLocaleString()}
            icon={<MapPinIcon />}
            to={`https://medusa.designereditions.com/api/feed?secret=all&reg=${r.id}`}
          />
        )
      })}
    </SettingsOverview>
  )
}

const Feeds = () => (
  <Routes className="h-full">
    <Route index element={<Index />} />
  </Routes>
)

export default Feeds
