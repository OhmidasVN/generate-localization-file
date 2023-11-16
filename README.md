## generate-i18n-files

### Installation

```shell
npm install generate-i18n-files # with npm
yarn add generate-i18n-files # with yarn
```

### Usage

```js
const { excelToJson, jsonToExcel } = require("generate-i18n-files");
const path = require("path");

const jsonToExcelOptions = {
    keyName: "key", // Key name column
    sourceLocale: "vi", // Source locale
    targetLocales: ["ja", "en"], // Target locales
};

jsonToExcel(
    path.resolve(__dirname, "./resources/vi.json"), // Source json file path
    path.resolve(__dirname, "./resource.xlsx"), // Excel file path
    jsonToExcelOptions
);

const excelToJsonOptions = {
    keyName: "key", // Key name column
    locales: ["ja", "en"], // Locales you want to generate
};

excelToJson(
    path.resolve(__dirname, "./resource.xlsx"), // Excel file path
    path.resolve(__dirname, "./resources"), // Directory contains json files
    excelToJsonOptions
);
```
