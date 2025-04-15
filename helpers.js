const translate = require('translate-google')

// Request to translate API
const translateApi = async (array) => {
    const uniqueArray = [...new Set(array)]
    // no need for nested try catch, any error here is handled by invoked router function
    const gato = await translate(uniqueArray, { to: 'es' });
    // Ensure both arrays are of the same length
    let dict = {}
    if (uniqueArray.length === gato.length) {
        dict = Object.fromEntries(uniqueArray.map((key, index) => [key, gato[index]]));
    } else {
        console.log("Arrays must have the same length.");
    }
    const spanishArray = array.map(item => dict[item]);
    return spanishArray;
}


// transforms raw row based data from google sheets source to json format
function csvArrayToJson(csvArray) {
    // Check if array is empty or not an array
    if (!Array.isArray(csvArray) || csvArray.length === 0) {
        return [];
    }
    // Get headers from first row
    const headers = csvArray[0];
    // Convert remaining rows to JSON objects
    const jsonResult = csvArray.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            // assign '' to empty values for this header/key
            obj[header] = index < row.length ? row[index] : '';
        });
        return obj;
    });
    return jsonResult;
}

module.exports = {
    csvArrayToJson,
    translateApi,
}