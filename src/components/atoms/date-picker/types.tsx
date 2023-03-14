import { InputHeaderProps } from "../../fundamentals/input-header"

export type DateTimePickerProps = {
  date: Date | null | undefined
  onSubmitDate: (newDate: Date) => void
} & InputHeaderProps
