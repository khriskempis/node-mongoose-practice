"use strict"; 

const mongoose = require('mongoose'); 
const Schema = mongoose.Schema; 


const authorSchema = Schema({
	firstName: 'string',
	lastName: 'string', 
	userName: {
		type: 'string', 
		unique: true
	}
})


const commentSchema = Schema({ content: 'string' })

const blogPostSchema = Schema({
	title: { type: String, required: true },
	author: { type: Schema.Types.ObjectId, ref: "Author" },
	content: { type: String, required: true },
	comments: [commentSchema]
});

blogPostSchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
		author: this.authorName,
		content: this.content,
		comments: this.comments
	}
}

blogPostSchema.virtual('authorName').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim(); 
});

blogPostSchema.pre('find', function(next) {
	this.populate('author');
	next();
});

blogPostSchema.pre('findOne', function(next) {
	this.populate('author');
	next(); 
});

blogPostSchema.pre('create', function(next) {
	this.populate('author');
	next(); 
});



authorSchema.methods.serialize = function() {
	return {
		id: this._id,
		name: this.authorName,
		username: this.username
	}
};

authorSchema.virtual('authorName').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim();
});

const Author = mongoose.model('Author', authorSchema);
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = { BlogPost, Author }
