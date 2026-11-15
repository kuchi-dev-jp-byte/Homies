module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#6547FF",
        ink: "#20223E",
        muted: "#8589A5",
        canvas: "#F7F8FE",
        lavender: "#EEEAFF",
      },
    },
  },
  plugins: [],
};
