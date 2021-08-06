declare namespace Express {
    interface Request {
        user?: {
            name: String
            picture: String
            email: String
            email_verified: String
            auth_time: String
            user_id: String
            firebase: {
                identities: any
                sign_in_provider: String
            }
            iat: String
            exp: String
            aud: String
            iss: String
            sub: String
            uid: String
        }
    }
}