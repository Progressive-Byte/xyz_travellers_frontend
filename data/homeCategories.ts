export const homeCategories = ["Apartments", "Rooms", "Hotels"] as const;

export type HomeCategory = (typeof homeCategories)[number];
