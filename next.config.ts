import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/randevu", // Randevu sayfanızın URL rotası hangisiyse (ör. /appointment veya /booking) buraya yazın
        permanent: true,
      },
    ];
  },
};

export default nextConfig;