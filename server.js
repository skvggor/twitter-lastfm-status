const express = require('express')
const request = require('request')
const { pipe, of } = require('rxjs')
const { map, concatMap, filter, tap } = require('rxjs/operators')

const site = express()
const port = process.env.PORT || 8080
const apiKey = process.env.LASTFM_API_KEY

site.use(express.static('public'))
site.set('view engine', 'ejs')

const trackData = {}

request(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=marcker_&api_key=${apiKey}&format=json`, (error, resp, body) => {
	of(JSON.parse(body))
		.pipe(
			map(json => json['recenttracks']['track']),
			concatMap(json => json),
			filter(json => json['@attr']),
			tap(json => {
				trackData.artist = json.artist['#text']
				trackData.track = json.name
				trackData.album = json.album['#text']
			}),
			map(json => json.image),
			concatMap(json => json),
			filter(json => json.size === 'extralarge')
		)
		.subscribe(json => {
			trackData.imageUrl = json['#text']
		})
})

site.get('/', (req, res) => {
	res.render('pages/index', {
		data: trackData
	})
})

site.listen(port)