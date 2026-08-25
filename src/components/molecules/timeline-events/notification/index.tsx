import React from "react"
import { NotificationEvent } from "../../../../hooks/use-build-timeline"
import ArrowRightIcon from "../../../fundamentals/icons/arrow-right-icon"
import MailIcon from "../../../fundamentals/icons/mail-icon"
import EventContainer from "../event-container"

type NotificationProps = {
  event: NotificationEvent
}

const notificationTitleMap = {
  "order.items_returned": "Return Received Notice Sent",
  "order.return_requested": "Return Request Confirmation Sent",
  "order.placed": "Order Confirmation Sent",
  "order.shipment_created": "Shipment Confirmation Sent",
}

const Notification: React.FC<NotificationProps> = ({ event }) => {
  // No "Re-Send Mail" action here. It posted to Medusa's own
  // /admin/notifications/:id/resend, which looks up the provider that wrote the
  // row -- sendgrid on anything older than 6 August 2026 -- and that provider no
  // longer exists, so the button could only ever error. Resending goes through
  // the "Send order confirmation" action, which sends via Brevo.
  return (
    <EventContainer
      icon={<MailIcon size={20} />}
      title={notificationTitleMap[event.title] || event.title}
      time={event.time}
      midNode={<ReceiverNode email={event.to} />}
    />
  )
}

const ReceiverNode: React.FC<{ email: string }> = ({ email }) => {
  return (
    <div className="flex items-center">
      <div className="text-grey-40 mr-2xsmall">
        <ArrowRightIcon size={16} />
      </div>
      <span>{email}</span>
    </div>
  )
}

export default Notification
