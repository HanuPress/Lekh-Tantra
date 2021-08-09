import { Request, Response } from 'express';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
let blogSettings = {};

const hbsConfig = {
  defaultLayout: 'main', 
  layoutsDir: "views/blog/layouts/",
  partialsDir: "views/blog/partials/"
};
app.engine('handlebars', exphbs(hbsConfig));
app.set('view engine', 'handlebars');
app.use(checkSetup);

const firestore = admin.firestore();

app.get('/', async (req: Request, res: Response) => {
 
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();

  if(!blogSettings){
    // Blog is not setup..
    res.redirect('/admin/setup')
    return;
  }
  
  const postsQuery = await firestore.collection('BlogPosts').where('type', '==', 'BlogPost').get();
  const posts: any = [];
  for (const doc of postsQuery.docs) {
    const postData = doc.data();
    if(postData.user){
      const uq = await postData.user.get()
      postData.user = uq.data();
    }
    postData.meta.publishedOn = postData.meta.publishedOn.toDate().toLocaleString();
    posts.push(postData);
  }
  //console.log(posts);
  res.render('blog/postlist', {
    settings: blogSettings,
    posts: posts
  });

});

app.get('/post/:postId', async (req: Request, res: Response) => {
 
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();

  if(!blogSettings){
    // Blog is not setup..
    res.redirect('/admin/setup')
    return;
  }
  
  const postsQuery = await firestore.collection('BlogPosts').doc(req.params.postId).get();
  const posts: any = [];
  const postData = postsQuery.data();
  if(postData.user){
    const uq = await postData.user.get()
    postData.user = uq.data();
  }
  postData.meta.publishedOn = postData.meta.publishedOn.toDate().toLocaleString();
  posts.push(postData);

  //console.log(posts);
  res.render('blog/postlist', {
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
    
  res.render('blog/about', {
    layout: false,
    settings: blogSettings,
    aboutMe: aboutMe
  });

});

async function checkSetup(req: Request, res: Response, next: any){

  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  blogSettings = blogSettingsQuery.data();

  if(!blogSettings){
    // Blog is not setup..
    res.redirect('/admin/setup');
    return;
  }

  next();

}


exports.app = functions.https.onRequest(app);