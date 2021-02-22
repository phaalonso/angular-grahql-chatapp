import { ApolloServer, gql } from 'apollo-server';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

import resolvers from './resolvers';

const pathToSchema = path.resolve(__dirname, '..', 'schema.graphql');
const typeDefs = gql`${fs.readFileSync(pathToSchema)}`;

mongoose.connect('mongodb://localhost:27017/graphqlnode', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const server = new ApolloServer({ 
	typeDefs,
	resolvers,
	tracing: true,
	subscriptions: {
		path: '/subscriptions'
	}
});

server.listen().then(({ url }) => {
	console.log(`Server is ready at ${url}`);
})
