"use strict"; 

const mongoose = require('mongoose'); 

const blogPostSchema = mongoose.Schema({
	title: { type: String, required: true },
	author: { type: String, required: true },
	content: { type: String, required: true }
});

blogPostSchema.methods.serialize = function() {
	return {
		id: this._id,
		title: this.title,
		author: this.author,
		content: this.content
	}
}

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = { BlogPost }