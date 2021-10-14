/* eslint-disable */
import '@fire-fly/jugnu';
import { DocumentField, DocumentKey, FirebaseCollection } from '@fire-fly/jugnu';

@FirebaseCollection('Users')
export class User {

    @DocumentKey
    userId: String;

    @DocumentField
    displayName: String = "";
    
    @DocumentField
    socialMedia?: {
        facebook?: String,
        github: String,
        twitter: String
    };

    constructor(uid: String | undefined){
        this.userId = uid? uid: "";
    }
}