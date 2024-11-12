const typeDefs = `
    type User {
        _id: ID
        username: String
        email: String   
        bookCount: Int
        savedBooks: [Book]
    }
    
    type Book {
        bookId: ID
        authors: [String]
        description: String
        title: String
        image: String
        link: String    
    }

    type Auth {
        token: ID!
        user: User
    }

    input BookInput {
        bookId: ID!
        authors: [String]
        description: String
        title: String
        image: String
        link: String
    }
    
    type Query {
        me: User
        getSingleUser(id: ID!): User
    }


    type Mutation {
        addUser(username: String!, email: String!, password: String!): Auth
        loginUser(email: String!, password: String!): Auth
        saveBook(bookData: BookInput!): User
        deleteBook(bookId: ID!): User
    }
        

`;

module.exports = typeDefs;