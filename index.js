import { gql, ApolloServer, UserInputError } from 'apollo-server';
import { v1 as uuid } from 'uuid';
import axios from 'axios';
const persons = [
  {
    name: 'Midu',
    phone: '2354325435',
    street: 'Cortijo',
    city: 'España',
    id: '32423142314234',
  },
  {
    name: 'Ribo',
    phone: '32543254325',
    street: 'Narivo',
    city: 'Boaba',
    id: '234524325243523',
  },
  {
    name: 'Rose',
    phone: '7698453432',
    street: 'Drak',
    city: 'Brasov',
    id: '24346785432133',
  },
];

const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }
  type Address {
    street: String!
    city: String!
  }
  type Person {
    name: String!
    phone: String
    address: Address!
    id: ID!
  }
  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`;
const resolvers = {
  Query: {
    personCount: () => {
      return persons.length;
    },
    allPersons: async (root, args) => {
      const { data: personsFromApi } = await axios.get(
        'http://localhost:3000/persons'
      );
      console.log('personsFromApi-->', personsFromApi);
      if (!args.phone) return personsFromApi;

      const byPhone = person =>
        args.phone === 'YES' ? person.phone : !person.phone;
      return persons.filter(byPhone);
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find(person => {
        return person.name === name;
      });
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      // const { name, person, street, city } = args;
      if (persons.find(p => p.name === args.name)) {
        throw new UserInputError('El nobre debe ser unico', {
          invalidArgs: args.name,
        });
      }
      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex(
        person => person.name === args.name
      );

      if (personIndex === -1) return null;
      const person = persons[personIndex];
      const updatePerson = { ...person, phone: args.phone };
      persons[personIndex] = updatePerson;
      return updatePerson;
    },
  },
  Person: {
    address: root => {
      return {
        street: root.street,
        city: root.city,
      };
    },
  },
};

const server = new ApolloServer({ typeDefs: typeDefinitions, resolvers });
server.listen().then(url => {
  console.log(`Servidor iniciado en url: ${url.url}`);
});
