import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PropertyBookingCard } from "@/components/property/PropertyBookingCard";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { ListingCard } from "@/components/ui/ListingCard";
import { ApiError } from "@/lib/api";
import {
  getFrontPropertyDetails,
  parseFrontStayFilters,
  type FrontPropertyDetail,
} from "@/lib/front";

type PropertyPageProps = {
  params: Promise<{
    propertyId: string;
  }>;
  searchParams?: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    unitId?: string;
  }>;
};

const SectionTitle = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => (
  <div>
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
      {eyebrow}
    </p>
    <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary md:text-[34px]">
      {title}
    </h2>
    {description ? (
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-text-secondary">{description}</p>
    ) : null}
  </div>
);

const DetailStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="rounded-[22px] border border-border bg-card px-4 py-4 shadow-soft">
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
      {label}
    </p>
    <p className="mt-2 text-[15px] font-semibold text-text-primary">{value}</p>
  </div>
);

const amenityIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes("wifi")) {
    return "Wi";
  }
  if (lowerLabel.includes("air")) {
    return "AC";
  }
  if (lowerLabel.includes("kitchen")) {
    return "KT";
  }
  if (lowerLabel.includes("workspace")) {
    return "WS";
  }
  if (lowerLabel.includes("water")) {
    return "HW";
  }
  if (lowerLabel.includes("tv")) {
    return "TV";
  }
  if (lowerLabel.includes("parking")) {
    return "PK";
  }

  return "OK";
};

const formatReviewDate = (value: string | null) => {
  if (!value) {
    return "Recent stay";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const getHostInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const buildPropertyStats = (detail: FrontPropertyDetail) => {
  const capacities = detail.units.map((unit) => unit.capacity ?? 0);
  const bedrooms = detail.units.map((unit) => unit.bedrooms ?? 0);
  const bathrooms = detail.units.map((unit) => unit.bathrooms ?? 0);
  const maxCapacity = Math.max(...capacities, 0);
  const maxBedrooms = Math.max(...bedrooms, 0);
  const maxBathrooms = Math.max(...bathrooms, 0);

  return [
    { label: "Guests", value: maxCapacity > 0 ? `${maxCapacity}` : "Flexible" },
    { label: "Bedrooms", value: maxBedrooms > 0 ? `${maxBedrooms}` : "Varies" },
    { label: "Bathrooms", value: maxBathrooms > 0 ? `${maxBathrooms}` : "Varies" },
    { label: "Type", value: detail.property.propertyTypeName || "Stay" },
  ];
};

const buildAvailabilityNote = (detail: FrontPropertyDetail, stayError: string) => {
  if (stayError) {
    return stayError;
  }

  if (detail.availability.availableUnitsCount !== null) {
    return `${detail.availability.availableUnitsCount} eligible unit${
      detail.availability.availableUnitsCount === 1 ? "" : "s"
    } for the selected stay.`;
  }

  return "Add stay dates to see the best matching unit price and availability for this stay.";
};

const formatStayRuleLabel = (value: number | null, kind: "min" | "max") => {
  if (!value || value < 1) {
    return "";
  }

  return `${kind === "min" ? "Min" : "Max"} ${value} night${value === 1 ? "" : "s"}`;
};

const parseHouseRules = (value: string) => {
  const normalized = value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const sourceItems =
    normalized.length > 1
      ? normalized
      : value
          .split(/(?:\s*[.;]\s+)|(?:\s*\|\s*)/)
          .map((item) => item.trim())
          .filter(Boolean);

  return sourceItems
    .map((item) => item.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);
};

const buildPropertyStayQuery = ({
  checkIn,
  checkOut,
  guests,
  unitId,
}: {
  checkIn?: string;
  checkOut?: string;
  guests?: number | null;
  unitId?: string;
}) => {
  const params = new URLSearchParams();

  if (checkIn) {
    params.set("checkIn", checkIn);
  }

  if (checkOut) {
    params.set("checkOut", checkOut);
  }

  if (typeof guests === "number" && guests > 0) {
    params.set("guests", String(guests));
  }

  if (unitId) {
    params.set("unitId", unitId);
  }

  return params.toString();
};

const loadProperty = async (
  propertyId: string,
  stayFilters: ReturnType<typeof parseFrontStayFilters>,
) => {
  try {
    return await getFrontPropertyDetails(
      propertyId,
      stayFilters.error
        ? {}
        : {
            checkIn: stayFilters.checkIn || undefined,
            checkOut: stayFilters.checkOut || undefined,
            guests: stayFilters.guests,
          },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
};

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { propertyId } = await params;

  try {
    const detail = await getFrontPropertyDetails(propertyId);

    return {
      title: `${detail.property.title} | XYZ Travellers`,
      description: detail.property.description || detail.location.locationLabel,
    };
  } catch {
    return {
      title: "Property not found | XYZ Travellers",
    };
  }
}

export default async function PropertyPage({
  params,
  searchParams,
}: PropertyPageProps) {
  const { propertyId } = await params;
  const query = searchParams ? await searchParams : undefined;
  const stayFilters = parseFrontStayFilters({
    checkIn: query?.checkIn ?? null,
    checkOut: query?.checkOut ?? null,
    guests: query?.guests ?? null,
  });
  const detail = await loadProperty(propertyId, stayFilters);
  const selectedUnitId =
    query?.unitId && detail.units.some((unit) => unit.id === query.unitId)
      ? query.unitId
      : detail.units.length === 1
        ? detail.units[0]?.id || ""
        : "";
  const selectedUnit = detail.units.find((unit) => unit.id === selectedUnitId) ?? null;
  const galleryImages = detail.gallery.items.length
    ? detail.gallery.items
    : detail.gallery.coverImageUrl
      ? [
          {
            id: "cover",
            src: detail.gallery.coverImageUrl,
            alt: detail.property.title,
            mediaType: "image",
            caption: "",
            sortOrder: 0,
            isCover: true,
          },
        ]
      : [];
  const stats = buildPropertyStats(detail);
  const reviewSummaryLabel = detail.reviews.summary?.displayLabel || "New";
  const reviewCount = detail.reviews.summary?.count ?? 0;
  const stayTotalLabel = detail.pricing.minStayTotalLabel || "";
  const houseRules = parseHouseRules(detail.property.houseRules);
  const unitsWithStayRules = detail.units.filter(
    (unit) => unit.stayRules.minimumStay || unit.stayRules.maximumStay,
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="section-shell overflow-visible bg-background pb-20 pt-8 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto">
            <div className="flex flex-wrap items-center gap-3 text-[13px] font-medium text-text-secondary">
              <Link href="/" className="transition-colors duration-200 hover:text-text-primary">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/search"
                className="transition-colors duration-200 hover:text-text-primary"
              >
                Properties
              </Link>
              <span>/</span>
              <span className="text-text-primary">{detail.property.title}</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {detail.similar.some((item) => item.badge === "New") ? (
                <span className="rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-text-primary shadow-glow">
                  New listing
                </span>
              ) : null}
              <span className="rounded-full border border-border bg-card px-4 py-2 text-[12px] font-semibold text-text-primary shadow-soft">
                {detail.property.propertyTypeName || "Stay"}
              </span>
              {detail.availability.availableUnitsCount !== null ? (
                <span className="rounded-full border border-border bg-white/70 px-4 py-2 text-[12px] font-semibold text-text-secondary">
                  {detail.availability.availableUnitsCount} unit
                  {detail.availability.availableUnitsCount === 1 ? "" : "s"} available
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 max-w-4xl font-sora text-[38px] font-bold leading-tight tracking-[-0.05em] text-text-primary md:text-[54px]">
              {detail.property.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-[14px] text-text-secondary">
              <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                {detail.location.locationLabel || "Location unavailable"}
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                {reviewSummaryLabel === "New" ? "New property" : `${reviewSummaryLabel} rating`}
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                {reviewCount} reviews
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2 font-medium shadow-soft">
                {detail.units.length} unit{detail.units.length === 1 ? "" : "s"}
              </span>
            </div>

            {stayFilters.error ? (
              <p className="mt-4 text-[13px] font-medium text-[var(--color-danger,#b42318)]">
                {stayFilters.error}
              </p>
            ) : null}
          </div>

          <PropertyGallery title={detail.property.title} images={galleryImages} />

          <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_336px] xl:grid-cols-[minmax(0,1.35fr)_348px]">
            <div className="space-y-8">
              <div className="surface-card-strong rounded-[30px] p-6 md:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  About This Stay
                </p>

                <h2 className="mt-3 font-sora text-[28px] font-bold tracking-[-0.04em] text-text-primary md:text-[34px]">
                  {detail.property.propertyTypeName
                    ? `${detail.property.propertyTypeName} in ${detail.location.city || detail.location.country}`
                    : "Curated for smoother guest stays"}
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((item) => (
                    <DetailStat key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>

                <p className="mt-5 max-w-3xl text-[15px] leading-7 text-text-secondary">
                  {detail.property.description ||
                    "Designed for a cleaner booking flow with real-time pricing, availability, and unit details."}
                </p>

              </div>

              {houseRules.length || unitsWithStayRules.length ? (
                <div className="surface-card rounded-[30px] p-6 md:p-8">
                  <SectionTitle
                    eyebrow="Stay Rules"
                    title="Things to know before you book"
                    description="Review the stay rules clearly before sending a booking request."
                  />

                  <div className="mt-7 grid gap-3">
                    {unitsWithStayRules.length ? (
                      <div className="rounded-[24px] border border-border-light bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,247,241,0.92)_100%)] px-5 py-5 shadow-soft">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                              Stay length limits
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3">
                          {unitsWithStayRules.map((unit) => (
                            <div
                              key={unit.id}
                              className="rounded-[22px] border border-border-light bg-white/90 px-4 py-4 shadow-soft"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="text-[15px] font-semibold text-text-primary">
                                    {unit.unitName}
                                    {unit.unitNumber ? ` · ${unit.unitNumber}` : ""}
                                  </p>
                                  <p className="mt-1 text-[13px] text-text-secondary">
                                    {unit.unitType || "Selected stay unit"}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {unit.stayRules.minimumStay ? (
                                    <span className="rounded-full border border-primary/25 bg-primary-light px-3.5 py-2 text-[12px] font-semibold text-text-primary">
                                      {formatStayRuleLabel(unit.stayRules.minimumStay, "min")}
                                    </span>
                                  ) : null}
                                  {unit.stayRules.maximumStay ? (
                                    <span className="rounded-full border border-border bg-surface px-3.5 py-2 text-[12px] font-semibold text-text-primary">
                                      {formatStayRuleLabel(unit.stayRules.maximumStay, "max")}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {houseRules.map((rule, index) => (
                      <div
                        key={`${rule}-${index}`}
                        className="flex items-start gap-3 rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft transition-all duration-200 hover:border-text-primary/12 hover:shadow-medium"
                      >
                        <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-[12px] font-bold text-text-primary shadow-glow">
                          {index + 1}
                        </span>
                        <p className="text-[14px] leading-6 text-text-secondary">{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="surface-card rounded-[30px] p-6 md:p-8">
                <SectionTitle
                  eyebrow="Facilities"
                  title="Thoughtful essentials for a smoother stay"
                  description="Amenities below come directly from the published property and unit configuration."
                />

                <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {detail.amenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="rounded-[22px] border border-border-light bg-card px-4 py-4 shadow-soft"
                    >
                      <div className="icon-chip h-10 w-10 rounded-[14px] text-[11px] font-bold">
                        {amenityIcon(amenity.name)}
                      </div>
                      <p className="mt-4 text-[14px] font-medium text-text-primary">
                        {amenity.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card rounded-[30px] p-6 md:p-8">
                <SectionTitle
                  eyebrow="Units"
                  title="Available units and live pricing"
                  description="Unit pricing below reflects the published rate, and date filters narrow the list to eligible units only."
                />

                <div className="mt-7 grid gap-4">
                  {detail.units.length ? (
                    detail.units.map((unit) => {
                      const isSelected = unit.id === selectedUnitId;
                      const unitQuery = buildPropertyStayQuery({
                        checkIn: stayFilters.checkIn || undefined,
                        checkOut: stayFilters.checkOut || undefined,
                        guests: stayFilters.guests,
                        unitId: unit.id,
                      });

                      return (
                        <div
                          key={unit.id}
                          className={`rounded-[24px] border px-5 py-5 shadow-soft transition-all duration-200 ${
                            isSelected
                              ? "border-primary/50 bg-primary-light"
                              : "border-border-light bg-card"
                          }`}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[18px] font-semibold text-text-primary">
                                  {unit.unitName}
                                  {unit.unitNumber ? ` · ${unit.unitNumber}` : ""}
                                </p>
                                {isSelected ? (
                                  <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-text-primary shadow-glow">
                                    Selected
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-2 text-[14px] text-text-secondary">
                                {[
                                  unit.unitType,
                                  unit.capacity ? `${unit.capacity} guests` : "",
                                  unit.bedrooms ? `${unit.bedrooms} bedrooms` : "",
                                  unit.bathrooms ? `${unit.bathrooms} bathrooms` : "",
                                  unit.beds ? `${unit.beds} beds` : "",
                                ]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </p>
                              {(unit.stayRules.minimumStay || unit.stayRules.maximumStay) ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {unit.stayRules.minimumStay ? (
                                    <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary">
                                      {formatStayRuleLabel(unit.stayRules.minimumStay, "min")}
                                    </span>
                                  ) : null}
                                  {unit.stayRules.maximumStay ? (
                                    <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary">
                                      {formatStayRuleLabel(unit.stayRules.maximumStay, "max")}
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>

                            <div className="rounded-[20px] border border-border bg-surface px-4 py-4 text-right">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                                Nightly
                              </p>
                              <p className="mt-2 text-[16px] font-semibold text-text-primary">
                                {unit.pricing.nightlyLabel || "Rate unavailable"}
                              </p>
                              {unit.pricing.stayTotalLabel ? (
                                <p className="mt-1 text-[13px] text-text-secondary">
                                  Stay total: {unit.pricing.stayTotalLabel}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <Link
                              href={
                                unitQuery
                                  ? `/properties/${propertyId}?${unitQuery}#request-booking`
                                  : `/properties/${propertyId}#request-booking`
                              }
                              className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                                isSelected
                                  ? "bg-text-primary text-white shadow-medium hover:bg-text-primary/90"
                                  : "border border-border bg-white text-text-primary shadow-soft hover:-translate-y-0.5 hover:border-text-primary/20 hover:shadow-medium"
                              }`}
                            >
                              {isSelected ? "Selected for booking" : "Choose this unit"}
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-border bg-card px-5 py-8 text-center">
                      <p className="text-[15px] font-semibold text-text-primary">
                        No eligible units found for this stay
                      </p>
                      <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                        Adjust your dates or guest count to see more available unit options.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="surface-card rounded-[30px] p-6 md:p-8">
                  <SectionTitle
                    eyebrow="Hosted By"
                    title={detail.host.displayName}
                    description={detail.host.bio || "Responsive host support for a smoother arrival and stay."}
                  />

                  <div className="mt-7 rounded-[26px] border border-border-light bg-card p-5 shadow-soft">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-[24px] font-bold text-text-primary shadow-glow">
                        {getHostInitials(detail.host.displayName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[19px] font-semibold text-text-primary">
                            {detail.host.displayName}
                          </p>
                          <span className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                            Verified host
                          </span>
                        </div>

                        <p className="mt-2 text-[14px] leading-7 text-text-secondary">
                          Published property information, gallery, and pricing are shown exactly from the live API.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="surface-card rounded-[30px] p-6 md:p-8">
                  <SectionTitle
                    eyebrow="Location"
                    title={detail.location.locationLabel || "Location"}
                    description={detail.location.address || "Address details are provided from the public property record."}
                  />

                  <div className="mt-7 overflow-hidden rounded-[26px] border border-border bg-surface shadow-soft">
                    <div className="relative h-[260px] bg-[linear-gradient(180deg,rgba(227,235,241,0.95),rgba(244,248,250,0.98))]">
                      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(26,27,18,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(26,27,18,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
                      <div className="absolute left-[10%] top-[16%] rounded-full bg-white/92 px-4 py-2 text-[12px] font-semibold text-text-primary shadow-soft">
                        {detail.location.city || detail.location.country || "Property area"}
                      </div>
                      <div className="absolute right-[12%] top-[32%] rounded-full bg-white/92 px-4 py-2 text-[12px] font-semibold text-text-primary shadow-soft">
                        {detail.location.country || "Destination"}
                      </div>
                      <div className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-text-primary text-primary shadow-strong">
                        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"
                            fill="currentColor"
                          />
                          <circle cx="12" cy="10" r="2.5" fill="var(--color-primary)" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {[detail.location.address, detail.location.city, detail.location.country]
                      .filter(Boolean)
                      .map((value) => (
                        <span
                          key={value}
                          className="rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-text-secondary shadow-soft"
                        >
                          {value}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="surface-card rounded-[30px] p-6 md:p-8">
                <SectionTitle
                  eyebrow="Reviews"
                  title={`What guests say about ${detail.property.title}`}
                  description="Review summaries and feedback are pulled from the live public property details response."
                />

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-text-primary shadow-glow">
                    {reviewSummaryLabel}
                  </div>
                  <p className="text-[14px] text-text-secondary">
                    Based on {reviewCount} reviews from recent guests
                  </p>
                </div>

                <div className="mt-8 grid gap-4">
                  {detail.reviews.items.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-[24px] border border-border-light bg-card px-5 py-5 shadow-soft"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[15px] font-semibold text-text-primary">
                            {review.reviewer.displayName}
                          </p>
                          <p className="mt-1 text-[13px] text-text-secondary">
                            {formatReviewDate(review.createdAt)}
                          </p>
                        </div>
                        {review.rating !== null ? (
                          <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-primary">
                            {review.rating.toFixed(1)} / 5
                          </span>
                        ) : null}
                      </div>
                      {review.title ? (
                        <p className="mt-4 text-[14px] font-semibold text-text-primary">
                          {review.title}
                        </p>
                      ) : null}
                      <p className="mt-2 text-[14px] leading-7 text-text-secondary">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id="request-booking" className="self-start lg:sticky lg:top-28">
              <PropertyBookingCard
                propertyId={propertyId}
                priceLabel={detail.pricing.minNightlyLabel || "Rate unavailable"}
                initialCheckIn={stayFilters.checkIn || undefined}
                initialCheckOut={stayFilters.checkOut || undefined}
                initialGuests={stayFilters.guests}
                initialUnitId={selectedUnitId || undefined}
                units={detail.units.map((unit) => ({
                  id: unit.id,
                  label: unit.unitNumber ? `${unit.unitName} · ${unit.unitNumber}` : unit.unitName,
                  capacity: unit.capacity,
                  nightlyLabel: unit.pricing.nightlyLabel,
                  stayTotalLabel: unit.pricing.stayTotalLabel,
                }))}
                guestPlaceholder={
                  stats[0]?.value === "Flexible" ? "Enter guests" : `Up to ${stats[0]?.value} guests`
                }
                availabilityLabel={buildAvailabilityNote(detail, stayFilters.error)}
                stayTotalLabel={selectedUnit?.pricing.stayTotalLabel || stayTotalLabel}
              />
            </div>
          </section>

          {detail.similar.length ? (
            <section className="mt-12">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <SectionTitle
                  eyebrow="Related Stays"
                  title="Continue exploring similar properties"
                />
                <Link
                  href="/"
                  className="inline-flex w-fit rounded-full border border-border bg-card px-5 py-3 text-[14px] font-semibold text-text-primary shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium"
                >
                  Back to listings
                </Link>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {detail.similar.map((relatedProperty) => (
                  <ListingCard
                    key={relatedProperty.propertyId}
                    title={relatedProperty.title}
                    location={relatedProperty.locationLabel}
                    priceLabel={relatedProperty.price.displayLabel}
                    rating={relatedProperty.rating?.average ?? undefined}
                    ratingLabel={relatedProperty.rating?.displayLabel}
                    ratingCount={relatedProperty.rating?.count ?? 0}
                    badge={relatedProperty.badge}
                    imageUrl={relatedProperty.coverImageUrl}
                    href={relatedProperty.href}
                    className="w-full"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
