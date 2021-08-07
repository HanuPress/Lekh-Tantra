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
  //const user = req.user;
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();
  const adminSettings = {
    "page": "dashboard"
  };
  res.render('admin/blank', {
    settings: blogSettings,
    adminSettings: adminSettings
  });
});

app.get('/admin/postlist', async (req: Request, res: Response) => {
  //const user = req.user;
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();

  const postsQuery = await firestore.collection('BlogPosts').get();
  const posts: any = [];
  for (const doc of postsQuery.docs) {
    const postData = doc.data();
    postData.meta.publishedOn = postData.meta.publishedOn.toDate().toLocaleString();
    posts.push({
      postId: doc.id,
      title: postData.title,
      updatedOn: postData.meta.updatedOn.toDate().toLocaleString()
    });
  }

  const adminSettings = {
    "page": "postlist"
  };
  res.render('admin/postlist', {
    settings: blogSettings,
    adminSettings: adminSettings,
    posts: posts
  });
});

app.get('/admin/newpost', async (req: Request, res: Response) => {
  
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();
  const adminSettings = {
    "page": "newpost"
  };
  const postData = {title: "", content: ""};
  res.render('admin/createpost', {
    settings: blogSettings,
    adminSettings: adminSettings,
    postData: postData
  });
});

app.get('/admin/edit/:postId', async (req: Request, res: Response) => {
  
  const postQuery = await firestore.collection('BlogPosts').doc(req.params.postId).get();
  const pd = postQuery.data();
  const postData = {
    postId: req.params.postId, 
    title: pd.title, 
    content: pd.content
  };

  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();

  const adminSettings = {
    "page": "editpost"
  };

  res.render('admin/createpost', {
    settings: blogSettings,
    adminSettings: adminSettings,
    postData: postData
  });
});

exports.admin = functions.https.onRequest(app);