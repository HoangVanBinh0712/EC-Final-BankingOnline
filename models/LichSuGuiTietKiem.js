const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LichSuGuiTietKiemSchema = new Schema({
	Ten: {//Hủy mở gói
		type: String,
		required: true,
	},
    TenSo: {
		type: String,
		required: true,
	},
    SoTien: //Thu về hoặc bỏ ra
    {
        type: Number,
        require: true,
    },
	ChiTiet:
	{
		type: String,
	},
    user: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
	Ngay: {
		type: Date,
		default: Date.now
	}
})
module.exports = mongoose.model('LichSuGuiTietKiem', LichSuGuiTietKiemSchema)
