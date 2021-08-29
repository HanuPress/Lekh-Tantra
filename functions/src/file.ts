import { Request, Response } from 'express';
import { validateFirebaseIdToken } from './firebaseValidator';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const express = require('express');
const cookieParser = require('cookie-parser')();
const fileParser = require('express-multipart-file-parser')

const app = express();

app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.use(fileParser)

app.post('/file/upload', async (req: Request, res: Response) => {

  const storage = admin.storage();
  const bucket = storage.bucket();
  
  const uploadedFile = req.files[0];
  //console.log(uploadedFile);
  //console.log("File name = ", uploadedFile.originalname);

  const bucketFile = bucket.file("uploads/" + uploadedFile.originalname);
  await bucketFile.save(Buffer.from(uploadedFile.buffer));
  await bucketFile.setMetadata({});
  console.log('File upload done');
  res.send("File uploaded");

});

app.post('/file/delete', async (req: Request, res: Response) => {

  const storage = admin.storage();
  const bucket = storage.bucket();

  const files: String[] = req.body;
  for await (const file of files) {
    const parts = file.split('/'); // split the url by /
    const fileName = parts[parts.length - 1];
    //const fileRef = storage.refFromURL(file);
    const fileRef = bucket.file("uploads/" + fileName);
    await fileRef.delete();
  }
  
  res.send("Files deleted");

});

exports.file = functions.https.onRequest(app);