import User from './schemas/Users';
import Message from './schemas/Message';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IResolvers, PubSub } from 'apollo-server';

const pubsub = new PubSub();
const CHAT_CHANNEL = 'CHAT_CHANNEL';

dotenv.config();

const resolvers: IResolvers =  {
	Query: {
		users: () => User.find(),
		user: (_, { id }) => User.findById(id),
		chat: () =>  {
			return Message.find().sort({ "timestamp": -1 }).populate('user');
		}
	},

	Mutation: {
		createUser: async (_, { name, email, senha }) => {
			const encryptedPassword = await bcrypt.hash(senha, 10);

			return User.create({ 
				name, 
				email, 
				senha: encryptedPassword 
			});
		},
		deleteUser: (_, { id }) => User.remove(id),
		login: async (_, { login }) => {
			const { email, senha } = login;

			const result = await User.findOne({ email });

			
			if (result && bcrypt.compare(senha, result.senha)) {
				const token = jwt.sign({ id: result._id }, process.env.PRIVATE_KEY as string);

				return {
					id: result.id,
					token
				};
			}
			return null;
		},
		sendMessage: async (_, { userID, content }) => {
			// Busca o usuário por id
			const user = await User.findById(userID);

			// Salva a mensagem no banco de dados
			const messageSent = await Message.create({ user, content });
			console.log(messageSent);

			// Pública a mensagem
			pubsub.publish(CHAT_CHANNEL, { messageSent });

			return messageSent;
		}
	},

	Subscription: {
		messageSent: {
			subscribe: () => pubsub.asyncIterator([CHAT_CHANNEL])
		}
	}

};

export default resolvers;
