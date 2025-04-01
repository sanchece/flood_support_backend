//  **************** constants  ********************

// *************  Graft Living Studios Data Source *****************************
const mainSourceRangeMapProd = {
    item: 'Inventory!T10:T',          // 0
    state: 'Inventory!Z10:Z',         // 1
    who: 'Inventory!R10:R',           // 2
    category1: 'Inventory!U10:U',     // 3
    category2: 'Inventory!V10:V',     // 4
    whoDashboard: 'Dashboard!E17:E',  // 5
    address: 'Dashboard!G17:G',       // 6
    how: 'Dashboard!D17:D',           // 7
    accepting: 'Dashboard!B17:B',     // 8
    connect: 'Dashboard!J17:J',       // 9
    contact: 'Dashboard!F17:F',       // 10
    allCategories1: 'Resource Types!A5:A',  // 11
    allCategories2: 'Resource Types!B5:B',  // 12
    allStates: 'Resource Types!M5:M8',       // 13
    important: 'Inventory!AB10:AB',         // 1
}

// *******************     dev     ***********************************
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
    important: 'Inventory Test!O2:O300',         // 14
}

const mainSourceGoogleSheetsId = process.env.GOOGLE_SHEETS_MAIN_SOURCE_ID;
const isProd = process.env.PROD === 'TRUE';
const mainSourceRangeMap = isProd ? mainSourceRangeMapProd : mainSourceRangeMapDev


const processedSourceSpreadsheetId = process.env.GOOGLE_SHEETS_PROCESSED_SOURCE_ID;
const processedSourceRangeEn = process.env.GOOGLE_SHEETS_PROCESSED_SOURCE_EN;
const processedSourceRangeEs = process.env.GOOGLE_SHEETS_PROCESSED_SOURCE_ES;

const ordCoordsMap = {
    'DHDC': '[42.29092296208219, -83.1284793783231]',
    'GLS/CCG': '[42.31042777479261, -83.11059846448094]',
    'Kemeny Rec Center': '[42.33180300207827, -83.09299323565106]',
    'Santos Church': '[42.316477834989165, -83.1077980407536]',
    'SDBA': '[42.31236619853888, -83.1252800626131]',
    'UNI': '[42.30524029038813, -83.12620346446774]',
    'Vamanos': '[42.32022772253091, -83.09676619149316]',
    '27th Letter Books': '[42.33177917903327, -83.09297714603343]',
    'LA SED': '[42.314511439527124, -83.12066380555552',
  };

module.exports = {
    mainSourceGoogleSheetsId,
    mainSourceRangeMap,
    ordCoordsMap,
    processedSourceRangeEn,
    processedSourceRangeEs,
    processedSourceSpreadsheetId,
}
