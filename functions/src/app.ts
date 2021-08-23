import { Request, Response } from 'express';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
let blogSettings: any = {};

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
    layout: false,
    settings: blogSettings,
    posts: posts
  });

});

app.get('/post/:postId', async (req: Request, res: Response) => {
  
  const postsQuery = await firestore.collection('BlogPosts').doc(req.params.postId).get();
  const postData = postsQuery.data();
  if(postData.user){
    const uq = await postData.user.get()
    postData.user = uq.data();
  }
  postData.meta.publishedOn = postData.meta.publishedOn.toDate().toLocaleString();

  //console.log(posts);
  res.render('blog/blogpost', {
    layout: false,
    settings: blogSettings,
    post: postData
  });

});

app.get('/page/:postId', async (req: Request, res: Response) => {
    
  const postsQuery = await firestore.collection('BlogPosts').doc(req.params.postId).get();
  const postData = postsQuery.data();
  if(postData.user){
    const uq = await postData.user.get()
    postData.user = uq.data();
  }
  postData.meta.publishedOn = postData.meta.publishedOn.toDate().toLocaleString();

  const now = new Date();
  blogSettings.currentYear = now.getFullYear();
    
  res.render('blog/blogpage', {
    layout: false,
    settings: blogSettings,
    post: postData
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

  const now = new Date();
  blogSettings.currentYear = now.getFullYear();

  next();

}


exports.app = functions.https.onRequest(app);