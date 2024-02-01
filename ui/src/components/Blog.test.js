import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
	test('only render title and author but no url or likes', () => {
		const blog = {
			title: 'Testing blog',
			author: 'David',
			url: 'www.abc.com',
			likes: 40,
			user: {
				name: 'Magi',
				username: 'user123',
				id: '1234'
			}
		}

		const dummyLikeBlog = jest.fn()
		const dummyDeleteBlog = jest.fn()

		const container = render(
			<Blog blog={blog}
				canDelete={false}
				deleteBlog={dummyDeleteBlog}
				likeBlog={dummyLikeBlog} />).container

		const authorElement = screen.getByText(blog.author, { exact: false })
		const titleElement = screen.getByText(blog.title, { exact: false })
		const fullDetailsDiv = container.querySelector('.fullDetails')
		expect(fullDetailsDiv).toHaveStyle('display: none')
	})
	test('show url and likes if view button has been clicked', async () => {
		const blog = {
			title: 'Testing blog',
			author: 'David',
			url: 'www.abc.com',
			likes: 40,
			user: {
				name: 'Magi',
				username: 'user123',
				id: '1234'
			}
		}

		const dummyLikeBlog = jest.fn()
		const dummyDeleteBlog = jest.fn()

		const container = render(
			<Blog blog={blog}
				canDelete={false}
				deleteBlog={dummyDeleteBlog}
				likeBlog={dummyLikeBlog} />).container

		const user = userEvent.setup()
		const button = screen.getByText('View')
		await user.click(button)

		const authorElement = screen.getByText(blog.author, { exact: false })
		const titleElement = screen.getByText(blog.title, { exact: false })
		const urlElement = screen.getByText(blog.url, { exact: false })
		const likesElement = screen.getByText(blog.likes, { exact: false })
	})
	test('call likeBlog twice if user clicks like button twice', async () => {
		const blog = {
			title: 'Testing blog',
			author: 'David',
			url: 'www.abc.com',
			likes: 40,
			user: {
				name: 'Magi',
				username: 'user123',
				id: '1234'
			}
		}

		const mockLikeBlog = jest.fn()
		const dummyDeleteBlog = jest.fn()

		render(
			<Blog blog={blog}
				canDelete={false}
				deleteBlog={dummyDeleteBlog}
				likeBlog={mockLikeBlog} />).container

		const user = userEvent.setup()
		const viewButton = screen.getByText('View')
		await user.click(viewButton)
		const likeButton = screen.getByText('Like')
		await user.click(likeButton)
		await user.click(likeButton)

		expect(mockLikeBlog.mock.calls).toHaveLength(2)
	})
})