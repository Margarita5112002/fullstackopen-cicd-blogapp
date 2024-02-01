import axios from 'axios'
const baseUrl = '/api/blogs'

let token = null

const setToken = newToken => {
	token = `bearer ${newToken}`
}

const getAll = () => {
	const request = axios.get(baseUrl)
	return request.then(response => response.data)
}

const create = async newBlog => {
	const config = {
		headers: { Authorization: token },
	}
	const response = await axios.post(baseUrl, newBlog, config)
	return response.data
}

const update = async (blogId, updatedBlog) => {
	try {
		const response = await axios.put(`${baseUrl}/${blogId}`, updatedBlog)
		return response.data
	} catch (exception){
		console.log(exception)
	}
}

const deleteBlog = async (blogId) => {
	const config = {
		headers: { Authorization: token },
	}
	await axios.delete(`${baseUrl}/${blogId}`, config)
}

export default { getAll, create, setToken, update, deleteBlog }