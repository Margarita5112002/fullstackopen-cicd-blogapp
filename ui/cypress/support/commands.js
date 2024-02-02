Cypress.Commands.add('createNewUser', ({ username, name, password }) => {
	cy.request('POST', `${Cypress.env('BACKEND')}/users`, {
		username,
		name,
		password
	})
})

Cypress.Commands.add('login', ({ username, password }) => {
	cy.request('POST', `${Cypress.env('BACKEND')}/login`, {
		username, password
	}).then(({ body }) => {
		localStorage.setItem('loggedBlogappUser', JSON.stringify(body))
		cy.visit('')
	})
})

Cypress.Commands.add('createBlog', (blog) => {
	cy.request({
		url: `${Cypress.env('BACKEND')}/blogs`,
		method: 'POST',
		body: blog,
		headers: {
			'Authorization': `bearer ${JSON.parse(localStorage.getItem('loggedBlogappUser')).token}`
		}
	}).then(b => {
		cy.visit('')
	})
})