const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LichSuNapRutSchema = new Schema({
	Ten: {
		type: String,
		required: true,
	},
    paymentId: {
        type: String,
        require: true,
    },
    SoTien:
    {
        type: Number,
        require: true,
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
module.exports = mongoose.model('LichSuNapRut', LichSuNapRutSchema)
