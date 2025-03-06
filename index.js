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
    mainSourceGoogleSheetsId,
    mainSourceRangeMap,
    rangeEn,
    rangeEs,
    prodSpreadsheetId,
} = require('./constants.js');

// auth 1: restrict to only target origin
app.use(cors());
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend domain
    // origin: '*', // * means any origin is accepted
    // methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    methods: ['GET'], // Allowed methods
    // credentials: true // If you need cookies or authentication
}));
app.use(express.json()); // don't need - there isn't any requests with a json body


// auth 2: check for valid API key 
// app.use((req, res, next) => {
// const key = req.headers['x-api-key'];
// if (!key || key !== API_KEY) {
//     return res.status(403).json({ error: 'Invalid or missing API key' });
// }
// next();
// });

app.get('/', function (req, res, next) {
    try {
        return res.json({ msg: 'This is CORS-enabled for all origins!' })
    }
    catch (error) {
        return next(error);
    }
})

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
        const sheets = await sheetsPromise;
        const readData = await sheets.spreadsheets.values.batchGet({
            spreadsheetId: prodSpreadsheetId,
            ranges: [rangeEn, rangeEs],
        });
        const baseData = [];
        readData.data.valueRanges.forEach((rangeData) => baseData.push(rangeData.values || []));
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
        const mainSourceData = await getMainSourceData(sheets);   // Get data from GLS Main Source Google Sheets
        validateMainSourceData(mainSourceData);
        const appV4DataCSV = convertToAppV4DataSet(mainSourceData);
        const appV4DataCSVSpanish = await translateToSpanish(appV4DataCSV);
        clearAppV4Data(sheets);
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

