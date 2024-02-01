require('express-async-errors')
const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const requestLogger = (req, res, next) => {
	logger.info('Method:', req.method)
	logger.info('Path:', req.path)
	logger.info('Body:', req.body)
	logger.info('---')
	next()
}

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
	logger.error(error.message)
	if (error.name === 'CastError'){
		return res.status(400).json({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError'){
		return res.status(400).json({ error: error.message })
	} else if (error.name === 'JsonWebTokenError'){
		return res.status(401).json({ error: error.message })
	} else if (error.name === 'TokenExpiredError'){
		return res.status(401).json({ error: 'token expired' })
	}
	next(error)
}

const tokenExtractor = (request, response, next) => {
	const authorization = request.get('authorization')
	if (authorization && authorization.startsWith('bearer ')){
		request.token = authorization.replace('bearer ', '')
	}
	next()
}

const userExtractor = async (request, response, next) => {
	if (request.token){
		const decodedToken = jwt.verify(request.token, process.env.SECRET)

		if (!decodedToken.id){
			return response.status(401).send({
				error: 'invalid token'
			})
		}

		const user = await User.findById(decodedToken.id)
		request.user = user === undefined ? null : user
	}
	next()
}

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	tokenExtractor,
	userExtractor
}