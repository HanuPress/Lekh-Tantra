const app = require('./app');
const admin = require('./admin');
const api = require('./api');
const upload = require('./upload');

exports.app = app.app;
exports.admin = admin.admin;
exports.api = api.api;
exports.upload = upload.upload;