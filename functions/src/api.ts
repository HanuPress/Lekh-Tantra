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
  console.log(req.body);
  const blogPost: BlogPost = req.body;
  const result = await firestore.collection('BlogPosts').add(blogPost);
  console.log('Added document with ID: ', result.id);
  res.send({id: result.id});

});

exports.api = functions.https.onRequest(app);