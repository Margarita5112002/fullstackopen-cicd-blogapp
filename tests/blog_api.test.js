require('express-async-errors')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')

describe('when there is initially some blogs saved', () => {
	beforeEach(async () => {
		const userId = await helper.resetUsersToOneUserAndGetId()
		await Blog.deleteMany({})
		for(let blog of helper.initialBlogs){
			blog.user = userId
			let blogObject = new Blog(blog)
			await blogObject.save()
		}
	})

	test('blogs are returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)
	})

	test('all blogs are returned', async () => {
		const response = await api.get('/api/blogs')
		expect(response.body).toHaveLength(helper.initialBlogs.length)
	})

	test('blog posts have id property', async () => {
		const response = await api.get('/api/blogs')
		expect(response.body[0].id).toBeDefined()
	})

	describe('addition of a new blog', () => {
		test('a valid blog post can be added', async () => {
			const token = await helper.getTokenForFirstUserInDb()

			const newBlog = {
				title: 'Example of blog',
				author: 'Tom',
				url: 'http://www.blog1.com',
				likes: 30
			}

			await api
				.post('/api/blogs')
				.send(newBlog)
				.set('Authorization', `bearer ${token}`)
				.expect(201)
				.expect('Content-Type', /application\/json/)

			const response = await api.get('/api/blogs')

			const titles = response.body.map(r => r.title)
			const authors = response.body.map(r => r.author)
			const urls = response.body.map(r => r.url)
			const likes = response.body.map(r => r.likes)

			expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
			expect(titles).toContain(newBlog['title'])
			expect(authors).toContain(newBlog['author'])
			expect(urls).toContain(newBlog['url'])
			expect(likes).toContain(newBlog['likes'])
		})

		test('if the likes property is missing in POST request, it will be 0', async () => {
			const token = await helper.getTokenForFirstUserInDb()

			const newBlog = {
				title: 'Example of blog',
				author: 'Tom',
				url: 'http://www.blog1.com'
			}

			const response = await api
				.post('/api/blogs')
				.send(newBlog)
				.set('Authorization', `bearer ${token}`)

			expect(response.body.likes).toBeDefined()
			expect(response.body.likes).toBe(0)
		})

		test('if title is missing in POST request, send status code 400', async () => {
			const token = await helper.getTokenForFirstUserInDb()

			const newBlog = {
				author: 'Tom',
				likes: 30,
				url: 'http://www.blog1.com'
			}

			await api
				.post('/api/blogs')
				.send(newBlog)
				.set('Authorization', `bearer ${token}`)
				.expect(400)
		})

		test('if url is missing in POST request, send status code 400', async () => {
			const token = await helper.getTokenForFirstUserInDb()

			const newBlog = {
				title: 'Example of blog',
				author: 'Tom',
				likes: 0
			}

			await api
				.post('/api/blogs')
				.send(newBlog)
				.set('Authorization', `bearer ${token}`)
				.expect(400)
		})
		test('if authorization token is not provided, send statuscode 401', async () => {
			const newBlog = {
				title: 'Example of blog',
				author: 'Tom',
				url: 'www.a.com',
				likes: 0
			}
			await api
				.post('/api/blogs')
				.send(newBlog)
				.expect(401)
				.expect('Content-Type', /application\/json/)
		})
	})
	describe('deletion of a blog', () => {
		test('a blog can be deleted sucessfully', async () => {
			const token = await helper.getTokenForFirstUserInDb()
			const blogsAtStart = await helper.blogsInDb()
			const blogToDelete = blogsAtStart[0]
			await api
				.delete(`/api/blogs/${blogToDelete.id}`)
				.set('Authorization', `bearer ${token}`)
				.expect(204)
			const blogsAfter = await helper.blogsInDb()
			expect(blogsAfter).toHaveLength(blogsAtStart.length - 1)
			const allIds = blogsAfter.map(b => b.id)
			expect(allIds).not.toContain(blogToDelete.id)
		})

		test('send 404 status code, if blog id does not exist', async () => {
			const token = await helper.getTokenForFirstUserInDb()
			const noExist = await helper.nonExistingId()
			await api
				.delete(`/api/blogs/${noExist}`)
				.set('Authorization', `bearer ${token}`)
				.expect(404)
		})

		test('deletion fails and send status 401 if authorization token is not provided', async () => {
			const blogsAtStart = await helper.blogsInDb()
			const blogToDeleteId = blogsAtStart[0].id
			await api
				.delete(`/api/blogs/${blogToDeleteId}`)
				.expect(401)
				.expect('Content-Type', /application\/json/)

			const blogsAfter = await helper.blogsInDb()
			expect(blogsAfter).toEqual(blogsAtStart)
		})
	})
	describe('update a blog', () => {
		test('a blog can be updated sucessfully', async () => {
			const blogsAtStart = await helper.blogsInDb()
			const blogToUpdate = blogsAtStart[0]
			const blogUpdated = {
				title: 'Update title',
				author: 'Tom',
				url: 'http://www.update-blog.com',
				likes: 100
			}
			const response = await api
				.put(`/api/blogs/${blogToUpdate.id}`)
				.send(blogUpdated)
				.expect(200)
			expect(response.body.title).toBe(blogUpdated.title)
			expect(response.body.author).toBe(blogUpdated.author)
			expect(response.body.url).toBe(blogUpdated.url)
			expect(response.body.likes).toBe(blogUpdated.likes)
			const updatedBlogInDb = await Blog.findById(blogToUpdate.id)
			expect(updatedBlogInDb.title).toBe(blogUpdated.title)
			expect(updatedBlogInDb.author).toBe(blogUpdated.author)
			expect(updatedBlogInDb.url).toBe(blogUpdated.url)
			expect(updatedBlogInDb.likes).toBe(blogUpdated.likes)
		})
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})