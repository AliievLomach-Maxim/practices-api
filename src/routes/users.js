/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить список пользователей
 *     description: Возвращает список всех пользователей
 *     responses:
 *       200:
 *         description: Успешный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *   post:
 *     summary: Создать нового пользователя
 *     description: Создает нового пользователя с заданными данными
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Некорректные данные пользователя
 */

import express from 'express'
import passport from 'passport'
import { getUsers, getUser, updateUser, addUser } from '../controllers/users.js'
import { addPost, getPostsByIdUser } from '../controllers/posts.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', passport.authenticate('jwt', { session: false }), updateUser)
router.post('/', passport.authenticate('jwt', { session: false }), addUser)

router.get('/:id/posts', getPostsByIdUser)
router.post(
	'/:id/posts',
	passport.authenticate('jwt', { session: false }),
	addPost
)

export default router
