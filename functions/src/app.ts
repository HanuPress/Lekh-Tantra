import { Request, Response } from 'express';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

const hbsConfig = {
  defaultLayout: 'main', 
  layoutsDir: "views/layouts/",
  partialsDir: "views/partials/"
};
app.engine('handlebars', exphbs(hbsConfig));
app.set('view engine', 'handlebars');

const firestore = admin.firestore();

app.get('/', async (req: Request, res: Response) => {

  const date = new Date();
  
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();
  
  const postsQuery = await firestore.collection('BlogPosts').get();
  const posts = postsQuery.docs.map((doc: any) => doc.data());
  
  res.set('Cache-Control', `public, max-age=${secondsLeftBeforeEndOfHour(date)}`);
  res.render('postlist', {
    name: "Varun Verma",
    time: date,
    title: "Hanu",
    settings: blogSettings,
    posts: posts
  });

});

app.get('/about', async (req: Request, res: Response) => {
  
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();
  
  const aboutMeQuery = await firestore.collection('BlogPosts').doc('AboutMe').get();
  const aboutMe = aboutMeQuery.data();

  const now = new Date();
  blogSettings.currentYear = now.getFullYear();
    
  res.render('about', {
    layout: false,
    settings: blogSettings,
    aboutMe: aboutMe
  });

});

function secondsLeftBeforeEndOfHour(date: Date) {
  const m = date.getMinutes();
  const s = date.getSeconds();
  return 3600 - (m*60) - s;
}

exports.app = functions.https.onRequest(app);