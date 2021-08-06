import { Request, Response } from 'express';
import { validateFirebaseIdToken } from './firebaseValidator';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser')();

const app = express();

app.use(cookieParser);
app.use(validateFirebaseIdToken);

const hbsConfig = {
  defaultLayout: 'admin', 
  layoutsDir: "views/admin/layouts/",
  partialsDir: "views/admin/partials/"
};
app.engine('handlebars', exphbs(hbsConfig));
app.set('view engine', 'handlebars');

const firestore = admin.firestore();

app.get('/admin/login', async (req: Request, res: Response) => {
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();
  const adminSettings = {
    "page": "login"
  };
  res.render('admin/login', {
    layout: false,
    settings: blogSettings,
    adminSettings: adminSettings
  });
});

app.get('/admin/dashboard', async (req: Request, res: Response) => {
  const user = admin.auth().currentUser;
  console.log("== Getting current user ==");
  console.log(user);
  console.log("== Request headers ==", req.headers);
  console.log("== Request cookies ==", req.cookies);
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();
  const adminSettings = {
    "page": "login"
  };
  res.render('admin/blank', {
    settings: blogSettings,
    adminSettings: adminSettings
  });
});

app.get('/admin/newpost', async (req: Request, res: Response) => {
  const user = admin.auth().currentUser;
  console.log("== Getting current user ==");
  console.log(user);
  console.log("== Request headers ==", req.headers);
  console.log("== Request cookies ==", req.cookies);
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();
  const adminSettings = {
    "page": "login"
  };
  res.render('admin/createpost', {
    settings: blogSettings,
    adminSettings: adminSettings
  });
});

exports.admin = functions.https.onRequest(app);