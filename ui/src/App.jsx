import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import './index.css'
import blogService from './services/blogs'
import loginService from './services/login'

const Notification = ({ message }) => {
	if (message.error) {
		return <div className='error'>{message.message}</div>
	}
	return <div className='notification'>{message.message}</div>
}

const App = () => {
	const [message, setMessage] = useState(null)
	const [blogs, setBlogs] = useState([])
	const [user, setUser] = useState(null)
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	useEffect(() => {
		blogService.getAll().then(blogs =>
			setBlogs(blogs.sort(compareBlogs))
		)
	}, [])

	useEffect(() => {
		const loggedUser = window.localStorage.getItem('loggedBlogappUser')
		if (loggedUser) {
			const parseLoggedUser = JSON.parse(loggedUser)
			setUser(parseLoggedUser)
			blogService.setToken(parseLoggedUser.token)
		}
	}, [])

	const compareBlogs = (b1, b2) => b2.likes - b1.likes

	const setErrorMessage = (msg, disappearIn = 0) => {
		setMessage({
			message: msg,
			error: true
		})
		if (disappearIn > 0) {
			setTimeout(() => {
				setMessage(null)
			}, disappearIn)
		}
	}

	const setSuccessMessage = (msg, disappearIn = 0) => {
		setMessage({
			message: msg,
			error: false
		})
		if (disappearIn > 0) {
			setTimeout(() => {
				setMessage(null)
			}, disappearIn)
		}
	}

	const handleLogin = async (event) => {
		event.preventDefault()
		console.log('logging ... ')
		try {
			const user = await loginService.login({
				username,
				password
			})
			window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
			blogService.setToken(user.token)
			setUser(user)
			setUsername('')
			setPassword('')
			setSuccessMessage(`Log in ${user.name}`, 5000)
		} catch (exception) {
			setErrorMessage(exception.response.data.error, 5000)
		}
	}

	const loginForm = () => (
		<div>
			<h2>Log in to application</h2>
			<form onSubmit={handleLogin}>
				<label>
					Username:{' '}
					<input type='text'
						id='username'
						value={username}
						onChange={({ target }) => setUsername(target.value)}
						name='username' />
				</label><br />
				<label>
					Password:{' '}
					<input type='password'
						id='password'
						value={password}
						onChange={({ target }) => setPassword(target.value)}
						name='password' />
				</label><br />
				<button type='submit'>Login</button>
			</form>
		</div>
	)

	const logOut = () => {
		window.localStorage.clear()
		setUser(null)
		blogService.setToken('')
	}

	const createBlog = async ({ title, url, author }) => {
		try {
			const response = await blogService.create({
				title,
				url,
				author
			})
			setBlogs(blogs.concat(response).sort(compareBlogs))
			setSuccessMessage(`a new blog ${response.title} by ${response.author} added`, 5000)
			return true
		} catch (exception) {
			setErrorMessage(exception.response.data.error, 5000)
			return false
		}
	}

	const likeBlog = async (blog) => {
		const updatedBlog = {
			title: blog.title,
			url: blog.url,
			author: blog.author,
			likes: blog.likes + 1,
			user: blog.user.id
		}
		const response = await blogService.update(blog.id, updatedBlog)
		setBlogs(blogs.map(b => (b.id === blog.id) ? response : b).sort(compareBlogs))
	}

	const deleteBlog = async blog => {
		if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
			await blogService.deleteBlog(blog.id)
			setBlogs(blogs.filter(b => b.id !== blog.id))
		}
	}

	return (
		<>
			{message !== null && <Notification message={message} />}
			{user === null && loginForm()}
			{user !== null && <>
				<h2>blogs</h2>
				<p>{user.name} logged in</p>
				<button onClick={logOut}>Log out</button>
				<BlogForm createBlog={createBlog} />
				{blogs.map(blog =>
					<Blog key={blog.id}
						blog={blog}
						likeBlog={likeBlog}
						canDelete={user.username === blog.user.username}
						deleteBlog={deleteBlog} />
				)}
			</>}
		</>
	)
}

export default App