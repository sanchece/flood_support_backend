/*
    ******** /submitData End point functions  ********

    This file only contains functions used within
    the submit data end point

    ***************************************************
*/

const {
    csvArrayToJson,
    translateApi,
} = require('./helpers.js');

const {
    mainSourceGoogleSheetsId,
    rangeEn,
    rangeEs,
    prodSpreadsheetId,
    mainSourceRangeMap,
} = require('./constants.js');

const getMainSourceData = async (sheets) => {
    // constants - help map google sheets data ranges
    const keys = Object.keys(mainSourceRangeMap);
    const ranges = Object.values(mainSourceRangeMap);

    // Get data from GLS Main Source Google Sheets
    const mainSourceResponse = await sheets.spreadsheets.values.batchGet({
        spreadsheetId: mainSourceGoogleSheetsId,
        ranges,
    });

    // Process the response - GS response contains an object per data range, here we combine it all into an array
    const mainSourceData = [];
    mainSourceResponse.data.valueRanges.forEach((rangeData, index) => {
        const flattenedValues = rangeData.values.map(item => item[0] || '');  // Flatten the 2D array into a 1D array [[],[]] ---> ['','']
        flattenedValues.unshift(keys[index]);  // add column header
        mainSourceData.push(flattenedValues || '');
    });

    //Clean Data - removes duplicates from unique column ranges
    const typesRanges = ['allCategories1', 'allCategories2', 'allStates', 'whoDashboard'];
    mainSourceData.map((subArray, i) => { if (typesRanges.includes(subArray[0])) { mainSourceData[i] = [...new Set(subArray)] } })
    return mainSourceData;
}

const validateMainSourceData = (mainSourceData) => {
    // Validate data - return error if an invalid value is found
    const validOrgs = mainSourceData[5]; // orgs defined in 'Who' defined in 'Dashboard' Google Sheet
    const validStates = mainSourceData[13];
    const validCategory1 = mainSourceData[11];
    const itemsLength = mainSourceData[0].length;
    const stateLength = mainSourceData[1].length;
    const whoLength = mainSourceData[2].length;
    const category1Length = mainSourceData[3].length;
    const category2Length = mainSourceData[4].length;

    if (itemsLength !== stateLength ||
        stateLength !== whoLength ||
        whoLength !== category1Length ||
        category1Length !== category2Length) {
        throw new Error(`There's a missing value in one of these columns: Resource, Provider, State, Cat 1, Cat 2`);
    }
    mainSourceData.map(subArray => {
        if (subArray[0] === 'state') {
            subArray.map((state, i) => { if (!validStates.includes(state) && i !== 0) { throw new Error(`Invalid State: "${state}" is an invalid value`) } })
        }
        if (subArray[0] === 'category1') {
            subArray.map((category, i) => { if (!validCategory1.includes(category) && i !== 0) { throw new Error(`Invalid Category 1: "${category}" is an invalid value`) } })
        }
        if (subArray[0] === 'who') {
            subArray.map((org, i) => { if (!validOrgs.includes(org) && i !== 0) { throw new Error(`Invalid WHO : "${org}" is an invalid value`) } })
        }
        if (subArray[0] === 'item') {
            subArray.map(item => { if (item === '') { throw new Error(`Invalid Item: An item is empty`) } })
        }
    })
}

const convertToAppV4DataSet = (mainSourceData) => {
    // Categorize data - break down array of all data into 3 arrays based on category
    const inventoryColumns = ['item', 'state', 'who', 'category1', 'category2']
    const orgColumns = ['whoDashboard', 'address', 'how', 'accepting', 'connect', 'contact']
    const typesDataColumns = ['allCategories1', 'allCategories2', 'allStates']
    const inventoryData = mainSourceData.filter(subArray => inventoryColumns.includes(subArray[0]));
    const orgData = mainSourceData.filter(subArray => orgColumns.includes(subArray[0]));
    // const typesData = mainSourceData.filter(subArray => typesDataColumns.includes(subArray[0]));

    // Convert array of columns to array of rows - Object.keys(inventoryData[0]) gets indices for all rows, then map iterates thru them to populate row arrays
    const inventoryDataRows = Object.keys(inventoryData[0]).map(rowIndex => inventoryData.map(column => column[rowIndex]));
    const orgDataRows = Object.keys(orgData[0]).map(rowIndex => orgData.map(column => column[rowIndex]));
    // const typesDataRows = Object.keys(typesData[0]).map(rowIndex => typesData.map(column => column[rowIndex]));

    // Merge items data and orgs data
    const itemsJson = csvArrayToJson(inventoryDataRows);
    const orgsJson = csvArrayToJson(orgDataRows);
    itemsJson.forEach(itemA => {
        let match = orgsJson.find(itemB => itemB.whoDashboard === itemA.who); // Find the matching object in arrayB
        if (match) {        // If a match is found, add the properties from itemB into itemA
            itemA.address = match.address || '';
            itemA.how = match.how || '';
            itemA.accepting = match.accepting ||'';
            itemA.connect = match.connect || '';
            itemA.contact = match.contact || '';
        }
    });

    // Prep Data v4_app table insertion -  Convert array of objects to array of row arrays for table insertion
    const headers = ['item', 'state', 'who', 'category1', 'category2', 'address', 'how', 'accepting', 'connect', 'contact'];
    const appV4DataCSV = [
        headers, // The first row is the headers
        ...itemsJson.map(item => headers.map(header => item[header])) // Convert each object to an array of values based on the headers
    ];
    return appV4DataCSV
}

const translateToSpanish = async (appV4DataCSV) => {
    const spanishData = JSON.parse(JSON.stringify(appV4DataCSV)); // create deep copy
    const items = spanishData.map(subArray => subArray[0]);
    const category1 = spanishData.map(subArray => subArray[3]);
    const category2 = spanishData.map(subArray => subArray[4]);
    const how = spanishData.map(subArray => subArray[6]);
    const connect = spanishData.map(subArray => subArray[7]);
    const accepting = spanishData.map(subArray => subArray[8]);

    // Use Promise.all to translate items and states in parallel
    const [
        translatedItems,
        translatedCat1,
        translatedCat2,
        translatedHow,
        translatedConnect,
        translatedAccepting,
    ] = await Promise.all([
        translateApi(items),
        translateApi(category1),
        translateApi(category2),
        translateApi(how),
        translateApi(connect),
        translateApi(accepting),
    ]);

    // Update the spanishData in a single loop (no need for extra iteration)
    spanishData.forEach((subArray, i) => {
        if (i !== 0) {  // Skip the first row if needed
            subArray[0] = translatedItems[i];   // Update translated item
            subArray[3] = translatedCat1[i];   // Update translated state
            subArray[4] = translatedCat2[i];   // Update translated state
            subArray[6] = translatedHow[i];   // Update translated state
            subArray[7] = translatedConnect[i];   // Update translated state
            subArray[8] = translatedAccepting[i];   // Update translated state
        }
    });
    return spanishData;
}

const clearAppV4Data = async (sheets) => {
    const request = {
        spreadsheetId: prodSpreadsheetId,
        resource: {
            ranges: [
                rangeEn,
                rangeEs, // This will clear all cells in the sheet
            ],
        },
    };
    await sheets.spreadsheets.values.batchClear(request);
}

const publishAppV4Data = ({ appV4DataCSV, appV4DataCSVSpanish, sheets }) => {
    resource = {
        valueInputOption: "RAW",
        data: [
            {
                range: rangeEn,
                majorDimension: "ROWS",
                values: appV4DataCSV
            },
            {
                range: rangeEs,
                majorDimension: "ROWS",
                values: appV4DataCSVSpanish
            },
        ]
    }
    sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: prodSpreadsheetId,
        resource,
    });
}

module.exports = {
    clearAppV4Data,
    convertToAppV4DataSet,
    getMainSourceData,
    publishAppV4Data,
    translateToSpanish,
    validateMainSourceData,
}
