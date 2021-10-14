/* eslint-disable */
import {Request, Response} from "express";
import {validateFirebaseIdToken} from "./firebaseValidator";
import { jugnu } from '@fire-fly/jugnu';
import { User } from "./model/User";
import { BlogPost } from "./model/BlogPost";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const express = require("express");
const cookieParser = require("cookie-parser")();

const app = express();

app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.use(express.json());

const firestore = admin.firestore();

jugnu.initialize({});

app.get("/api/whoAmI", (req: Request, res: Response) => {
  res.send(req.user);
});

app.post("/api/post", async (req: Request, res: Response) => {
  
  const postCollection = jugnu.createFirebaseCollection(BlogPost);
  const FieldValue = admin.firestore.FieldValue;

  const user = new User(req.user?.user_id);
  
  const cq = firestore.collection("BlogSettings").doc("Counters");
  const pc = await cq.get();
  const postId = pc.data().postCounter + 1;
  await cq.update({postCounter: FieldValue.increment(1)});

  const blogPost = new BlogPost(postId);
  blogPost.copyFromRequest(req.body);
  blogPost.user = user;

  blogPost.meta = {
    createdOn: FieldValue.serverTimestamp(), 
    updatedOn: FieldValue.serverTimestamp(),
    publishedOn: FieldValue.serverTimestamp()
  };
  
  await postCollection.create(blogPost);
  console.log("Added document with ID: ", postId);
  res.send({id: postId});

});

app.put("/api/post/:postId", async (req: Request, res: Response) => {
  
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

  const postRef = firestore.collection("BlogPosts").doc(req.params.postId);
  await postRef.update(postUpdateData);
  res.send({updatedOn: FieldValue.serverTimestamp()});

});

app.put("/api/settings", async (req: Request, res: Response) => {
  
  const FieldValue = admin.firestore.FieldValue;

  const settingsUpdateData = {
    blogName: req.body.blogName,
    aboutBlog: req.body.aboutBlog,
    copyRightInfo: req.body.copyRightInfo
  };

  const settingsRef = firestore.collection("BlogSettings").doc("Settings");
  await settingsRef.update(settingsUpdateData);
  res.send({updatedOn: FieldValue.serverTimestamp()});

});

exports.api = functions.https.onRequest(app);