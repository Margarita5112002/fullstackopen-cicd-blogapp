const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
	{
		title: 'Type wars',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
		likes: 2
	},
	{
		title: 'Canonical string reduction',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
		likes: 12
	}
]

const initialUser = {
	username: 'root',
	name: 'admin',
	password: 'secure'
}

const blogsInDb = async () => {
	const blogs = await Blog.find({})
	return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
	const users = await User.find({})
	return users.map(m => m.toJSON())
}

const resetUsersToOneUserAndGetId = async () => {
	await User.deleteMany({})
	const passwordHash = await bcrypt.hash(initialUser.password, 10)
	const user = new User({
		username: initialUser.username,
		name: initialUser.name,
		passwordHash
	})
	const savedUser = await user.save()
	return savedUser._id.toString()
}

const getTokenForFirstUserInDb = async () => {
	const users = await User.find({})
	const user = users[0]

	const userForToken = {
		username: user.username,
		id: user._id
	}

	const token = jwt.sign(userForToken, process.env.SECRET)

	return token
}

const nonExistingId = async () => {
	const blog = new Blog({
		title: 'delete soon',
		author: 'n',
		url: 'www.a.com',
		likes: 20
	})
	await blog.save()
	await blog.deleteOne()
	return blog._id.toString()
}

module.exports = {
	blogsInDb,
	usersInDb,
	initialBlogs,
	initialUser,
	resetUsersToOneUserAndGetId,
	nonExistingId,
	getTokenForFirstUserInDb
}