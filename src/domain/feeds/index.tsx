import { Region } from "@medusajs/medusa"
import getUnicodeFlagIcon from "country-flag-icons/unicode"
import { useAdminRegions } from "medusa-react"
import React from "react"
import { Route, Routes } from "react-router-dom"
import PageDescription from "../../components/atoms/page-description"
import Button from "../../components/fundamentals/button"
import MapPinIcon from "../../components/fundamentals/icons/map-pin-icon"
import { feedUrl } from "../../services/config"
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
  countryCode: string
  icon: React.ReactNode
  buttons: React.ReactNode
  heading: string
  description: string
  externalLink?: string
}
const SettingsCard: React.FC<SettingsCardProps> = ({
  icon,
  countryCode,
  heading,
  description,
  buttons = null,
}) => {
  return (
    <div className="flex items-center flex-1">
      <div className="flex items-start flex-1 h-full border group bg-grey-0 rounded-rounded p-large border-grey-20">
        <div className="flex items-center justify-center text-3xl h-2xlarge w-2xlarge bg-violet-20 rounded-circle text-violet-60 group-disabled:bg-grey-10 group-disabled:text-grey-40">
          {getUnicodeFlagIcon(countryCode) || icon}
        </div>
        <div className="flex-1 text-left mx-large">
          <h3 className="m-0 inter-large-semibold text-grey-90 group-disabled:text-grey-40">
            {heading}
          </h3>
          <p className="m-0 inter-base-regular text-grey-50 group-disabled:text-grey-40">
            {description}
          </p>
          <div className="flex gap-3 mt-3 text-grey-40 group-disabled:text-grey-30">
            {buttons}
          </div>
        </div>
      </div>
    </div>
  )
}

const Index = () => {
  const { regions } = useAdminRegions(undefined, {
    onSuccess: ({ regions, count }) => {
      console.log({ regions, count })
    },
  })
  const renderButtons = (r: Region) => {
    const countryCode = r.countries[0].iso_2
    let result = null
    switch (countryCode) {
      case "ie":
        result = (
          <>
            <Button size="small" variant="secondary">
              <a target={"_blank"} href={`${feedUrl}/${r.id}`}>
                English - {r.name}
              </a>
            </Button>
          </>
        )
        break
      case "gb":
        result = (
          <>
            <Button size="small" variant="secondary">
              <a target={"_blank"} href={`${feedUrl}/${r.id}`}>
                {r.name}
              </a>
            </Button>
          </>
        )
        break
      default:
        result = (
          <>
            <Button size="small" variant="secondary">
              <a target={"_blank"} href={`${feedUrl}/${r.id}`}>
                {r.name}
              </a>
            </Button>
            <Button size="small" variant="secondary">
              <a target={"_blank"} href={`${feedUrl}/${r.id}`}>
                English - {r.countries[0].display_name} - {r.currency_code}
              </a>
            </Button>
          </>
        )
        break
    }
    return result
  }
  return (
    <SettingsOverview>
      {regions?.map((r) => {
        return (
          <SettingsCard
            key={r.id}
            countryCode={r.name === "EU" ? "EU" : r.countries[0].iso_2}
            heading={`${r.name} (${r.currency_code})`}
            description={new Date().toLocaleString()}
            icon={<MapPinIcon />}
            buttons={renderButtons(r)}
          />
        )
      })}
    </SettingsOverview>
  )
}

const Feeds = () => (
  <Routes>
    <Route index element={<Index />} />
  </Routes>
)

export default Feeds
