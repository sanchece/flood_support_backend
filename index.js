const express = require('express')
const cors = require('cors')
const { google } = require('googleapis')
require('dotenv').config();

const port = process.env.PORT || 8080;
const app = express()
const { csvArrayToJson } = require('./helpers.js');
const {
    convertToAppV4DataSet,
    getMainSourceData,
    publishAppV4Data,
    translateToSpanish,
    validateMainSourceData,
    clearAppV4Data,
} = require('./submitDataHelpers.js');
const {
    processedSourceRangeEn,
    processedSourceRangeEs,
    processedSourceSpreadsheetId,
} = require('./constants.js');

app.use(cors());
app.use(cors({
    origin: [process.env.CLIENT_URL, 'https://www.swdetroit.info/', 'https://swdetroit.info/'], // Replace with your frontend domain
    methods: ['GET'], // Allowed methods
}));
app.use(express.json()); // don't need - there isn't any requests with a json body

app.get('/', function (req, res, next) {
    try {
        return res.json({ msg: 'This is CORS-enabled for all origins!' })
    }
    catch (error) {
        return next(error);
    }
})

// route to test prod server
app.get('/gato', async function (req, res, next) {
    try {
        return res.json({ msg: "meow" })
    }
    catch (error) {
        return next(error);
    }
})

// Initialize once at startup
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});
// Get client asynchronously if needed
let client;

async function getSheetsClient() {
    if (!client) {
        client = await auth.getClient();
    }
    return google.sheets({ version: "v4", auth });
}

const sheetsPromise = getSheetsClient();

app.get('/getData', async function (req, res, next) {
    try {
        // get data from processed source
        const sheets = await sheetsPromise;
        const readData = await sheets.spreadsheets.values.batchGet({
            spreadsheetId: processedSourceSpreadsheetId,
            ranges: [processedSourceRangeEn, processedSourceRangeEs],
        });
        // Extract data and convert into an array or arrays
        const baseData = [];
        readData.data.valueRanges.forEach((rangeData) => baseData.push(rangeData.values || []));
        // Convert into Json for front end to recieve
        const formattedEn = csvArrayToJson(baseData[0]);
        const formattedEs = csvArrayToJson(baseData[1]);
        res.json({ en: formattedEn, es: formattedEs });
    } catch (error) {
        next(error);
    }
});

app.get('/submitData', async function (req, res, next) {
    try {
        const sheets = await sheetsPromise;
        // 1) Get data from GLS Main Source Google Sheets
        const mainSourceData = await getMainSourceData(sheets);
        // 2) Validate data
        validateMainSourceData(mainSourceData);
        // 3) Convert data for google sheets table insertion
        const appV4DataCSV = convertToAppV4DataSet(mainSourceData);
        const appV4DataCSVSpanish = await translateToSpanish(appV4DataCSV);
        // 4) Clear data
        clearAppV4Data(sheets);
        // 5) Load data into Google Sheets
        publishAppV4Data({ appV4DataCSV, appV4DataCSVSpanish, sheets })
        return res.json({ Message: "Data was published successfully" });
    }
    catch (error) {
        return next(error);
    }
})

// Custom error handler when next(err) is called in the above routes
// triggering this middleware error handler
app.use(function (err, req, res, next) {
    const status = err.status || 500;
    const message = err.message;
    const errorObject = {
        error: { message, status },
    };
    console.error(errorObject) // logs it in server
    return res.status(status).json(errorObject); // returns it to client
});

// start server
app.listen(port, function () {
    console.log(`CORS-enabled web server listening on port ${port}`)
})
