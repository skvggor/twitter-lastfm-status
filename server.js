const express = require('express')
const moment = require('moment')
const { of, pipe } = require('rxjs')
const { map, concatMap, first, tap, filter } = require('rxjs/operators')

const getDataModule = require('./lastfm.service.js')

const site = express()
const port = process.env.PORT || 8080

site.use(express.static('assets'))
site.set('view engine', 'ejs')

const interval = 4000

const trackData = {
	artist: '',
	track: '',
	album: '',
	nowplaying: false,
	year: moment().format('Y'),
	imageUrl: ''
}

setInterval(() => {
	getDataModule((data) => {
		const json = JSON.parse(data)
		
		of(json).pipe(
			map(json => json['recenttracks']['track']),
			concatMap(json => json),
			first(),
			tap(json => {
				trackData.artist = json.artist['#text']
				trackData.track = json.name
				trackData.album = json.album['#text']
				trackData.nowplaying = '@attr' in json ? true : false
			}),
			map(json => json.image),
			concatMap(json => json),
			filter(json => json.size === 'extralarge')
		)
		.subscribe(json => trackData.imageUrl = json['#text'])
	})
}, interval)

site.get('/', (req, res) => {
	res.render('pages/index', {
		data: trackData
	})
})

site.listen(port)