const newsrouter = require('./news')
const paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AagyByTY-ApeVTj09b0tGFbBSTvEaYcp8SvaRZWwO8L3KnLsvaVN2QWPQaR1fc1Z0iGB9fLuOgQ1iGBk',
    'client_secret': 'EOk5C_PDFMEvxlZuVKwPNowjKVdxSN5tX3X6ueOeFu1wXQnaHvxRmch4zXbOvalOnQ-mbuNqaJPnZ9pD'
});
const TaiKhoan = require('../models/TaiKhoan')
const verify = require('../middleware/auth')
const LichSuNapRut = require('../models/LichSuNapRut')
const tygia = 23300
function route(app) {

    app.post('/pay', verify, function (req, res) {
        var items = [{
            "name": `Nạp Tiền: ${req.body.SoTienNap} VNĐ `,
            "sku": "001",
            "price": (parseFloat(req.body.SoTienNap) / tygia).toFixed(2).toString(),
            "currency": "USD",
            "quantity": 1
        }]
        var amount = (parseFloat(req.body.SoTienNap) / tygia).toFixed(2).toString()

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success",
                "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": items
                },
                "amount": {
                    "currency": "USD",
                    "total": amount.toString()
                },
                "description": "Hat for the best team ever"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.log(error)
                req.flash('message', 'Có lỗi xảy ra khi nạp tiền vui lòng thử lại')
                return res.redirect('/');
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        return res.redirect(payment.links[i].href);
                    }
                }
            }
        });

    })

    ////
    app.get('/cancle', function (req, res) {
        req.flash('message', 'Có lỗi xảy ra khi nạp tiền vui lòng thử lại')
        return res.redirect('/');
    });
    ////
    app.get('/success', verify, async (req, res) => {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        if(await LichSuNapRut.findOne({paymentId: paymentId}))
        {
            //Tức là cái paymentId này đã sử dụng nạp lúc trước rồi
            req.flash('message','Bạn đã nạp tiền bằng giao dịch này rồi')
            return res.redirect("/NapTien")
        }

        paypal.payment.get(paymentId, async function (error, payment) {
            if (error) {
                console.log(error);
                throw error;
            } else {
                const amount = payment.transactions[0].amount.total.toString()
                //console.log(payment.transactions[0].amount.total)
                const execute_payment_json = {
                    "payer_id": payerId,
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": amount
                        }
                    }]
                };
                paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
                    if (error) {
                        req.flash('message', 'Có lỗi xảy ra khi nạp tiền vui lòng thử lại')
                        return res.redirect('/');
                    } else {
                        //console.log(JSON.stringify(payment));
                        const SoTienNap = (parseFloat(amount) * tygia).toFixed(4)
                        var taikhoan = await TaiKhoan.findOne({ user: req.userId })
                        taikhoan.SoDu = (parseFloat(taikhoan.SoDu) + parseFloat(SoTienNap)).toFixed(4)
                        taikhoan = await TaiKhoan.findOneAndUpdate({ user: req.userId }, taikhoan, { new: true })
                        if (!taikhoan) {
                            res.clearCookie(process.env.NAME_TOKEN_SECRET);
                            req.flash('message', 'Có lỗi xảy ra, vui lòng đăng nhập lại để xác thực ')
                            return res.redirect('/login')
                        }
                        const Ten = "Nạp"
                        const SoTien = SoTienNap
                        let lichsunaprut = new LichSuNapRut({
                            Ten,paymentId,SoTien,user: req.userId
                        })
                        await lichsunaprut.save()
                        req.flash('message', `Nạp ${SoTienNap} VNĐ thanh công!`);
                        return res.redirect('/TaiKhoan')
                    }
                });
            }
        });
    });
    ////  Thanh toán nạp
    //Chuyển tiền

    //
    app.post('/RutTien', verify, async (req, res) => {
        const value = (parseFloat(req.body.SoTienRut) / 23300).toFixed(2).toString()
        const email = await TaiKhoan.findOne({ user: req.userId })
        var sender_batch_id = Math.random().toString(36).substring(9);
        var create_payout_json = {
            "sender_batch_header": {
                "sender_batch_id": sender_batch_id,
                "email_subject": "Rút tiền từ ECBankApp"
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": value,
                        "currency": "USD"
                    },
                    "receiver": email.email.toString(),
                    "note": "Thank you.",
                    "sender_item_id": "item_3"
                }
            ]
        };
        var sync_mode = 'false';

        paypal.payout.create(create_payout_json, sync_mode, async function (error, payout) {
            if (error) {
                //Tiền chưa chuyển vậy redirect về / kèm message
                console.log(error.response);
                req.flash('message', 'Có lỗi xảy ra khi nạp tiền vui lòng thử lại')
                return res.redirect('/NapTien')
            } else {
                //Tiền chuyển rồi tiến hành cộng vào tài khoản của nó
                var payoutId = payout.batch_header.payout_batch_id;
                var amount = 0
                paypal.payout.get(payoutId, async function (error, payout) {
                    if (error) {
                        console.log(error);
                        req.flash('message', 'Có lỗi xảy ra khi rút tiền vui lòng thử lại sau !')
                        return res.redirect('/RutTien')
                    } else {
                        //Thành công
                        amount = payout.batch_header.amount.value * tygia
                        const SoTienRut = amount
                        var taikhoan = await TaiKhoan.findOne({ user: req.userId })
                        taikhoan.SoDu = (parseFloat(taikhoan.SoDu) - parseFloat(SoTienRut)).toFixed(4)
                        taikhoan = await TaiKhoan.findOneAndUpdate({ user: req.userId }, taikhoan, { new: true })
                        if (!taikhoan) {
                            res.clearCookie(process.env.NAME_TOKEN_SECRET);
                            req.flash('message', 'Có lỗi xảy ra, vui lòng đăng nhập lại để xác thực ')
                            return res.redirect('/login')
                        }
                        const Ten = "Rút"
                        const SoTien = SoTienRut
                        const paymentId = payoutId
                        let lichsunaprut = new LichSuNapRut({
                            Ten,paymentId,SoTien,user: req.userId
                        })
                        await lichsunaprut.save()
                        req.flash('message', `Rút ${SoTienRut} VNĐ thanh công!`);
                        return res.redirect('/TaiKhoan')
                    }
                });
            }
        });
    })
    //Chuyển tiền
    app.use('/', newsrouter)
}

module.exports = route