const controller = require('./controllers/controller')
const schedule = require('node-schedule');
schedule.scheduleJob('30 * * * * *', ()=>{
    // Execute something every 15 minutes
    controller.tangtien()
	console.log("work done")
});