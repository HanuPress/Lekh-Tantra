/* eslint-disable */
import '@fire-fly/jugnu';
import { DocumentField, DocumentKey, FirebaseCollection } from '@fire-fly/jugnu';
import { User } from './User';

@FirebaseCollection('BlogPosts')
export class BlogPost {

    @DocumentKey
    postId: String = "";

    @DocumentField
    title: String = "";
    
    @DocumentField
    content: String = "";
    
    @DocumentField
    postLink: String = "";
    
    @DocumentField
    status: String = "";
    
    @DocumentField
    type: String = "";
    
    @DocumentField
    meta: {
        publishedOn?: any,
        createdOn?: any,
        updatedOn?: any
    };
    
    @DocumentField
    user?: User;

    constructor(pid: String){
        this.postId = pid.toString();
        this.postLink = pid.toString();
        this.meta = {};
    }

    copyFromRequest(reqBody: any){
        
        this.title = reqBody.title;
        this.content = reqBody.content;
        this.type = reqBody.type? reqBody.type: "BlogPost";
        this.status = reqBody.status;
    }
}