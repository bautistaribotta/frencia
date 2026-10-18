// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // supabase/functions es codigo Deno, con su propio runtime y sus imports.
    ignores: ["dist/*", "supabase/functions/*"],
  }
]);
