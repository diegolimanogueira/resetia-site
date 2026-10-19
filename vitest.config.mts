import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Sem @vitejs/plugin-react de propósito: ele puxa Babel 8 como peer e conflita com shadcn/eslint (Babel 7).
// O Vite compila TSX com o runtime automático do React sozinho (tsconfig jsx: react-jsx).
// Os aliases "@/" vêm do tsconfig.test.json: o tsconfig.json do build exclui tests/ (a DO instala sem devDependencies).
export default defineConfig({
  plugins: [tsconfigPaths({ projects: ["./tsconfig.test.json"] })],
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/unit/setup.ts"],
    css: false,
  },
});
