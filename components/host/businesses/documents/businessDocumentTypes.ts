export const businessDocumentTypeOptions = [
  { value: "trade_license", label: "Trade license" },
  { value: "company_certificate", label: "Company certificate" },
  { value: "tax_document", label: "Tax document" },
  { value: "vat_document", label: "VAT document" },
  { value: "other", label: "Other" },
] as const;

export type BusinessDocumentType = (typeof businessDocumentTypeOptions)[number]["value"];

export const getBusinessDocumentTypeLabel = (value: string) =>
  businessDocumentTypeOptions.find((option) => option.value === value)?.label ||
  value ||
  "Other";
