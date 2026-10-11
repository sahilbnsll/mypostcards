export interface NavLink {
  title: string;
  href: string;
  /** A small line drawing shown beside the title on wide screens. */
  icon: "gallery" | "trips" | "places" | "cafes" | "stories" | "visitors" | "about";
  /** A few words under the link in the mobile menu. */
  hint: string;
}

export const siteConfig = {
  name: "My Postcards",
  subdomain: "mypostcards.sahilbansal.net",
  url: "https://mypostcards.sahilbansal.net",
  /** The short line under the wordmark: who the postcards come from. */
  descriptor: "Postcards from Sahil",
  tagline: "A little collection of places I've been and moments I've kept.",
  description:
    "A personal photo journal by Sahil Bansal: travel, cafés, city streets and food, kept as a collection of digital postcards.",
  author: {
    name: "Sahil Bansal",
    website: "https://sahilbansal.net",
  },
  socials: [
    { title: "Personal Site", href: "https://sahilbansal.net" },
    { title: "GitHub", href: "https://github.com/sahilbnsll" },
    { title: "Twitter / X", href: "https://x.com/sahilbansalll" },
    { title: "Instagram", href: "https://www.instagram.com/__heyitsahil/" },
  ],
  navLinks: [
    { title: "Gallery", icon: "gallery", href: "/gallery", hint: "Every postcard, with filters" },
    { title: "Trips", icon: "trips", href: "/trips", hint: "Journeys, day by day" },
    { title: "Places", icon: "places", href: "/destinations", hint: "On a globe and a map" },
    { title: "Cafés", icon: "cafes", href: "/cafes", hint: "Where I sat and what I ordered" },
    { title: "Stories", icon: "stories", href: "/stories", hint: "Longer reads" },
    { title: "Visitors", icon: "visitors", href: "/visitors", hint: "Leave a note or a drawing" },
    { title: "About", icon: "about", href: "/about", hint: "Who keeps this place" },
  ] satisfies NavLink[],
} as const;
