import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


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
    rules: {
      "react/react-in-jsx-scope": 'off',
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^props$"
        }
      ],
      "@typescript-eslint/triple-slash-reference": 'off',
      "@typescript-eslint/no-empty-object-type": 'off',
      "@typescript-eslint/no-wrapper-object-types": 'off',
      "react/jsx-key": 'off',
      //"no-var": 'off',
      "@typescript-eslint/no-explicit-any": 'off',
    },

  },
  {
    languageOptions: { globals: globals.browser },
  },

];
