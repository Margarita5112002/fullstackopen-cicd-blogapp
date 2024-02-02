Cypress.Commands.add('createNewUser', ({ username, name, password }) => {
	cy.request('POST', `${Cypress.env('BACKEND')}/users`, {
		username,
		name,
		password
	})
})

Cypress.Commands.add('login', ({ username, password }) => {
	cy.request('POST', 'http://localhost:3003/api/login', {
		username, password
	}).then(({ body }) => {
		localStorage.setItem('loggedBlogappUser', JSON.stringify(body))
		cy.visit('http://localhost:5173')
	})
})

Cypress.Commands.add('createBlog', (blog) => {
	cy.request({
		url: 'http://localhost:3003/api/blogs',
		method: 'POST',
		body: blog,
		headers: {
			'Authorization': `bearer ${JSON.parse(localStorage.getItem('loggedBlogappUser')).token}`
		}
	}).then(b => {
		cy.visit('http://localhost:5173')
	})
})