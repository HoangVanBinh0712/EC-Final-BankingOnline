const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LichSuChuyenTienSchema = new Schema({
	NguoiChuyen: {
		type: String,
		required: true,
	},
    NguoiNhan: {
        type: String,
        require: true,
    },
    SoTien:
    {
        type: Number,
        require: true,
    },
    NoiDung:
    {
        type: String,
    },
    userchuyen: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
    userNhan: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
	Ngay: {
		type: Date,
		default: Date.now
	}
})
module.exports = mongoose.model('LichSuChuyenTien', LichSuChuyenTienSchema)
