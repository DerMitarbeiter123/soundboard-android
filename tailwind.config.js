/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#2b8cee",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
                "surface-dark": "#1c2127",
                "surface-light": "#ffffff",
            },
            fontFamily: {
                "display": ["Spline Sans", "sans-serif"]
            },
            borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
            animation: {
                'bounce-1': 'bounce 1s infinite',
                'bounce-2': 'bounce 1.2s infinite',
                'bounce-3': 'bounce 0.8s infinite',
            }
        },
    },
    plugins: [],
}
