const translate = require('translate-google')

const translateApi = async (word) => {
    // no need for nested try catch, any error here is handled by invoked router function
    const gato = await translate(word, { to: 'es' });
    // throw new Error("error with translate api") // for testing
    return gato;
}

module.exports = {
    translateApi
}