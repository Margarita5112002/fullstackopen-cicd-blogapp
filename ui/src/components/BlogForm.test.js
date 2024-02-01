import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
	test('blog form send blog info to createBlog callback', async () => {
		const titleEntered = 'blog testing'
		const urlEntered = 'www.testing.com'
		const authorEntered = 'Fred'

		const user = userEvent.setup()
		const mockCreateBlog = jest.fn()

		render(<BlogForm createBlog={mockCreateBlog} />)

		const titleInput = screen.getByPlaceholderText('Enter the blog title')
		const authorInput = screen.getByPlaceholderText('Enter the blog author')
		const urlInput = screen.getByPlaceholderText('Enter the blog url')
		const createButton = screen.getByText('Create')

		await user.type(titleInput, titleEntered)
		await user.type(authorInput, authorEntered)
		await user.type(urlInput, urlEntered)

		await user.click(createButton)

		expect(mockCreateBlog.mock.calls).toHaveLength(1)
		expect(mockCreateBlog.mock.calls[0][0].title).toBe(titleEntered)
		expect(mockCreateBlog.mock.calls[0][0].author).toBe(authorEntered)
		expect(mockCreateBlog.mock.calls[0][0].url).toBe(urlEntered)
	})
})