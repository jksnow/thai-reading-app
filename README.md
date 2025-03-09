# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

# Thai Reading App

An interactive Thai language learning application that generates stories with Deepseek AI and provides word translations.

## Features

- Generate Thai stories with adjustable reading levels
- Interactive word translation - click any Thai word to see its English translation
- Choose Your Own Adventure gameplay with branching story paths
- Adjustable font size for comfortable reading

## Setup

### Requirements

- Node.js 18+
- NPM or Yarn

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the project root and add your API keys:

```
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
```

### API Keys

#### Deepseek API

- Create an account at [Deepseek](https://api-docs.deepseek.com/)
- Generate an API key from your account dashboard

#### Google Cloud Translation API

- Create a project in [Google Cloud Console](https://console.cloud.google.com/)
- Enable the Cloud Translation API for your project
- Create API credentials and restrict to the Translation API
- Add allowed domains for your API key to restrict usage

### Running the App

```bash
npm run dev
```

## Development

### Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- APIs: Deepseek AI, Google Cloud Translation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
