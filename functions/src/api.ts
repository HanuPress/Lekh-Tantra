import { Request, Response } from 'express';
import { BlogPost } from '../types/lekhtantra';
import { validateFirebaseIdToken } from './firebaseValidator';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const express = require('express');
const cookieParser = require('cookie-parser')();

const app = express();

app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.use(express.json())

const firestore = admin.firestore();

app.get('/api/whoAmI', (req: Request, res: Response) => {
  res.send(req.user);
});

app.post('/api/post', async (req: Request, res: Response) => {
  
  const FieldValue = admin.firestore.FieldValue;
  const userRef = firestore.doc('Users/' + req.user?.user_id);
  
  const cq = firestore.collection('BlogSettings').doc('Counters');
  const pc = await cq.get();
  const postId = pc.data().postCounter + 1;
  await cq.update({postCounter: FieldValue.increment(1)});

  const blogPost: BlogPost = req.body;
  blogPost.type = req.body.type? req.body.type: 'BlogPost';
  blogPost.meta = {
    createdOn: FieldValue.serverTimestamp(), 
    updatedOn: FieldValue.serverTimestamp(),
    publishedOn: FieldValue.serverTimestamp()
  };
  blogPost.user = userRef;
  blogPost.postLink = postId.toString();

  await firestore.collection('BlogPosts').doc(blogPost.postLink).set(blogPost);
  console.log('Added document with ID: ', postId);
  res.send({id: postId});

});

app.put('/api/post/:postId', async (req: Request, res: Response) => {
  
  const FieldValue = admin.firestore.FieldValue;

  const postUpdateData = {
    title: req.body.title,
    content: req.body.content,
    status: req.body.status,
    meta: {
      updatedOn: FieldValue.serverTimestamp(),
      publishedOn: FieldValue.serverTimestamp()
    }
  };

  const postRef = firestore.collection('BlogPosts').doc(req.params.postId);
  await postRef.update(postUpdateData);
  res.send({updatedOn: FieldValue.serverTimestamp()});

});

app.put('/api/settings', async (req: Request, res: Response) => {
  
  const FieldValue = admin.firestore.FieldValue;

  const settingsUpdateData = {
    blogName: req.body.blogName,
    copyRightInfo: req.body.copyRightInfo
  };

  const settingsRef = firestore.collection('BlogSettings').doc('Settings');
  await settingsRef.update(settingsUpdateData);
  res.send({updatedOn: FieldValue.serverTimestamp()});

});

exports.api = functions.https.onRequest(app);