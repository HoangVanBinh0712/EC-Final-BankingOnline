const jwt = require('jsonwebtoken')
const cookies = require('./cookies')
const TaiKhoan = require('../models/TaiKhoan')
const verifyToken = (req, res, next) => {
	if (req.headers.cookie) {
		const token = cookies.get(req,'getToken')
		if (!token){
			req.session.message = {
				type: 'danger',
				intro: "Đăng nhập để sử dụng dịch vụ",
				message: ''
			}
			return res.redirect('/login')}

		try {
			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
			req.userId = decoded.userId
			const usname = cookies.get(req,'getUsername')
			const rl = cookies.get(req,'getRole')
			const cookie = (usname + ' ' + token + ' ' + rl)
			res.cookie('authjwt', cookie , {
                expires: new Date(Date.now() + 300000) // cookie will be removed after 5m
            })
			next()
		} catch (error) {
			console.log(error)
			res.clearCookie(process.env.NAME_TOKEN_SECRET);
			req.session.message = {
				type: 'danger',
				intro: "Đăng nhập để sử dụng dịch vụ",
				message: ''
			}
			return res.redirect('/login')
		}
	}
	else{
		req.session.message = {
			type: 'danger',
			intro: "Đăng nhập để sử dụng dịch vụ",
			message: ''
		}
		res.redirect('/login')}
}

module.exports = verifyToken
