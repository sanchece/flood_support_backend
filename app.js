


const express = require('express')
const cors = require('cors')

const port = process.env.PORT || 8080;
const app = express()
const {
    translateApi
} = require('./helpers.js');

app.use(cors())


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
        const gato = await translateApi('I speak cat!')
        // throw new Error("random error test")
        return res.json({ msg: gato })
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

