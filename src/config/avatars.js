const avatars = [
	'https://robohash.org/hicveldicta.png',
	'https://robohash.org/doloremquesintcorrupti.png',
	'https://robohash.org/consequunturautconsequatur.png',
	'https://robohash.org/facilisdignissimosdolore.png',
	'https://robohash.org/adverovelit.png',
	'https://robohash.org/laboriosamfacilisrem.png',
	'https://robohash.org/cupiditatererumquos.png',
]

export const getRandomAvatar = () => {
	const randomIndex = Math.floor(Math.random() * avatars.length)
	return avatars[randomIndex]
}
