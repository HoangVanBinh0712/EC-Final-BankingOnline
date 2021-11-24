const express = require('express')
const controller = require('../controllers/controller')
const router = express.Router()
const Controller = require('../controllers/controller')
const verify = require('../middleware/auth')

//router.post('/login', Controller.login)
router.post('/login', Controller.login)//Dang nhap
router.get('/login', Controller.login)
router.post('/register', Controller.register)//Dang nhap
router.get('/register', (req, res) => { res.render('register') })
router.get('/DangXuat', Controller.dangxuat)//Dang nhap

router.get('/GoiTietKiem/MoGoi/:_id', verify, Controller.mogoi)//Tao so tiet kiem
router.post('/GoiTietKiem/MoGoi', verify, Controller.mogoi)

router.get('/GoiTietKiem/Them', verify, Controller.themgoi)//admin
router.post('/GoiTietKiem/Them', verify, Controller.themgoi)//admin

router.get('/GoiTietKiem/Sua/:_id', verify, Controller.suagoi)//admin
router.post('/GoiTietKiem/Sua/:_id', verify, Controller.suagoi)//admin

router.get('/GoiTietKiem/Xoa/:_id', verify, Controller.xoagoi)//admin
///
router.get('/GoiTietKiem?', Controller.searchgtk)//admin

router.post('/SoTietKiem/TatCaSo',verify, controller.xemtatcaso)//admin
router.get('/SoTietKiem/TatCaSo',verify, controller.xemtatcaso)//admin
router.get('/SoTietKiem/HuyGoi/:_id', verify, Controller.huygoi)//Xóa sổ tiết kiệm rút tiền
router.get('/SoTietKiem/:_id', verify, Controller.xemchitietso)
router.get('/SoTietKiemSearch?',verify, Controller.searchstk)//admin
router.get('/SoTietKiem', verify, Controller.xemso)
//usser
router.post('/TaiKhoan/DoiMatKhau', verify, Controller.doimatkhau)//Sửa thông tin
router.get('/TaiKhoan/DoiMatKhau', Controller.doimatkhau)
router.post('/TaiKhoan/TaoThongTin', verify, Controller.taothongtin)//Sửa thông tin
//admin
router.get('/TaiKhoan/XemTatCaNguoiDung/:_id', verify, Controller.xemsotietkiemnguoidung)//admin
router.get('/TaiKhoan/XemTatCaNguoiDung', verify, Controller.xemtatcanguoidung)//admin
router.post('/TaiKhoan/XemTatCaNguoiDung', verify, Controller.xemtatcanguoidung)//admin

router.post('/TaiKhoan/ChinhSua', verify, Controller.suathongtin)//Sửa thông tin
router.get('/TaiKhoan/ChinhSua', verify, Controller.suathongtin)
router.get('/TaiKhoan', verify, Controller.xemthongtin)//Xem thông tin

//router.post('/NapTien',verify, Controller.naptien)
router.get('/NapTien',verify ,Controller.naptien)

router.get('/RutTien',verify ,Controller.ruttien)

router.get('/LichSuNapRut',verify,Controller.lichsunaprut)
router.get('/LichSuGuiTietKiem',verify,Controller.lichsuguitietkiem)

router.get('/', Controller.index)

module.exports = router