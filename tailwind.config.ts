import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    maxWidth: {
      default: "1000px",
      profile_out: "800px",
      profile_in: "500px",
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
export default config;
