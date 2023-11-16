const XLSX = require("sheetjs-style");
const fs = require("fs");
const path = require("path");

const getJsonData = (path) => {
    try {
        return JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
    } catch (err) {
        return {};
    }
};

const checkFileExists = (path) => {
    return fs.existsSync(path);
};

const getDataFromExcel = (path, keyName, locales) => {
    const result = {
        ...locales.reduce(
            (prev, locale) => ({
                ...prev,
                [locale]: {},
            }),
            {}
        ),
    };

    if (!checkFileExists(path)) {
        return result;
    }

    const workbook = XLSX.readFile(path);

    for (const sheetName of workbook.SheetNames) {
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        jsonData.forEach((item) => {
            const key = item[keyName];

            locales.forEach((locale) => {
                const text = item[locale];

                if (key) {
                    result[locale][key] = text ?? "";
                }
            });
        });
    }

    return result;
};

const buildData = (
    inputPath,
    outputPath,
    { keyName, sourceLocale, targetLocales }
) => {
    const excelData = getDataFromExcel(outputPath, keyName, [
        sourceLocale,
        ...targetLocales,
    ]);

    const sourceContent = getJsonData(inputPath);
    const targetLocaleContent = targetLocales.reduce((prev, locale) => {
        const content = getJsonData(inputPath.replace(sourceLocale, locale));

        return {
            ...prev,
            [locale]: content,
        };
    }, {});

    const keys = Object.keys(sourceContent ?? {});

    const data = [[keyName, sourceLocale, ...targetLocales]];

    keys.forEach((key) => {
        data.push([
            key,
            sourceContent[key],
            ...targetLocales.map(
                (locale) =>
                    excelData[locale][key] ||
                    targetLocaleContent[locale][key] ||
                    ""
            ),
        ]);
    });

    return data;
};

/**
 *
 * @param {*} inputPath Path of json file
 * @param {*} outputPath Path of excel file
 * @param {*} options
 */
const jsonToExcel = (
    inputPath,
    outputPath,
    { keyName, sourceLocale, targetLocales }
) => {
    const wb = XLSX.utils.book_new();

    wb.SheetNames.push("content");

    const data = buildData(inputPath, outputPath, {
        keyName,
        sourceLocale,
        targetLocales,
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    wb.Sheets["content"] = ws;

    XLSX.writeFile(wb, outputPath);
};

/**
 *
 * @param {*} inputPath Path of excel file
 * @param {*} outputDirPath Path of output directory
 * @param {*} options
 */
const excelToJson = (inputPath, outputDirPath, { keyName, locales }) => {
    const data = getDataFromExcel(inputPath, keyName, locales);

    locales.forEach((locale) => {
        const outputPath = path.resolve(outputDirPath, `${locale}.json`);

        const currentLocaleContent = getJsonData(outputPath);

        fs.writeFileSync(
            outputPath,
            JSON.stringify({ ...currentLocaleContent, ...data[locale] }),
            "utf-8"
        );
    });
};

module.exports = { jsonToExcel, excelToJson };
