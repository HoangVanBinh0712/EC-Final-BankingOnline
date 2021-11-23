const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GoiTietKiemMacDinhSchema = new Schema({
	TenGoi: {
		type: String,
		required: true
	},
	ThoiHan: {
		type: String,
        enum: ['Vô hạn','1 tháng', '3 tháng', '6 tháng', '9 tháng', '1 năm', '3 năm', '5 năm'],
        require: true

	},
	UuDai: {
		type: String
	},
	LaiSuat: {
		type: Number,
        require: true
	},
	NgayDienRa:
    {
        type: Date,
	},
    NgayKetThuc:
    {
        type: Date,
    },
})

module.exports = mongoose.model('GoiTietKiemMacDinh', GoiTietKiemMacDinhSchema)
