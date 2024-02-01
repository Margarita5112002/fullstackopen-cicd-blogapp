import PropTypes from 'prop-types'
import { useState } from 'react'
import '../index.css'

const Blog = ({ blog, likeBlog, canDelete, deleteBlog }) => {
	const [visible, setVisible] = useState(false)

	const showWhenVisible = { display: visible ? '' : 'none' }

	const toggleVisibility = () => {
		setVisible(!visible)
	}

	const onLike = async () => {
		await likeBlog(blog)
	}

	const onDelete = async () => {
		await deleteBlog(blog)
	}

	return (
		<div className="blog">
			{blog.title} {blog.author}
			<button onClick={toggleVisibility}>{visible?'Hide':'View'}</button>
			<div className="fullDetails" style={showWhenVisible}>
				<p>url: {blog.url}</p>
				<p>likes: {blog.likes}<button onClick={onLike}>Like</button></p>
				<p>added by: {blog.user.name}</p>
				{canDelete && <button onClick={onDelete}>Delete</button>}
			</div>
		</div>
	)
}

Blog.propTypes = {
	blog: PropTypes.object.isRequired,
	likeBlog: PropTypes.func.isRequired,
	canDelete: PropTypes.bool.isRequired,
	deleteBlog: PropTypes.func.isRequired
}

export default Blog