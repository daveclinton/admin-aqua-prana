"use client"

import { useId, type ComponentProps } from "react"
import { Input } from "@/components/ui/input"

type SearchableInputOption = {
  value: string
  label?: string
}

type SearchableInputProps = Omit<ComponentProps<typeof Input>, "list"> & {
  options: SearchableInputOption[]
}

export function SearchableInput({
  options,
  ...props
}: SearchableInputProps) {
  const listId = useId()

  return (
    <>
      <Input list={listId} {...props} />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.value} value={option.value} label={option.label} />
        ))}
      </datalist>
    </>
  )
}
