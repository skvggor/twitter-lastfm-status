const request = require('request')

module.exports = (callback) => {
	const apiUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=marcker_&format=json&api_key='
	const apiKey = process.env.LASTFM_API_KEY

	request(`${apiUrl}${apiKey}`, (error, resp, body) => callback(body))
}