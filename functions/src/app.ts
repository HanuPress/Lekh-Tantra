/* eslint-disable */
import { Request, Response } from 'express';
import { jugnu } from '@fire-fly/jugnu';
import { BlogPost } from "./model/BlogPost";

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

jugnu.initialize({});

app.get('/', async (req: Request, res: Response) => {

  const postCollection = jugnu.createFirebaseCollection(BlogPost);

  let posts: BlogPost[];
  posts = await postCollection.query([{field:'type', condition:'==',value:'BlogPost'}]);
  posts.forEach(postData => {
    postData.meta.publishedOn = postData.meta.publishedOn.toDate().toLocaleString();
  });
  
  //console.log(posts);
  res.render('blog/postlist', {
    layout: false,
    settings: blogSettings,
    posts: posts
  });

});

app.get('/post/:postId', async (req: Request, res: Response) => {
  
  const postId: string = req.params.postId;
  const postCollection = jugnu.createFirebaseCollection(BlogPost);

  let postData: BlogPost;
  postData = await postCollection.getDocument(postId);
  postData.meta.publishedOn = postData.meta.publishedOn.toDate().toLocaleString();

  res.render('blog/blogpost', {
    layout: false,
    settings: blogSettings,
    post: postData
  });

});

app.get('/page/:postId', async (req: Request, res: Response) => {
    
  const postId: string = req.params.postId;
  const postCollection = jugnu.createFirebaseCollection(BlogPost);

  let postData: BlogPost;
  postData = await postCollection.getDocument(postId);
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