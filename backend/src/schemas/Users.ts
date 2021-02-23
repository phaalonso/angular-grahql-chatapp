import {model, Schema} from 'mongoose';

const UserSchema = new Schema({
	name: String,
	email: {
		type: String,
		unique: true
	},
	senha: String,
});

export default model('User', UserSchema);
