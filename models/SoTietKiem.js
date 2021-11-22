const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SoTietKiemSchema = new Schema({
	TenSo: {
		type: String,
		required: true,
	},
    STK:
    {
        type: String,
        require: true,
    },
    CCCD:
    {
        type: String,
        require: true,
    },
    SoTienGui:
    {
        type: Number,
        require: true,
    },
    ThoiHan:
    {
        type: String,
        require: true
    },
    LaiSuat:
    {
        type: Number,
        require: true
    },
    NgayGui:
    {
        type: Date,
        default: Date.now
    },
    NgayHetHan:
    {
        type: Date,
        default: Date.now
    },
    SoTienDaoHan:{
        type: Number,
        default: 0,
    },
    user: {
		type: Schema.Types.ObjectId,
		ref: 'users'
	},
    GoiTietKiem: {
		type: Schema.Types.ObjectId,
		ref: 'GoiTietKiem'
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
})
module.exports = mongoose.model('SoTietKiem', SoTietKiemSchema)
