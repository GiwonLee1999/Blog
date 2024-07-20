require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override'); // when PUT method is used, you much override it
const cookieParser = require('cookie-parser'); // enables you to save cookie for logon
const MongoStore = require('connect-mongo');
const session = require('express-session');
const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routerHelpers')

const app = express();
const PORT = 5000 || process.env.PORT;

// connect to DB
connectDB();

// express - to send data 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ // reference to env
        mongoUrl: process.env.MONGODB_URI
    }),
}));

app.use(express.static('public'));

// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

// route pages:
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});