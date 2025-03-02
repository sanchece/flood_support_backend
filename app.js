


var express = require('express')
var cors = require('cors')
var app = express()

const translate = require('translate-google')

app.use(cors())

const translateToSpanish = async (word) => {
    try{
    const gato = await translate(word, { to: 'es' });
    return gato;
    }catch(error){
        console.error("Error in fetchData:", error);
        return 'Oops, there was an error with the data fetch :(';
    }
}

app.get('/', function (req, res, next) {
    res.json({ msg: 'This is CORS-enabled for all origins!' })
})

app.get('/gato', async function (req, res, next) {
    const gato = await translateToSpanish('I speak cat!')
    console.log(gato)
    res.json({msg: gato})
})

app.listen(8080, function () {
    console.log('CORS-enabled web server listening on port 8080')
})