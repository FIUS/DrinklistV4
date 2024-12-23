import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.tsx", "**/*.ts"],
    plugins: {
      "react-hooks": hooksPlugin,
    },
    rules: {
      "react/react-in-jsx-scope": 'off',
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^props$|^_$",
        }
      ],
      "@typescript-eslint/triple-slash-reference": 'off',
      "@typescript-eslint/no-empty-object-type": 'off',
      "@typescript-eslint/no-wrapper-object-types": 'off',
      "react/jsx-key": 'off',
      "@typescript-eslint/no-explicit-any": 'off',

      // React Hooks Rules
      "react-hooks/rules-of-hooks": "error", // Enforces the rules of hooks
      "react-hooks/exhaustive-deps": "warn", // Enforces dependency array of hooks
    },

  },
  {
    languageOptions: { globals: globals.browser },
  },
];