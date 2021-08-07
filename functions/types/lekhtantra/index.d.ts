export as namespace LekhTantra;

export interface BlogPost {
    title: String,
    content: String,
    postLink: String,
    status: String,
    type: String,
    meta: {
        publishedOn?: Date,
        createdOn: Date,
        updatedOn: Date
    },
    user: any
}