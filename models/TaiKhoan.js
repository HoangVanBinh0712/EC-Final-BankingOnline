const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TaiKhoanSchema = new Schema({
	TenTK: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true
	},
    NgaySinh:
    {
        type: Date,
        require: true
    },
    CCCD:
    {
        type: String,
        require: true,
    },
    SoDu:
    {
        type: Number,
        default: 0,
        require: true,
    },
    STK:
    {
        type: String,
        require: true,
    },
    user: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('TaiKhoan', TaiKhoanSchema)
