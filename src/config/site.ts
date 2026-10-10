export interface NavLink {
  title: string;
  href: string;
}

export const siteConfig = {
  name: "My Postcards",
  subdomain: "mypostcards.sahilbansal.net",
  url: "https://mypostcards.sahilbansal.net",
  tagline: "A little collection of places I've been and moments I've kept.",
  description:
    "A personal photo journal by Sahil Bansal: travel, cafés, city streets and food, kept as a collection of digital postcards.",
  author: {
    name: "Sahil Bansal",
    website: "https://sahilbansal.net",
  },
  navLinks: [
    { title: "Gallery", href: "/gallery" },
    { title: "Trips", href: "/trips" },
    { title: "Places", href: "/destinations" },
    { title: "Cafés", href: "/cafes" },
    { title: "Stories", href: "/stories" },
    { title: "Visitors", href: "/visitors" },
    { title: "About", href: "/about" },
  ] satisfies NavLink[],
} as const;
