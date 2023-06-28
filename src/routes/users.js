import express from 'express'
import passport from 'passport'
import {
	getUsers,
	getUser,
	updateUser,
	addUser,
	deleteUser,
} from '../controllers/users.js'
import { addPost, getPostsByIdUser } from '../controllers/posts.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', passport.authenticate('jwt', { session: false }), updateUser)
router.post('/', passport.authenticate('jwt', { session: false }), addUser)
router.delete(
	'/:id',
	passport.authenticate('jwt', { session: false }),
	deleteUser
)

router.get('/:id/posts', getPostsByIdUser)
router.post(
	'/:id/posts',
	passport.authenticate('jwt', { session: false }),
	addPost
)

export default router

//     "comments": [
//         {
//             "id": 1,
//             "body": "This is some awesome thinking!",
//             "postId": 100,
//             "user": {
//                 "id": 63,
//                 "username": "eburras1q"
//             }
//         },
//         {
//             "id": 2,
//             "body": "What terrific math skills you’re showing!",
//             "postId": 27,
//             "user": {
//                 "id": 71,
//                 "username": "omarsland1y"
//             }
//         },
//         {
//             "id": 3,
//             "body": "You are an amazing writer!",
//             "postId": 61,
//             "user": {
//                 "id": 29,
//                 "username": "jissetts"
//             }
//         },
//         {
//             "id": 4,
//             "body": "Wow! You have improved so much!",
//             "postId": 8,
//             "user": {
//                 "id": 19,
//                 "username": "bleveragei"
//             }
//         },
//         {
//             "id": 5,
//             "body": "Nice idea!",
//             "postId": 62,
//             "user": {
//                 "id": 70,
//                 "username": "cmasurel1x"
//             }
//         },
//         {
//             "id": 6,
//             "body": "You are showing excellent understanding!",
//             "postId": 19,
//             "user": {
//                 "id": 97,
//                 "username": "cdavydochkin2o"
//             }
//         },
//         {
//             "id": 7,
//             "body": "This is clear, concise, and complete!",
//             "postId": 47,
//             "user": {
//                 "id": 22,
//                 "username": "froachel"
//             }
//         },
//         {
//             "id": 8,
//             "body": "What a powerful argument!",
//             "postId": 47,
//             "user": {
//                 "id": 82,
//                 "username": "kogilvy29"
//             }
//         },
//         {
//             "id": 9,
//             "body": "I knew you could do it!",
//             "postId": 64,
//             "user": {
//                 "id": 31,
//                 "username": "smargiottau"
//             }
//         },
//         {
//             "id": 10,
//             "body": "Wonderful ideas!",
//             "postId": 4,
//             "user": {
//                 "id": 35,
//                 "username": "mbrooksbanky"
//             }
//         },
//         {
//             "id": 11,
//             "body": "It was a pleasure to grade this!",
//             "postId": 2,
//             "user": {
//                 "id": 68,
//                 "username": "rstrettle1v"
//             }
//         },
//         {
//             "id": 12,
//             "body": "Keep up the incredible work!",
//             "postId": 50,
//             "user": {
//                 "id": 77,
//                 "username": "rkingswood24"
//             }
//         },
//         {
//             "id": 13,
//             "body": "My goodness, how impressive!",
//             "postId": 37,
//             "user": {
//                 "id": 28,
//                 "username": "xisherwoodr"
//             }
//         },
//         {
//             "id": 14,
//             "body": "You’re showing inventive ideas!",
//             "postId": 30,
//             "user": {
//                 "id": 57,
//                 "username": "bpickering1k"
//             }
//         },
//         {
//             "id": 15,
//             "body": "You’ve shown so much growth!",
//             "postId": 44,
//             "user": {
//                 "id": 76,
//                 "username": "cgaber23"
//             }
//         },
//         {
//             "id": 16,
//             "body": "Interesting thoughts!",
//             "postId": 71,
//             "user": {
//                 "id": 100,
//                 "username": "pcumbes2r"
//             }
//         },
//         {
//             "id": 17,
//             "body": "I love your neat work!",
//             "postId": 68,
//             "user": {
//                 "id": 37,
//                 "username": "nwytchard10"
//             }
//         },
//         {
//             "id": 18,
//             "body": "Doesn’t it feel good to do such great work?",
//             "postId": 41,
//             "user": {
//                 "id": 31,
//                 "username": "smargiottau"
//             }
//         },
//         {
//             "id": 19,
//             "body": "First-rate work!",
//             "postId": 75,
//             "user": {
//                 "id": 60,
//                 "username": "dlambarth1n"
//             }
//         },
//         {
//             "id": 20,
//             "body": "This is fascinating information!",
//             "postId": 48,
//             "user": {
//                 "id": 17,
//                 "username": "vcholdcroftg"
//             }
//         },
//         {
//             "id": 21,
//             "body": "You inspire me!",
//             "postId": 29,
//             "user": {
//                 "id": 5,
//                 "username": "kmeus4"
//             }
//         },
//         {
//             "id": 22,
//             "body": "This is right on target!",
//             "postId": 18,
//             "user": {
//                 "id": 31,
//                 "username": "smargiottau"
//             }
//         },
//         {
//             "id": 23,
//             "body": "What an astounding observation!",
//             "postId": 73,
//             "user": {
//                 "id": 14,
//                 "username": "mturleyd"
//             }
//         },
//         {
//             "id": 24,
//             "body": "This is very well thought out!",
//             "postId": 32,
//             "user": {
//                 "id": 16,
//                 "username": "dpierrof"
//             }
//         },
//         {
//             "id": 25,
//             "body": "I can tell you’ve been practicing!",
//             "postId": 44,
//             "user": {
//                 "id": 78,
//                 "username": "dbuist25"
//             }
//         },
//         {
//             "id": 26,
//             "body": "You’ve come a long way!",
//             "postId": 70,
//             "user": {
//                 "id": 82,
//                 "username": "kogilvy29"
//             }
//         },
//         {
//             "id": 27,
//             "body": "I can tell you’ve been paying attention!",
//             "postId": 60,
//             "user": {
//                 "id": 74,
//                 "username": "ahinckes21"
//             }
//         },
//         {
//             "id": 28,
//             "body": "Reading this made my day!",
//             "postId": 85,
//             "user": {
//                 "id": 85,
//                 "username": "kpondjones2c"
//             }
//         },
//         {
//             "id": 29,
//             "body": "This is very perceptive!",
//             "postId": 13,
//             "user": {
//                 "id": 30,
//                 "username": "kdulyt"
//             }
//         },
//         {
//             "id": 30,
//             "body": "What an accomplishment!",
//             "postId": 23,
//             "user": {
//                 "id": 36,
//                 "username": "dalmondz"
//             }
//         }
//     ]

// {
//     "result": [
//         // {"_id": "648edfa104490fd490173125",},
//         // {"_id": "648ee1dc04490fd490173126",},
//         // {"_id": "648ee1f504490fd490173127",},
//         // {"_id": "648ee20e04490fd490173128",},
//         // {"_id": "648ee91d04490fd49017312d",},
//         // {"_id": "648ee95c04490fd49017312e",},
//         // {"_id": "648ee90204490fd49017312c",},
//         // {"_id": "648ee8e904490fd49017312b",},
//         // {"_id": "648ee22c04490fd49017312a",},
//         // {"_id": "648ee21d04490fd490173129",},
//         // {"_id": "648ee96904490fd49017312f",},
//         // {"_id": "648ee97604490fd490173130",},
//         // {"_id": "648ee98204490fd490173131",},
//         // {"_id": "648ee98e04490fd490173132",},
//         // {"_id": "648ee99b04490fd490173133",},
//         // {"_id": "648ee9a704490fd490173134",},
//         // {"_id": "648ee9b204490fd490173135",},
//         // {"_id": "648ee9bf04490fd490173136",},
//         // {"_id": "648ee9cd04490fd490173137",},
//         // {"_id": "648ee9fd04490fd490173138",},
//         // {"_id": "648eea0904490fd490173139",},
//         // {"_id": "648eea1504490fd49017313a",},
//         // {"_id": "648eea2304490fd49017313b",},
//         // {"_id": "648eea2f04490fd49017313c",},
//         // {"_id": "648eea3a04490fd49017313d",},
//         // {"_id": "648eea4a04490fd49017313e",},
//         // {"_id": "648eea5904490fd49017313f",},
//         // {"_id": "648eea6604490fd490173140",},
//         // {"_id": "648eea7404490fd490173141",},
//         // {"_id": "648eea8004490fd490173142",},
//         // {"_id": "648eea8d04490fd490173143",},
//         // {"_id": "648eea9804490fd490173144",},
//         // {"_id": "648eeaa904490fd490173145",},
//         // {"_id": "648eeab404490fd490173146",},
//         // {"_id": "648eeabf04490fd490173147",},
//         // {"_id": "648eeacb04490fd490173148",},
//         // {"_id": "648eead904490fd490173149",},
//         // {"_id": "648eeae404490fd49017314a",},
//         // {"_id": "648eeaef04490fd49017314b",},
//         // {"_id": "648eeafd04490fd49017314c",},
//         // {"_id": "648eeb0904490fd49017314d",},
//         // {"_id": "648eeb1604490fd49017314e",},
//         // {"_id": "648eeb2204490fd49017314f",},
//         // {"_id": "648eeb2e04490fd490173150",},
//         // {"_id": "648eeb3d04490fd490173151",},
//         // {"_id": "648eeb4804490fd490173152",},
//         // {"_id": "648eeb5404490fd490173153",},
//         // {"_id": "648eeb6104490fd490173154",},
//         // {"_id": "648eeb6e04490fd490173155",},
//         // {"_id": "648eeb7b04490fd490173156",},
//         {"_id": "648ef02a90dd4510355d5718",}
//     ],
// }
