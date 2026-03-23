export const FARMER_REGION_OPTIONS = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Odisha",
  "Tamil Nadu",
  "Telangana",
  "West Bengal",
]

export const PRODUCT_CATEGORY_OPTIONS = [
  "Feed",
  "Seed",
  "Aeration",
  "Water Treatment",
  "Health",
  "Equipment",
  "Chemicals",
  "Testing",
  "Probiotics",
  "Harvest",
]

export const PARTNER_CATEGORY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "feed_supplier", label: "Feed Supplier" },
  { value: "equipment", label: "Equipment" },
  { value: "chemicals", label: "Chemicals" },
  { value: "hatchery", label: "Hatchery" },
  { value: "processor", label: "Processor" },
  { value: "exporter", label: "Exporter" },
  { value: "consultant", label: "Consultant" },
  { value: "financial", label: "Financial Services" },
  { value: "technology", label: "Technology" },
]

export const PARTNER_LOCATION_OPTIONS = {
  India: [
    "Andhra Pradesh",
    "Gujarat",
    "Karnataka",
    "Kerala",
    "Odisha",
    "Tamil Nadu",
    "Telangana",
    "West Bengal",
  ],
  Kenya: [
    "Kilifi",
    "Kwale",
    "Kisumu",
    "Homa Bay",
    "Siaya",
    "Busia",
    "Mombasa",
    "Nairobi",
  ],
  Uganda: [
    "Wakiso",
    "Mukono",
    "Jinja",
    "Masaka",
    "Gulu",
  ],
  Tanzania: [
    "Dar es Salaam",
    "Pwani",
    "Mwanza",
    "Tanga",
    "Morogoro",
  ],
  Nigeria: [
    "Lagos",
    "Ogun",
    "Rivers",
    "Delta",
    "Akwa Ibom",
  ],
  Bangladesh: [
    "Chattogram",
    "Khulna",
    "Barishal",
    "Dhaka",
    "Sylhet",
  ],
} satisfies Record<string, string[]>

export const PARTNER_COUNTRY_OPTIONS = Object.keys(PARTNER_LOCATION_OPTIONS)

export function getPartnerRegions(country: string) {
  if (!country || !(country in PARTNER_LOCATION_OPTIONS)) return []
  return PARTNER_LOCATION_OPTIONS[country as keyof typeof PARTNER_LOCATION_OPTIONS]
}

export function parsePartnerLocation(value: string | null | undefined) {
  const parts = (value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return { country: "", region: "" }
  }

  const maybeCountry = parts[parts.length - 1]
  if (maybeCountry in PARTNER_LOCATION_OPTIONS) {
    return {
      country: maybeCountry,
      region: parts.slice(0, -1).join(", "),
    }
  }

  return {
    country: "",
    region: parts.join(", "),
  }
}

export function formatPartnerLocation(country: string, region: string) {
  if (country && region) return `${region}, ${country}`
  if (region) return region
  return country
}
