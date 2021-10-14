# Lekh-Tantra
Lekh Tantra is an open source Blogging Platform that runs on Google Cloud Platform / Firebase Platform. 

## Motivation
There are several blogging applications (CMS) already out there in the market. 

However, none of them is actually free !


For e.g. WordPress is free... However, to host a WordPress blog - one has to buy hosting (and pay for it). 

My aim is to develop an open source blogging platform that is absolutely free.

## How is LekhTantra Free of Cost
LekhTantra is designed to run on Firebase (GCP). I have consciously chosen technology components that offer a Free Tier.

LekhTantra uses : 
- Firebase Hosting 
- Firebase Functions
- FireStore
- FireStorage

All the above components have a free usage limit which is good enough to host a medium sized blog for a decent number of users. 

My vision is that every user should be able to deploy the LekhTantra platform in their own Google Account.


## Testing Locally
You can test locally before deploying. 

**Prerequisites**:
- Install Firebase CLI
- Create a Firebase Account
- Create a Firebase Project.
- Go to the Firebase Database and select your preferred location for DB
- Go to Autentication and enable email / password based authentication
- Enable Blaze Plan --- this is required as functions can be deployed only on this plan. Don't worry you wont be charged.

**Run local**

Run locally with command: `firebase emulators:start`

**Blog Setup**

Open page: http://localhost:5000 to setup your blog.

## Deploy to your account
Login in your firebase account with command: `firebase login:ci`

Deploy with command: `firebase deploy --only hosting,functions`

### Setup you Blog
After successful deployment, your blog will be available at: 
- https://{{your-project-id}}-firebase.web.app
- https://{{your-project-id}}-firebase.firebaseapp.com

Start your blog and complete the setup.
