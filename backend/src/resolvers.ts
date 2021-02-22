import User from './schemas/Users';
import Message from './schemas/Message';
import { IResolvers, PubSub } from 'apollo-server';

const pubsub = new PubSub();
const CHAT_CHANNEL = 'CHAT_CHANNEL';

const resolvers: IResolvers =  {
	Query: {
		users: () => User.find(),
		user: (_, { id }) => User.findById(id),
		chat: () =>  {
			return Message.find().sort({ "timestamp": -1 }).populate('user');
		}
	},

	Mutation: {
		createUser: (_, { name, email }) => User.create({ name, email }),
		deleteUser: (_, { id }) => User.remove(id),
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
