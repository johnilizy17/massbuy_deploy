const express = require('express');
const app = express.Router();

require('./endpoints/User')(app);
require('./endpoints/Product')(app);
require('./endpoints/Packages')(app);
require('./endpoints/Category')(app);
require('./endpoints/Delivery')(app);
require('./endpoints/Payment')(app);
require('./endpoints/PackageCategory')(app);

module.exports = app;