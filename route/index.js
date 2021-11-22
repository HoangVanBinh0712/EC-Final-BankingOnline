const newsrouter = require('./news')

function route(app){
    app.use('/', newsrouter)
}

module.exports = route