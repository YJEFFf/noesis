import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins:[react()],
  server:{
    watch:{ignored:["**/.local/**"]},
    // Preserve Vite's defaults and keep local research/hosting work out of HTTP serving.
    fs:{deny:[".env",".env.*","*.{crt,pem}","**/.git/**","**/.local/**"]},
  },
});
