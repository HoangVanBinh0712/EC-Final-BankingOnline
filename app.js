const express = require('express')
const exphbs = require('express-handlebars');
const route = require('./routes')
var session = require('express-session');
var flash = require('req-flash');
const path = require('path')
const app = express()
const port = process.env.PORT || 3000
const mongoose = require('mongoose');
require('dotenv').config()
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const bp = require('body-parser')
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

const handlebars = require('handlebars')
handlebars.registerHelper('dateFormat', require('handlebars-dateformat'))

app.use(session({
	secret: 'djhxcvxfgshajfgjhgsjhfgsakjeauytsdfy',
	resave: false,
	saveUninitialized: true
}));
app.use(flash());

const connectDB = async () => {
	try {
		await mongoose.connect(
			`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mern-learnit.qyd2w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}
		)

		console.log('MongoDB connected')
	} catch (error) {
		console.log(error.message)
		process.exit(1)
	}
}
connectDB()
app.engine('hbs', exphbs(
	{ extname: ".hbs" }
));
app.set('view engine', 'hbs')
app.set('views', 'views')
app.set('views', path.join(__dirname, 'views/'));
app.use(express.static(path.join(__dirname, 'public')));
//
const controller = require('./controllers/controller')
const cron = require('node-cron')
cron.schedule('0 53 22 * * *', () => {
	controller.tangtien()
	controller.updategoitietkiem()
	controller.daohan()
	console.log('Job Done');
});
//
//
route(app)

app.listen(port, () => {
	console.log(`app listening at http://localhost:${port}`)
})