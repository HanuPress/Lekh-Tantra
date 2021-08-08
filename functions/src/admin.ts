import { Request, Response } from 'express';
import { BlogPost } from '../types/lekhtantra';
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

app.get('/admin/setup', async (req: Request, res: Response) => {
  
  const userQuery = await firestore.collection('Users').get();
  if(userQuery.docs.length > 0){
    // We have some users setup.
    res.redirect('/admin/dashboard')
    return;
  }

  // Show the page for Blog Setup
  const blogSettings = {};
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
  
  const FieldValue = admin.firestore.FieldValue;
  
  // Setup Users
  const adminUser = {
    displayName: req.user?.name,
    socialMedia: {
      twitter: "",
      facebook: "",
      github: ""
    }
  }
  await firestore.collection('Users').doc(req.user?.user_id).set(adminUser);
  const userRef = firestore.doc('Users/' + req.user?.user_id);

  const blogSettings = {
    blogName: req.body.blogname,
    copyRightInfo: req.body.blogname,
    socialMedia: {
      twitter: "",
      facebook: "",
      github: ""
    }
  }
  await firestore.collection('BlogSettings').doc('Settings').set(blogSettings);

  const counters = {
    postCounter: 0
  }
  await firestore.collection('BlogSettings').doc('Counters').set(counters);
  
  // Setup About Me.
  const aboutMe: BlogPost = {
    title: "About Me",
    content: "My name is " + req.user?.name,
    meta: {
      createdOn: FieldValue.serverTimestamp(), 
      updatedOn: FieldValue.serverTimestamp(),
      publishedOn: FieldValue.serverTimestamp()
    },
    type: "Page",
    status: "Draft",
    postLink: "about",
    user: userRef
  };
  await firestore.collection('BlogPosts').doc('AboutMe').set(aboutMe);

  //res.send(req.body);
  res.redirect('/admin/dashboard')
  return;
});

app.get('/admin/dashboard', async (req: Request, res: Response) => {
  //const user = req.user;
  const blogSettingsQuery = await firestore.collection('BlogSettings').doc('Settings').get();
  const blogSettings = blogSettingsQuery.data();

  if(!blogSettings){
    // Blog is not setup..
    res.redirect('/admin/setup')
    return;
  }

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