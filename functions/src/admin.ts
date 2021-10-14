/* eslint-disable */
import { Request, Response } from 'express';
import { jugnu } from '@fire-fly/jugnu';
import { BlogPost } from "./model/BlogPost";
import { User } from "./model/User";

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
let blogSettings: any = {};

app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.use(checkSetup);

const hbsConfig = {
  defaultLayout: 'admin', 
  layoutsDir: "views/admin/layouts/",
  partialsDir: "views/admin/partials/"
};
app.engine('handlebars', exphbs(hbsConfig));
app.set('view engine', 'handlebars');

const firestore = admin.firestore();
jugnu.initialize({});

app.get('/admin/login', async (req: Request, res: Response) => {
  const adminSettings = {
    "page": "login"
  };
  res.render('admin/login', {
    layout: false,
    settings: blogSettings,
    adminSettings: adminSettings
  });
});

app.get('/admin/setup', async (req: Request, res: Response) => {
  
  const userCollection = jugnu.createFirebaseCollection(User);
  const userList = await userCollection.query([]);
  if (userList.length > 0) {
    // We have some users setup.
    res.redirect('/admin/dashboard')
    return;
  }

  // Show the page for Blog Setup
  blogSettings = {};
  const adminSettings = {
    "page": "setup"
  };
  res.render('admin/setup', {
    layout: false,
    settings: blogSettings,
    adminSettings: adminSettings
  });
});

app.post('/admin/setup', async (req: Request, res: Response) => {
  /**
   * Setup the Blog.
   * Create default collections
   */
  
  const userCollection = jugnu.createFirebaseCollection(User);
  const postCollection = jugnu.createFirebaseCollection(BlogPost);
   
  // Double check if an admin user exists
  const userList = await userCollection.query([]);
  if(userList.length > 0){
    // We have some users setup.
    res.redirect('/admin/dashboard')
    return;
  }

  // We dont have any users... so this is admin user setting up the blog. Create this user.
  const userRecord = await admin.auth().createUser({
    email: req.body.admin_email,
    password: req.body.password,
    emailVerified: false,
    displayName: req.body.display_name
  });

  // Assign admin role.
  await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

  // Send verification email
  //await admin.auth().sendEmailVerification();

  const FieldValue = admin.firestore.FieldValue;
  
  // Setup Users
  const adminUser = new User(userRecord.uid);
  adminUser.displayName = userRecord.displayName;
  adminUser.socialMedia = {
    twitter: "",
    facebook: "",
    github: ""
  };
  await userCollection.create(adminUser);

  const blogSettings = {
    blogName: req.body.blogname,
    copyRightInfo: req.body.blogname,
    socialMedia: {
      twitter: "",
      facebook: "",
      github: ""
    },
    currentVersion: _getVersion()
  }
  await firestore.collection('BlogSettings').doc('Settings').set(blogSettings);

  const counters = {
    postCounter: 0
  }
  await firestore.collection('BlogSettings').doc('Counters').set(counters);
  
  // Setup About Me.
  const aboutMe = new BlogPost("AboutMe");
  aboutMe.title = "About Me";
  aboutMe.content = "My name is " + userRecord.displayName;
  aboutMe.meta = {
    createdOn: FieldValue.serverTimestamp(), 
    updatedOn: FieldValue.serverTimestamp(),
    publishedOn: FieldValue.serverTimestamp()
  };
  aboutMe.type = "Page";
  aboutMe.status = "Draft";
  aboutMe.postLink = "about";
  aboutMe.user = adminUser;
  await postCollection.create(aboutMe);

  // Setup Terms and conditions Me.
  const tnc = new BlogPost("tnc");
  tnc.title = "Terms and Conditions";
  tnc.content = "Terms and Conditions";
  tnc.meta = {
    createdOn: FieldValue.serverTimestamp(), 
    updatedOn: FieldValue.serverTimestamp(),
    publishedOn: FieldValue.serverTimestamp()
  };
  tnc.type = "Page";
  tnc.status = "Draft";
  tnc.postLink = "tnc";
  tnc.user = adminUser;
  await postCollection.create(tnc);

  // Setup Privacy Page.
  const privacy = new BlogPost("privacy");
  privacy.title = "Privacy";
  privacy.content = "Privacy settings";
  privacy.meta = {
    createdOn: FieldValue.serverTimestamp(), 
    updatedOn: FieldValue.serverTimestamp(),
    publishedOn: FieldValue.serverTimestamp()
  };
  privacy.type = "Page";
  privacy.status = "Draft";
  privacy.postLink = "privacy";
  privacy.user = adminUser;
  await postCollection.create(privacy);

  // Make the default bucket as public
  const storage = admin.storage();
  const bucket = storage.bucket();
  await bucket.makePublic();

  res.redirect('/admin/login')
  return;
});

app.get('/admin/upgrade', async (req: Request, res: Response) => {
  
  const adminSettings = {
    "page": "upgrade"
  };
  res.render('admin/upgrade', {
    settings: blogSettings,
    adminSettings: adminSettings
  });
});

app.post('/admin/upgrade', async (req: Request, res: Response) => {
  /**
   * Upgrade the Blog.
   */

  if(!blogSettings.upgradeRequired){
    res.send("Upgrade not required");
    return;
  }

  if (blogSettings.currentVersion.code === 1) {
    // Upgrade from Version 1
    // Make the default bucket as public
    const storage = admin.storage();
    const bucket = storage.bucket();

    try {

      await bucket.makePublic();
      const settingsRef = firestore.collection('BlogSettings').doc('Settings');
      await settingsRef.update({"currentVersion": blogSettings.newVersion});
      res.redirect('/admin/dashboard')
      return;
      
    } catch (error) {
      console.log("Error when giving public access: ", error);
      res.send("Upgrade failed!");
      return;
    }
  }
  
});

app.get('/admin/dashboard', async (req: Request, res: Response) => {

  const adminSettings = {
    "page": "dashboard"
  };
  res.render('admin/dashboard', {
    settings: blogSettings,
    adminSettings: adminSettings
  });
});

app.get('/admin/postlist', async (req: Request, res: Response) => {

  const postCollection = jugnu.createFirebaseCollection(BlogPost);

  let postData: BlogPost[];
  postData = await postCollection.query([]);

  const posts: any = [];
  postData.forEach(pd => {
    posts.push({
      postId: pd.postId,
      title: pd.title,
      updatedOn: pd.meta.updatedOn.toDate().toLocaleString()
    });
  });

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

  const adminSettings = {
    "page": "editpost"
  };

  res.render('admin/createpost', {
    settings: blogSettings,
    adminSettings: adminSettings,
    postData: postData
  });
});

app.get('/admin/settings', async (req: Request, res: Response) => {

  const adminSettings = {
    "page": "settings"
  };
  res.render('admin/settings', {
    settings: blogSettings,
    adminSettings: adminSettings
  });
});

app.get('/admin/gallery', async (req: Request, res: Response) => {

  const storage = admin.storage();
  const defaultBucket = storage.bucket();
  console.log("Bucket: ", defaultBucket.name);

  const fileList: any = [];

  const [files] = await defaultBucket.getFiles({prefix: "uploads/", delimiter: "/"});
  for (const file of files) {
    const [metadata] = await file.getMetadata();
    if(metadata.contentType.substring(0,5) === 'image'){
      fileList.push({
        fileName: file.name.replace("uploads/", ""),
        url: file.publicUrl()
      });
    }
  }
  
  const adminSettings = {
    "page": "gallery"
  };
  res.render('admin/gallery', {
    settings: blogSettings,
    fileList: fileList,
    adminSettings: adminSettings
  });
});

async function checkSetup(req: Request, res: Response, next: any){

  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  blogSettings = blogSettingsQuery.data();

  if(['/admin/login', '/admin/setup'].includes(req.path)){
    next();
    return;
  }

  if(!req.user?.admin){
    res.status(403).send('Unauthorized');
    return;
  }

  if(!blogSettings){
    // Blog is not setup..
    res.redirect('/admin/setup');
    return;
  }

  const now = new Date();
  blogSettings.currentYear = now.getFullYear();
  blogSettings.newVersion = _getVersion();
  if (blogSettings.newVersion.code > blogSettings.currentVersion.code) {
    blogSettings.upgradeRequired = true;
  }

  next();

}

function _getVersion(){
  return {"code":2, "version":"Aplha2"};
}

exports.admin = functions.https.onRequest(app);