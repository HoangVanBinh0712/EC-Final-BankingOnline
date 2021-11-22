const jwt = require('jsonwebtoken')
const cookies = require('./cookies')
const TaiKhoan = require('../models/TaiKhoan')
const verifyToken = (req, res, next) => {
	if (req.headers.cookie) {
		const token = cookies.get(req,'getToken')
		if (!token)
			return res.render('login', {message: "Đăng nhập để sử dụng dịch vụ"})

		try {
			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
			req.userId = decoded.userId
			next()
		} catch (error) {
			console.log(error)
			res.clearCookie(process.env.NAME_TOKEN_SECRET);
			return res.render('login', {message: "Đăng nhập để sử dụng dịch vụ"})
		}
	}
	else
		res.redirect('/login')
}

module.exports = verifyToken
