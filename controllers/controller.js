const GoiTietKiem = require('../models/GoiTietKiem')
const SoTietKiem = require('../models/SoTietKiem')
const { multipleMongooseToObject, mongoosetoObject } = require('../util/mongoose')
const GoiTietKiemMacDinh = require('../models/GoiTietKiemMacDinh')

const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const TaiKhoan = require('../models/TaiKhoan')
const cookies = require('../middleware/cookies')

class Controller {

    async tangtien() {
        try {
            var tonglai = 0
            const laikhongkyhan = await GoiTietKiem.findOne({ TenGoi: "Không Kỳ Hạn" }, 'LaiSuat')
            var taikhoan = await TaiKhoan.find()
            taikhoan.forEach(async (element) => {
                if (element.STK != "31410003435176") {
                    var lai = (parseFloat(element.SoDu) * (parseFloat(laikhongkyhan.LaiSuat) / 360)).toFixed(4)
                    console.log(element.SoDu, ":", lai)
                    tonglai = (parseFloat(tonglai) + parseFloat(lai)).toFixed(4)
                    element.SoDu = (parseFloat(element.SoDu) + parseFloat(lai)).toFixed(4)
                    await TaiKhoan.findOneAndUpdate({ _id: element._id },
                        element,
                        { new: true })
                }
            })
            //trừ tiền thủ quỹ
            var treasurer = await TaiKhoan.findOne({ STK: "31410003435176" })
            console.log(tonglai)
            treasurer.SoDu = (treasurer.SoDu - parseFloat(tonglai)).toFixed(4)
            const treasurer_id = { _id: treasurer._id }
            treasurer = await TaiKhoan.findOneAndUpdate(
                treasurer_id,
                treasurer,
                { new: true }
            )
        } catch (error) {
            console.log(error)
        }
    }
    async updategoitietkiem() {
        try {
            //Chu nhat co nhung goi xin xo`
            const now = new Date().getDay()
            const day = new Date()
            var is = false
            const ngayle = new Array
            ngayle.push(new Date(1990, 0, 1))
            ngayle.push(new Date(1990, 2, 10))
            ngayle.push(new Date(1990, 3, 30))
            ngayle.push(new Date(1990, 4, 1))
            ngayle.push(new Date(1990, 8, 2))
            ngayle.push(new Date(1990, 1, 3))
            ngayle.push(new Date(1990, 9, 20))
            ngayle.push(new Date(1990, 10, 20))
            ngayle.forEach(element => {
                if (day.getDate() == element.getDate() &&
                    day.getMonth() == element.getMonth()) {
                    is = true
                }
            })

            if (is) {
                //set lại default 
                //Ngày lễ tăng tất cả lên 0.5% 
                const GoiTietKiemMacDinh = require('../models/GoiTietKiemMacDinh')
                const gtkmd = multipleMongooseToObject(await GoiTietKiemMacDinh.find())
                gtkmd.forEach(async (element) => {
                    element.LaiSuat = (parseFloat(element.LaiSuat) + 0.005).toFixed(4)
                    await GoiTietKiem.findOneAndUpdate({ _id: element._id },
                        element, { new: true })
                })
                console.log("Ngày lễ")
            } else if (day.getDate() % 10 == 0) {
                //Set lại defaut 
                //Tăng gói 1 3 6 lên 0.3%
                const GoiTietKiemMacDinh = require('../models/GoiTietKiemMacDinh')
                const gtkmd = multipleMongooseToObject(await GoiTietKiemMacDinh.find())
                gtkmd.forEach(async (element) => {
                    if (element.ThoiHan == "1 tháng" || element.ThoiHan == "3 tháng" || element.ThoiHan == "6 tháng") {
                        element.LaiSuat = (parseFloat(element.LaiSuat) + 0.003).toFixed(4)
                        await GoiTietKiem.findOneAndUpdate({ _id: element._id },
                            element, { new: true })
                    } else {
                        await GoiTietKiem.findOneAndUpdate({ _id: element._id },
                            element, { new: true })
                    }
                })
                console.log("Ngày % 10")

            } else {
                //ngày thường thì không có gì cả
                //Set tất cả về mặc định
                const GoiTietKiemMacDinh = require('../models/GoiTietKiemMacDinh')
                const gtkmd = multipleMongooseToObject(await GoiTietKiemMacDinh.find())
                gtkmd.forEach(async (element) => {
                    await GoiTietKiem.findOneAndUpdate({ _id: element._id },
                        element, { new: true })
                })
                console.log("ngày thường")
            }
        } catch (error) {
            console.log(error)
        }
    }
    async daohan() {
        try {
            const sotietkiem = multipleMongooseToObject(await SoTietKiem.find())
            sotietkiem.forEach(async (element) => {
                const day1 = new Date()
                if (day1 > element.NgayHetHan) {
                    //Đáo hạn
                    const SoTienGui = (parseFloat(element.SoTienGui) * (1 + element.LaiSuat)).toFixed(4)
                    const goitietkiem = mongoosetoObject(await GoiTietKiem.findById(element.GoiTietKiem))
                    const LaiSuat = goitietkiem.LaiSuat
                    var ThoiHan = goitietkiem.ThoiHan
                    var NgayGui = new Date()
                    var NgayHetHan = new Date()
                    var year = NgayGui.getFullYear()
                    const howlong = parseInt(ThoiHan.split(' ')[0])
                    const type = ThoiHan.split(' ')[1]
                    if (type == 'tháng') {
                        var month = NgayGui.getMonth()//11
                        var day = NgayGui.getDate()
                        var index = parseInt((month + howlong) / 12)
                        month = (month + howlong) % 12
                        year += index
                        NgayHetHan.setFullYear(year, month, day)
                    } else
                        if (type == 'năm') {
                            year += howlong
                            NgayHetHan.setFullYear(year)
                        }

                    const TenSo = element.TenSo
                    const STK = element.STK
                    const CCCD = element.CCCD
                    //Đủ input rồi
                    const SoTienDaoHan = 0
                    let sotietkiem = {
                        TenSo, STK, CCCD, SoTienGui, ThoiHan, LaiSuat, NgayGui, NgayHetHan, SoTienDaoHan,
                        user: element.user, GoiTietKiem: element.GoiTietKiem
                    }
                    await SoTietKiem.findByIdAndUpdate(element._id, sotietkiem, { new: true })
                    var treasurer = await TaiKhoan.findOne({ STK: "31410003435176" })
                    treasurer.SoDu = (treasurer.SoDu - parseFloat(element.SoTienGui * element.LaiSuat)).toFixed(4)
                    const treasurer_id = { _id: treasurer._id }
                    await TaiKhoan.findOneAndUpdate(
                        treasurer_id,
                        treasurer,
                        { new: true }
                    )
                    //
                    console.log("đáo hạn")

                }
            })
        } catch (error) {
            console.log(error);
        }
    }
    index(req, res) {
        const username = cookies.get(req, 'getUsername')
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        GoiTietKiem.find()
            .then(goitietkiem => {
                res.render("goitietkiem", {
                    goitietkiem: multipleMongooseToObject(goitietkiem), username: username,
                    soluong: goitietkiem.length, isAdmin: isAdmin, message: req.flash('message')
                })
            })
    }

    async mogoi(req, res) {
        if (req.method == 'GET') {
            var username = cookies.get(req, 'getUsername')
            const role = cookies.get(req, "role")
            var isAdmin = false
            if (role >= 1)
                isAdmin = true
            await TaiKhoan.findOne({ user: req.userId })
                .then(taikhoan => {
                    if (!taikhoan)
                        return res.render('taothongtin', { message: "Hãy điền đầy đủ thông tin để được sử dụng dịch vụ ", isAdmin: isAdmin, username: username })
                })
            var goitietkiem = await GoiTietKiem.findById({ _id: req.params._id })
            var ThoiHan = goitietkiem.ThoiHan
            var NgayGui = new Date()
            var NgayHetHan = new Date()
            var year = NgayGui.getFullYear()

            const howlong = parseInt(ThoiHan.split(' ')[0])
            const type = ThoiHan.split(' ')[1]
            if (type == 'tháng') {
                var month = NgayGui.getMonth()//11
                var day = NgayGui.getDate()
                var index = parseInt((month + howlong) / 12)
                month = (month + howlong) % 12
                year += index
                NgayHetHan.setFullYear(year, month, day)
            } else
                if (type == 'năm') {
                    year += howlong
                    NgayHetHan.setFullYear(year)
                }
            res.render('mogoitietkiem', {
                goitietkiem: mongoosetoObject(goitietkiem), NgayGui: NgayGui, NgayHetHan: NgayHetHan,
                username: username, isAdmin: isAdmin, message: req.flash('message')
            })
        } else {
            const { TenSo, SoTienGui, ThoiHan, LaiSuat, NgayGui, NgayHetHan } = req.body
            if (!TenSo || !SoTienGui) {
                req.flash('message', 'Vui lòng điền đầy đủ thông tin!');
                return res.redirect(`/GoiTietKiem/MoGoi/${req.body.GoiTietKiemId}`)
            }
            try {
                const SoTienDaoHan = 0
                var taikhoan = await TaiKhoan.findOne({ user: req.userId })
                if (taikhoan.SoDu < SoTienGui) {
                    req.flash('message', 'Số dư không đủ!');
                    return res.redirect(`/GoiTietKiem/MoGoi/${req.body.GoiTietKiemId}`)
                }
                const STK = taikhoan.STK
                const CCCD = taikhoan.CCCD
                let sotietkiem = new SoTietKiem({
                    TenSo, STK, CCCD, SoTienGui, ThoiHan, LaiSuat, NgayGui, NgayHetHan, SoTienDaoHan,
                    user: req.userId, GoiTietKiem: req.body.GoiTietKiemId
                })
                await sotietkiem.save()
                var treasurer = await TaiKhoan.findOne({ STK: "31410003435176" })
                taikhoan.SoDu = (taikhoan.SoDu - parseFloat(SoTienGui)).toFixed(4)
                treasurer.SoDu = (treasurer.SoDu - parseFloat(SoTienGui)).toFixed(4)
                const SoTietKiemUpdateCondition = { _id: taikhoan._id, user: req.userId }
                taikhoan = await TaiKhoan.findOneAndUpdate(
                    SoTietKiemUpdateCondition,
                    taikhoan,
                    { new: true }
                )
                const treasurer_id = { _id: treasurer._id }
                treasurer = await TaiKhoan.findOneAndUpdate(
                    treasurer_id,
                    treasurer,
                    { new: true }
                )
                req.flash('message', `Mở gói thành công. Tổng gửi ${SoTienGui} VNĐ`);
                res.redirect('/SoTietKiem')
            } catch (error) {
                console.log(error)
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                req.flash('message', 'Có lỗi trong hệ thống vui lòng đăng nhập lại')
                res.redirect('/login')
            }
        }
    }

    async themgoi(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        if (req.method == 'GET')
            return res.render('themgoi', { isAdmin: isAdmin, message: req.flash('message') })
        var { TenGoi, ThoiHan, UuDai, LaiSuat, NgayDienRa, NgayKetThuc } = req.body
        NgayDienRa = new Date(NgayDienRa)
        NgayKetThuc = new Date(NgayKetThuc)
        if (!TenGoi || !ThoiHan || !LaiSuat || !NgayDienRa || !NgayKetThuc) {
            req.flash('message', 'Vui lòng điền đầy đủ thông tin ')
            res.redirect(req.originalUrl)
        }

        //Check thời hạn.
        //all good 
        try {
            const user = await User.findById({ _id: req.userId })
            if (user && user.role == 0) {
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                req.flash('message', 'Không có quyền thêm vui lòng đăng nhập lại')
                return res.redirect('/login')
            }
            const goitietkiem = new GoiTietKiem({
                TenGoi, ThoiHan, UuDai, LaiSuat, NgayDienRa, NgayKetThuc
            })
            const goitietkiemmacdinh = new GoiTietKiemMacDinh({
                TenGoi, ThoiHan, UuDai, LaiSuat, NgayDienRa, NgayKetThuc
            })
            await goitietkiem.save()
            await goitietkiemmacdinh.save()
            req.flash('message', 'Thêm gói thành công')
            res.redirect('/')
        } catch (error) {
            console.log(error)
            req.flash('message', 'Có lỗi xảy ra vui lòng thử lại')
            res.redirect('/')
        }
    }
    async suagoi(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        try {
            if (req.method == 'GET') {
                var goitietkiem = await GoiTietKiem.findById({ _id: req.params._id })
                return res.render('suagoi', { goitietkiem: mongoosetoObject(goitietkiem), isAdmin: isAdmin, message: req.flash('message') })
            }
            const { TenGoi, ThoiHan, UuDai, LaiSuat, NgayDienRa, NgayKetThuc } = req.body

            // Simple validation
            if (!TenGoi || !ThoiHan || !LaiSuat) {
                req.flash('message', 'Vui lòng điền đầy đủ thông tin')
                return res.redirect(req.originalUrl)
            }
            const user = await User.findById({ _id: req.userId })
            if (user && user.role == 0) {
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                req.flash('message', 'Không có quyền sửa. vui lòng đăng nhập lại')
                return res.redirect('/login')
            }
            let updatedGoiTietKiem
            let updatedGoiTietKiemMacDinh

            if (!NgayDienRa && !NgayKetThuc) {
                updatedGoiTietKiemMacDinh = updatedGoiTietKiem = {
                    TenGoi, ThoiHan, UuDai, LaiSuat
                }
            }
            else {
                updatedGoiTietKiemMacDinh = updatedGoiTietKiem = {
                    TenGoi, ThoiHan, UuDai, LaiSuat, NgayDienRa, NgayKetThuc
                }
            }
            const old = await GoiTietKiem.findById(req.params._id)
            updatedGoiTietKiem = await GoiTietKiem.findOneAndUpdate(
                { _id: req.params._id },
                updatedGoiTietKiem,
                { new: true }
            )

            updatedGoiTietKiemMacDinh = await GoiTietKiemMacDinh.findOneAndUpdate(
                {
                    TenGoi: old.TenGoi,
                    ThoiHan: old.ThoiHan,
                    UuDai: old.UuDai,
                    LaiSuat: old.LaiSuat,
                    NgayDienRa: old.NgayDienRa,
                    NgayKetThuc: old.NgayKetThuc
                },
                updatedGoiTietKiemMacDinh,
                { new: true }
            )

            // User not authorised to update post or post not found
            if (!updatedGoiTietKiem || !updatedGoiTietKiemMacDinh) {
                req.flash('message', 'Không tìm thấy gói tiết kiệm hoặc chưa xác thực')
                return res.redirect(req.originalUrl)
            }
            req.flash('message', 'Sửa thành công!')
            res.redirect('/')
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    }
    async xoagoi(req, res) {
        try {
            const user = await User.findById({ _id: req.userId })
            if (user && user.role == 0) {
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                req.flash('message', 'Không có quyền xóa. vui lòng đăng nhập lại')
                return res.redirect('/login')
            }
            const deletedGoiTietKem = await GoiTietKiem.findOneAndDelete({ _id: req.params._id })

            const deletedGoiTietKemMacDinh = await GoiTietKiemMacDinh.findOneAndDelete({
                TenGoi: deletedGoiTietKem.TenGoi,
                ThoiHan: deletedGoiTietKem.ThoiHan,
                UuDai: deletedGoiTietKem.UuDai,
                LaiSuat: deletedGoiTietKem.LaiSuat,
                NgayDienRa: deletedGoiTietKem.NgayDienRa,
                NgayKetThuc: deletedGoiTietKem.NgayKetThuc
            })

            // User not authorised or post not found
            if (!deletedGoiTietKem || !deletedGoiTietKemMacDinh) {
                req.flash('message', 'Không tìm thấy gói hoặc chưa xác thực')
                return res.redirect('/')
            }

            req.flash('message', 'Xóa thành công !')
            return res.redirect('/')
        } catch (error) {
            console.log(error)
            req.flash('message', 'Có lỗi xảy ra khi xóa !')
            return res.redirect('/')
        }
    }
    async login(req, res) {
        if (req.method == 'GET') {
            return res.render('login', { message: req.flash('message') })
        }
        var { username, password } = req.body
        // Simple validation
        if (!username || !password) {
            req.flash('message', 'Thiếu thông tin tài khoản hoặc mật khẩu')
            return res.redirect('/login')
        }

        try {
            // Check for existing user
            const user = await User.findOne({ username })
            if (!user) {
                req.flash('message', 'Sai tài khoản hoặc mật khẩu')
                return res.redirect('/login')
            }

            // Username found
            const passwordValid = await argon2.verify(user.password, password)
            if (!passwordValid) {
                req.flash('message', 'Sai tài khoản hoặc mật khẩu')
                return res.redirect('/login')
            }


            // All good
            // Return token
            const accessToken = jwt.sign(
                { userId: user._id },
                process.env.ACCESS_TOKEN_SECRET
            )
            username = username + ' '
            res.cookie('authjwt', username + accessToken + ' ' + user.role, {
                expires: new Date(Date.now() + 8 * 3600000) // cookie will be removed after 8 hours
            })
            res.redirect('/')
        } catch (error) {
            console.log(error)
            res.clearCookie(process.env.NAME_TOKEN_SECRET);
            req.flash('message', 'Có lỗi xảy ra. Vui lòng đăng nhập lại')
            return res.redirect('/login')
        }
    }
    async xemso(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        var username = cookies.get(req, 'getUsername')
        await SoTietKiem.find({ user: req.userId })
            .then(sotietkiem => {
                res.render('sotietkiem', { sotietkiem: multipleMongooseToObject(sotietkiem), isAdmin: isAdmin, username: username, message: req.flash('message') })
            })
    }
    async xemchitietso(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        var username = cookies.get(req, 'getUsername')
        await SoTietKiem.findOne({ _id: req.params._id })
            .then(sotietkiem => {
                res.render('chitietso', { sotietkiem: mongoosetoObject(sotietkiem), isAdmin: isAdmin, username: username })
            })
    }
    async huygoi(req, res) {
        try {
            const SoTietKiemDeleteCondition = { _id: req.params._id, user: req.userId }
            //Lấy số tiền nó gửi
            const sotietkiem = await SoTietKiem.findOne(SoTietKiemDeleteCondition)
            if (sotietkiem) {
                //CHuyển lại vào Tk của nó
                var tienlai
                var now = new Date()
                var daygui
                var monthgui
                var yeargui
                var songay
                //trước thời hạn
                if (sotietkiem.NgayHetHan > now) {
                    daygui = sotietkiem.NgayGui.getDate()
                    monthgui = sotietkiem.NgayGui.getMonth()
                    yeargui = sotietkiem.NgayGui.getFullYear()
                    songay = (now.getFullYear() - yeargui) * 360 + (now.getMonth() - monthgui) * 30 + (now.getDate() - daygui)
                    tienlai = songay * 0.005 * sotietkiem.SoTienGui / 360
                }
                //Đúng thời hạn
                if (sotietkiem.NgayHetHan.getFullYear() == now.getFullYear()
                    && sotietkiem.NgayHetHan.getMonth() == now.getMonth()
                    && sotietkiem.NgayHetHan.getDate() == now.getDate()) {
                    tienlai = sotietkiem.LaiSuat * sotietkiem.SoTienGui
                }
                let taikhoan = await TaiKhoan.findOne({ user: req.userId })
                const sotien = taikhoan.SoDu
                try {
                    //Tính lãi: 
                    taikhoan.SoDu = taikhoan.SoDu + tienlai + sotietkiem.SoTienGui
                    var treasurer = await TaiKhoan.findOne({ STK: "31410003435176" })
                    treasurer.SoDu = treasurer.SoDu - (tienlai + sotietkiem.SoTienGui)
                    // All good
                    const TaiKhoanUpdateCondition = { _id: taikhoan._id, user: req.userId }
                    taikhoan = await TaiKhoan.findOneAndUpdate(
                        TaiKhoanUpdateCondition,
                        taikhoan,
                        { new: true })
                    const treasurer_id = { _id: treasurer._id }
                    treasurer = await TaiKhoan.findOneAndUpdate(
                        treasurer_id,
                        treasurer,
                        { new: true }
                    )
                    //Chuyen xong roi xoa so tiet kiem
                    const deletedSoTietKiem = await SoTietKiem.findOneAndDelete(SoTietKiemDeleteCondition)
                    if (!deletedSoTietKiem) {
                        //Xoá k được thì roll back
                        taikhoan.SoDu = sotien
                        taikhoan = await TaiKhoan.findOneAndUpdate(
                            TaiKhoanUpdateCondition,
                            taikhoan,
                            { new: true })
                        res.clearCookie(process.env.NAME_TOKEN_SECRET);
                        req.flash('message', 'Có lỗi xảy ra khi xóa sổ tiết kiệm, vui lòng đăng nhập lại để xác thực')
                        return res.redirect('/login')
                    }
                    req.flash('message', `Hủy gói thành công. Nhận ${tienlai + sotietkiem.SoTienGui} VNĐ`);
                    res.redirect('/TaiKhoan')
                } catch
                {
                    taikhoan.SoDu = sotien
                    const TaiKhoanUpdateCondition = { _id: taikhoan._id, user: req.userId }
                    taikhoan = await TaiKhoan.findOneAndUpdate(
                        TaiKhoanUpdateCondition,
                        taikhoan,
                        { new: true })
                    res.clearCookie(process.env.NAME_TOKEN_SECRET);
                    req.flash('message', 'Có lỗi xảy ra khi xóa sổ tiết kiệm, vui lòng đăng nhập lại để xác thực')
                    return res.redirect('/login')
                }
            }
        } catch (error) {
            console.log(error)
            res.clearCookie(process.env.NAME_TOKEN_SECRET);
            req.flash('message', 'Có lỗi xảy ra khi xóa sổ tiết kiệm, vui lòng đăng nhập lại để xác thực')
            return res.redirect('/login')
        }
    }
    async xemthongtin(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        var username = cookies.get(req, 'getUsername')
        var tienguitietkiem = 0
        await SoTietKiem.find({ user: req.userId })
            .then(sotietkiem => {
                sotietkiem.forEach(stk => {
                    tienguitietkiem += stk.SoTienGui
                })
            })
        await TaiKhoan.findOne({ user: req.userId })
            .then(taikhoan => {
                if (!taikhoan)
                    return res.render('taothongtin', { message: "Hãy điền đầy đủ thông tin để được sử dụng dịch vụ ", isAdmin: isAdmin, username: username })
                return res.render('xemthongtin', { taikhoan: mongoosetoObject(taikhoan), sotien: tienguitietkiem + taikhoan.SoDu, isAdmin: isAdmin, username: username, message: req.flash('message') })
            })
    }
    async suathongtin(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        if (req.method == 'GET') {
            var username = cookies.get(req, 'getUsername')
            await TaiKhoan.findOne({ user: req.userId })
                .then(taikhoan => {
                    return res.render('suathongtin', { taikhoan: mongoosetoObject(taikhoan), isAdmin: isAdmin, username: username, message: req.flash('message') })
                })
        }
        else {
            const { TenTK, email, CCCD, NgaySinh, SoDU, STK, createdAt } = req.body
            if (!TenTK || !email || !CCCD || !NgaySinh) {
                req.flash('message', 'Vui lòng điền đầy đủ thông tin!');
                return res.redirect('/TaiKhoan/ChinhSua')
            }
            try {
                let updatedTaiKhoan = {
                    TenTK,
                    email,
                    NgaySinh,
                    CCCD,
                    user: req.userId
                }
                const taikhoanUpdateCondition = { user: req.userId }
                updatedTaiKhoan = await TaiKhoan.findOneAndUpdate(
                    taikhoanUpdateCondition,
                    updatedTaiKhoan,
                    { new: true }
                )

                // User not authorised to update post or post not found
                if (!updatedTaiKhoan) {
                    res.clearCookie(process.env.NAME_TOKEN_SECRET);
                    req.flash('message', 'Không tìm thấy tài khoản hoặc chưa đươc xác thực. Vui lòng đăng nhập lại ')
                    return res.redirect('/login')
                }
                req.flash('message', 'Sửa thông tin thành công!');
                res.redirect('/TaiKhoan')
            } catch (error) {
                console.log(error)
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                req.flash('message', 'Có lỗi xảy ra, vui lòng đăng nhập lại để xác thực ')
                return res.redirect('/login')
            }
        }
    }
    async taothongtin(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        var { TenTK, email, NgaySinh, CCCD, STK } = req.body
        // Simple validation
        if (!TenTK || !email || !NgaySinh || !CCCD || !STK) {
            return res.render('taothongtin', { message: "Thiếu thông tin", isAdmin: isAdmin })
        }
        try {
            const SoDu = 0
            const check = await TaiKhoan.findOne({ user: req.userId })
            const checkSTK = await TaiKhoan.findOne({ STK: STK })
            const checkCCCD = await TaiKhoan.findOne({ CCCD: CCCD })

            if (!check && !checkSTK && !checkCCCD) {
                //Tách ngày ra
                NgaySinh = NgaySinh.substring(0, 10)
                var date = NgaySinh.split('-')
                const y = parseInt(date[0])
                const m = parseInt(date[1]) - 1
                const d = parseInt(date[2]) + 1
                var NgaySinh = new Date(y, m, d)
                const taikhoan = new TaiKhoan({
                    TenTK,
                    email,
                    NgaySinh,
                    CCCD,
                    SoDu,
                    STK,
                    user: req.userId
                })

                await taikhoan.save()
                req.flash('message', 'Tạo thông tin thành công!');
                res.redirect('/TaiKhoan')
            }
            else {
                return res.render('taothongtin', { message: "STK hoặc CCCD đã được sử dụng", isAdmin: isAdmin })
            }
        } catch (error) {
            console.log(error)
            res.clearCookie(process.env.NAME_TOKEN_SECRET);
            req.flash('message', 'Có lỗi xảy ra, vui lòng đăng nhập lại để xác thực ')
            return res.redirect('/login')
        }
    }
    async doimatkhau(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        if (req.method == 'GET') {

            var username = cookies.get(req, 'getUsername')
            res.render('doimatkhau', { username: username, isAdmin: isAdmin })
        }
        else {
            const { oldpassword, newpassword, confirmnewpassword } = req.body
            // Simple validation
            if (!oldpassword || !newpassword || !confirmnewpassword || newpassword !== confirmnewpassword)
                return res.render('doimatkhau', { message: 'Nhập thiếu thông tin', isAdmin: isAdmin })

            try {
                // Check for existing user
                var user = await User.findById(req.userId)
                const passwordValid = await argon2.verify(user.password, oldpassword)
                if (!passwordValid)
                    return res.render('doimatkhau', { message: 'Nhập sai mật khẩu cũ', isAdmin: isAdmin })

                //allgood
                const hashedPassword = await argon2.hash(newpassword)
                user.password = hashedPassword
                const userUpdateCondition = { _id: req.userId }

                user = await User.findOneAndUpdate(userUpdateCondition, user, { new: true })
                if (!user) {
                    res.clearCookie(process.env.NAME_TOKEN_SECRET);
                    req.flash('message', 'Có lỗi xảy ra, vui lòng đăng nhập lại để xác thực ')
                    return res.redirect('/login')
                }
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                req.flash('message', 'Đổi mật khẩu thành công')
                console.log('oday')
                return res.redirect('/login')

            } catch (error) {
                console.log(error)
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                req.flash('message', 'Có lỗi xảy ra, vui lòng đăng nhập lại để xác thực ')
                return res.redirect('/login')
            }
        }
    }

    async naptien(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        if (req.method == 'GET') {
            var username = cookies.get(req, 'getUsername')
            await TaiKhoan.findOne({ user: req.userId })
                .then(taikhoan => {
                    res.render('naptien', { taikhoan: mongoosetoObject(taikhoan), username: username, isAdmin: isAdmin })
                })
        } else {
            const { SoTienNap } = req.body
            var taikhoan = await TaiKhoan.findOne({ user: req.userId })
            taikhoan.SoDu = (parseFloat(taikhoan.SoDu) + parseFloat(SoTienNap)).toFixed(4)
            taikhoan = await TaiKhoan.findOneAndUpdate({ user: req.userId }, taikhoan, { new: true })
            if (!taikhoan) {
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                req.flash('message', 'Có lỗi xảy ra, vui lòng đăng nhập lại để xác thực ')
                return res.redirect('/login')
            }
            req.flash('message', `Nạp ${SoTienNap} VNĐ thanh công!`);
            return res.redirect('/TaiKhoan')
        }
    }
    async ruttien(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        if (req.method == 'GET') {
            var username = cookies.get(req, 'getUsername')
            await TaiKhoan.findOne({ user: req.userId })
                .then(taikhoan => {
                    res.render('ruttien', { taikhoan: mongoosetoObject(taikhoan), username: username, isAdmin: isAdmin })
                })
        } else {
            const { SoTienRut } = req.body
            var taikhoan = await TaiKhoan.findOne({ user: req.userId })
            taikhoan.SoDu = (parseFloat(taikhoan.SoDu) - parseFloat(SoTienRut)).toFixed(4)
            taikhoan = await TaiKhoan.findOneAndUpdate({ user: req.userId }, taikhoan, { new: true })
            if (!taikhoan) {
                res.clearCookie(process.env.NAME_TOKEN_SECRET);
                req.flash('message', 'Có lỗi xảy ra, vui lòng đăng nhập lại để xác thực ')
                return res.redirect('/login')
            }
            req.flash('message', `Rút ${SoTienRut} VNĐ thanh công!`);
            return res.redirect('/TaiKhoan')
        }
    }
    async register(req, res) {
        const { username, password, confirmpassword } = req.body
        // Simple validation
        if (!username || !password || !confirmpassword || password !== confirmpassword)
            return res.render('register', { message: 'Missing username and/or password' })
        try {
            // Check for existing user
            const user = await User.findOne({ username })

            if (user)
                return res.render('register', { message: 'Tên đăng nhập đã được tạo' })

            // All good
            const hashedPassword = await argon2.hash(password)
            const newUser = new User({ username, password: hashedPassword })
            await newUser.save()
            req.flash('message', 'Tạo tài khoản thành công hãy đăng nhập để sử dụng dịch vụ')
            return res.redirect('/login')
        } catch (error) {
            console.log(error)
            res.clearCookie(process.env.NAME_TOKEN_SECRET);
            req.flash('message', 'Có lỗi xảy ra, vui lòng đăng nhập lại để xác thực ')
            return res.redirect('/login')
        }
    }
    dangxuat(req, res) {
        res.clearCookie(process.env.NAME_TOKEN_SECRET);
        req.flash('message', 'Đăng Xuất Thành Công ')
        return res.redirect('/')
    }
    //admin 
    async xemtatcanguoidung(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        try {
            var user = await User.findById({ _id: req.userId })
            if (user.role < 1) //common user
            {
                req.flash('message', 'Bạn Không có quyền sử dụng chức năng này')
                return res.redirect('/')
            }
            var username = cookies.get(req, 'getUsername')
            await TaiKhoan.find()
                .then(taikhoan => {
                    return res.render('xemtatcanguoidung', { taikhoan: multipleMongooseToObject(taikhoan), isAdmin: isAdmin, people: taikhoan.length, username: username })
                })
        } catch (error) {
            console.log(error)
            req.flash('message', 'Có lỗi xảy ra vui lòng thử lại')
            res.redirect('/')
        }
    }
    async xemtatcaso(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        try {
            var user = await User.findById({ _id: req.userId })
            if (user.role < 1) //common user
            {
                req.flash('message', 'Bạn Không có quyền sử dụng chức năng này')
                return res.redirect('/')
            }
            var username = cookies.get(req, 'getUsername')
            await SoTietKiem.find()
                .then(sotietkiem => {
                    var tongtien = 0
                    sotietkiem.forEach(stk => {
                        tongtien += stk.SoTienGui
                    })
                    return res.render('xemtatcasotietkiem', { sotietkiem: multipleMongooseToObject(sotietkiem), soluong: sotietkiem.length, isAdmin: isAdmin, tongtien: tongtien, soluong: sotietkiem.length, username: username })
                })
        } catch (error) {
            console.log(error)
            req.flash('message', 'Có lỗi xảy ra vui lòng thử lại')
            res.redirect('/')
        }
    }
    async xemsotietkiemnguoidung(req, res) {
        const role = cookies.get(req, "role")
        var isAdmin = false
        if (role >= 1)
            isAdmin = true
        try {
            var user = await User.findById({ _id: req.userId })
            if (user.role < 1) //common user
            {
                req.flash('message', 'Bạn Không có quyền sử dụng chức năng này')
                return res.redirect('/')
            }
            var username = cookies.get(req, 'getUsername')
            const taikhoan = await TaiKhoan.findOne({ user: req.params._id })
            const nguoidung = taikhoan.TenTK
            await SoTietKiem.find({ user: req.params._id })
                .then(sotietkiem => {

                    res.render('xemsotietkiemnguoidung', { isAdmin: isAdmin, soluong: sotietkiem.length, nguoidung: nguoidung, sotietkiem: multipleMongooseToObject(sotietkiem), username: username })
                })

        } catch (error) {
            console.log(error)
            req.flash('message', 'Có lỗi xảy ra vui lòng thử lại')
            res.redirect('/')
        }
    }
}

module.exports = new Controller