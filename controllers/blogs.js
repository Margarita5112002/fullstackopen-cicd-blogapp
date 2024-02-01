require('express-async-errors')
const jwt = require('jsonwebtoken')
const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
		.populate('user', { username: 1, name: 1 })
	response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
	const body = request.body
	const user = request.user

	if (!user){
		return response.status(401).json({ error: 'not authorized' })
	}

	const newBlog = {
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes === undefined ? 0 : body.likes,
		user: user.id
	}

	const blog = new Blog(newBlog)
	await blog.save()
	const result = await blog.populate('user', { username: 1, name: 1 })
	user.blogs = user.blogs.concat(result._id)
	await user.save()
	response.status(201).json(result)
})

blogRouter.delete('/:id', async (request, response) => {
	const user = request.user
	const blog = await Blog.findById(request.params.id)

	if (!blog){
		return response.status(404).end()
	}

	if (!(user && blog.user.toString() === user.id.toString())){
		return response.status(401).send({
			error: 'not authorized to delete this blog'
		})
	}

	await Blog.findByIdAndDelete(request.params.id)
	return response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
	const blog = { ... request.body }
	const blogUpdated = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
	if (blogUpdated){
		const result = await blogUpdated.populate('user', { username: 1, name: 1 })
		return response.status(200).json(result)
	}
	response.status(404).end()
})

module.exports = blogRouter