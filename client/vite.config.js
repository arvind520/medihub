/**
 * FILE: client/tailwind.config.js
 * PURPOSE: Configures Tailwind CSS to scan our source files for class names.
 * The `content` array tells Tailwind WHERE to look for class usage.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}", // scan all JS/JSX files inside src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
