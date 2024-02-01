require('express-async-errors')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

describe('when there initially one user in db', () => {
	beforeEach(async () => {
		await helper.resetUsersToOneUserAndGetId()
	})

	describe('creation of a user', () => {
		test('creation succeeds with a fresh username', async () => {
			const usersAtStart = await helper.usersInDb()

			const newUser = {
				username: 'someone',
				name: 'David',
				password: 'securePass123'
			}

			await api
				.post('/api/users')
				.send(newUser)
				.expect(201)
				.expect('Content-Type', /application\/json/)

			const usersAtEnd = await helper.usersInDb()
			expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
			const usernames = usersAtEnd.map(x => x.username)
			expect(usernames).toContain(newUser.username)
		})
		test('creation of user fails with 400 status code and proper message if username is not given', async () => {
			const usersAtStart = await helper.usersInDb()

			const invalidUser = {
				password: '1234567890',
				name: 'Invalid'
			}

			const response = await api
				.post('/api/users')
				.send(invalidUser)
				.expect(400)
				.expect('Content-Type', /application\/json/)

			expect(response.body.error).toContain('username is required')
			const usersAtEnd = await helper.usersInDb()
			expect(usersAtEnd).toEqual(usersAtStart)
		})
		test('creation of user fails with 400 status code and proper message if password is not given', async () => {
			const usersAtStart = await helper.usersInDb()

			const invalidUser = {
				username: 'username123',
				name: 'Invalid'
			}

			const response = await api
				.post('/api/users')
				.send(invalidUser)
				.expect(400)
				.expect('Content-Type', /application\/json/)

			expect(response.body.error).toContain('password is required')
			const usersAtEnd = await helper.usersInDb()
			expect(usersAtEnd).toEqual(usersAtStart)
		})
		test('creation of user fails with 400 status code and proper message if username is less than 3 characters long', async () => {
			const usersAtStart = await helper.usersInDb()

			const invalidUser = {
				username: '12',
				password: '123456',
				name: 'Invalid'
			}

			const response = await api
				.post('/api/users')
				.send(invalidUser)
				.expect(400)
				.expect('Content-Type', /application\/json/)

			expect(response.body.error).toContain('username must be at least 3 characters long')
			const usersAtEnd = await helper.usersInDb()
			expect(usersAtEnd).toEqual(usersAtStart)
		})
		test('creation of user fails with 400 status code and proper message if password is less than 3 characters long', async () => {
			const usersAtStart = await helper.usersInDb()

			const invalidUser = {
				username: 'username123',
				password: '12',
				name: 'Invalid'
			}

			const response = await api
				.post('/api/users')
				.send(invalidUser)
				.expect(400)
				.expect('Content-Type', /application\/json/)

			expect(response.body.error).toContain('password must be at least 3 characters long')
			const usersAtEnd = await helper.usersInDb()
			expect(usersAtEnd).toEqual(usersAtStart)
		})
		test('creation of user fails if the username is already taken', async () => {
			const usersAtStart = await helper.usersInDb()

			const invalidUser = {
				username: usersAtStart[0].username,
				name: 'Invalid',
				password: '123567'
			}

			const result = await api
				.post('/api/users')
				.send(invalidUser)
				.expect(400)
				.expect('Content-Type', /application\/json/)

			expect(result.body.error).toContain('username is already taken')
			const usersAtEnd = await helper.usersInDb()
			expect(usersAtEnd).toEqual(usersAtStart)
		})
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})