"use strict"; 

const mongoose = require('mongoose'); 
const express = require('express'); 

// const DATABASE_URL = 'mongodb://localhost/blog-app';
// const PORT = process.env.PORT || 8080;

const { PORT, DATABASE_URL } = require('./config.js')
const { BlogPost, Author } = require("./models")


mongoose.Promise = global.Promise;


const app = express();
app.use(express.json());



app.get("/blog-post", (req,res) => {
	BlogPost.find()
		.limit(10)
		.then(posts => {
			res.json({
				posts: posts.map(post => post.serialize())
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({message: "Internal Server Error"});
		})
});

app.get("/blog-post/:id", (req, res) => {
	BlogPost.findById(req.params.id)
	.then(post => {
		res.json(post.serialize())
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal Server Error"})
		})
	})
});

app.post("/blog-post", (req, res) => {
	const requiredFields = ["title", "content", "author_id"];
	for(let i=0; i < requiredFields.length; i++){
		const field = requiredFields[i];
		if (!(field in req.body)){
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message); 
		}
	}
	Author.findById(req.body.author_id)
		.then(author => {
				console.log(author)
		})
		.catch(err => {
			console.error(err);
		const message = `Author with id ${req.body.author_id} does not exist`
			return res.status(400).send(message);
		})
		;
		

	BlogPost.create({
		title: req.body.title,
		content: req.body.content,
		author: req.body.author_id
	})
		.then(post => res.status(201).json(post.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: "Internal server error"});
		});
});

app.put("/blog-post/:id", (req, res) => {
	if (!(req.params.id && req.body.id === req.body.id)) {
		const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`
		console.error(message);
		return res.status(400).json({message: message});
	}

	const toUpdate = {};
	const updateableFields = ["title", "content"];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	BlogPost
		.findByIdAndUpdate(req.params.id, {$set: toUpdate })
		.then(post => res.status(204).end())
		.catch(err => res.status(500).json({message: "Internal Server Error"}));
});

app.delete("/blog-post/:id", (req, res) => {
	BlogPost.findByIdAndRemove(req.params.id)
		.then(posts => res.json({message: "Item Deleted"}).status(204).end())
		.catch(err => res.status(500).json({message: "Internal Server Error"}));
});



// Authors Endpoints 


app.post('/authors', (req, res) => {
	const requiredFields = ["firstName", "lastName", "userName"]
	for(let i=0; i < requiredFields.length; i++){
		let field = requiredFields[i]
		if (!(field in req.body)) {
			const message = `Missing ${field} in req.body`;
			console.error(message);
			return res.status(400).send(message); 
		}
	}

	Author.create({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		userName: req.body.userName
	})
	.then(author => res.status(201).json(author.serialize()))
});


app.put('/authors/:id', (req, res) => {
	if (!(req.params.id && req.body.id === req.body.id)) {
		const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`
		console.error(message);
		return res.status(400).json({message: message});
	}

	const toUpdate = {};
	const updateableFields = ["firstName", "lastName", "userName"];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Author
		.findByIdAndUpdate(req.params.id, {$set: toUpdate })
		.then(author => res.status(204).json(author))
});

app.delete('/authors/:id', (req, res) => {
	let authorId = req.params.id;
	Author.findByIdAndRemove(authorId)
	.then(author => res.status(204).end())
	.catch(err => res.status(500).json({message: "Internal Server Error"})) 

	BlogPost.findByIdAndRemove(authorId)
	.then(posts => res.status(204).end())
	.catch(err => res.status(500).json({message: "Internal Server Error"}))
});



// runnning Server

let server; 


function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      { useNewUrlParser: true },
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };