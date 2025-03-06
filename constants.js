/*
    ********* constants  ******************************

    This file contains global constants

    ***************************************************
*/

const prodSpreadsheetId = process.env.GOOGLE_SHEETS_PROD_ID;

// *************  Graft Living Studios Data Source *****************************
const mainSourceGoogleSheetsIdProd = process.env.GOOGLE_SHEETS_MAIN_SOURCE_ID;
const mainSourceRangeMapProd = {
    item: 'Inventory!T12:T',          // 0
    state: 'Inventory!Z12:Z',         // 1
    who: 'Inventory!R12:R',           // 2
    category1: 'Inventory!U12:U',     // 3
    category2: 'Inventory!V12:V',     // 4
    whoDashboard: 'Dashboard!E17:E',  // 5
    address: 'Dashboard!G17:G',       // 6
    how: 'Dashboard!D17:D',           // 7
    accepting: 'Dashboard!B17:B',     // 8
    connect: 'Dashboard!J17:J',       // 9
    contact: 'Dashboard!F17:F',       // 10
    allCategories1: 'Resource Types!A5:A',  // 11
    allCategories2: 'Resource Types!B5:B',  // 12
    allStates: 'Resource Types!M5:M8',       // 13
}
const prodRangeEn = "v4_app_en";
const prodRangeEs = "v4_app_es";

// ******************************************************************************


// #################### dev ####################
const mainSourceGoogleSheetsIdDev = process.env.GOOGLE_SHEETS_DEV_ID;
const mainSourceRangeMapDev = {
    item: 'Inventory Test!H2:H',          // 0
    state: 'Inventory Test!N2:N',         // 1
    who: 'Inventory Test!F2:F',           // 2
    category1: 'Inventory Test!I2:I',     // 3
    category2: 'Inventory Test!J2:J',     // 4
    whoDashboard: 'Dashboard Test!D2:D',  // 5
    address: 'Dashboard Test!F2:F',       // 6
    how: 'Dashboard Test!C2:C',           // 7
    accepting: 'Dashboard Test!A2:A',     // 8
    connect: 'Dashboard Test!I2:I',       // 9
    contact: 'Dashboard Test!E2:E',       // 10
    allCategories1: 'Resource Type Test!A2:A',  // 11
    allCategories2: 'Resource Type Test!B2:B',  // 12
    allStates: 'Resource Type Test!M2:M',       // 13
}
const devRangeEn = "v4_app_en_dev";
const devRangeEs = "v4_app_es_dev";

// ********************************************\

const isProd = process.env.PROD === 'TRUE';
const mainSourceGoogleSheetsId = isProd ? mainSourceGoogleSheetsIdProd : mainSourceGoogleSheetsIdDev
const mainSourceRangeMap = isProd ? mainSourceRangeMapProd : mainSourceRangeMapDev
const rangeEn = isProd ? prodRangeEn : devRangeEn;
const rangeEs = isProd ? prodRangeEs : devRangeEs;
module.exports = {
    mainSourceGoogleSheetsId,
    mainSourceRangeMap,
    rangeEn,
    rangeEs,
    prodSpreadsheetId,
}
