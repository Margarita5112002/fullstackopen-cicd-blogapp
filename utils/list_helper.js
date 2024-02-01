const _ = require('lodash')
const dummy = (blogs) => 1

const totalLikes = (blogs) =>
	blogs.reduce((acc, b) => {
		return acc + b.likes
	}, 0)

const favoriteBlog = (blogs) => {
	const fav = blogs.reduce((acc, b) => {
		if (!acc || acc.likes < b.likes) return b
		return acc
	}, null)
	if (fav){
		return {
			title: fav.title,
			author: fav.author,
			likes: fav.likes
		}
	}
	return null
}

const mostBlogs = (blogs) => {
	const authors = _.groupBy(blogs, b => b.author)
	const most = Object.entries(authors).reduce((acc, b) => {
		if (acc) {
			return b[1].length > acc[1].length ? b : acc
		}
		return b
	}, null)
	return most ? {
		author: most[0],
		blogs: most[1].length
	} : null
}

const mostLikes = (blogs) => {
	const authorsLikes = {}
	const most = blogs.reduce((acc, b) => {
		if (acc){
			if (authorsLikes[b.author]){
				authorsLikes[b.author] += b.likes
			} else {
				authorsLikes[b.author] = b.likes
			}
			return authorsLikes[b.author] > authorsLikes[acc] ? b.author : acc
		}
		authorsLikes[b.author] = b.likes
		return b.author
	}, null)
	return most ? {
		author: most,
		likes: authorsLikes[most]
	} : null
}

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes
}