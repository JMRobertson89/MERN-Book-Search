/**
 * @file resolvers.js
 * Define the query and mutation functionality to work with the Mongoose models
 */

const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findOne({ _id: context.user._id });
                return user;
            } 
            throw AuthenticationError;
        }
    }, 

    Mutation: {
        login: async (parent, { email, password }) => {
            // Check if the email exists in the database 
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            // Validate that the password is correct 
            const isPwCorrect = await user.isCorrectPassword(password);

            if (!isPwCorrect) {
                throw AuthenticationError;
            }

            // Return token and user 
            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, { username, email, password }) => {
            // Create the user instance and return it with token 
            const user = await User.create(
                {
                    username: username,
                    email: email,
                    password: password,
                }
            );

            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { bookInput }, context) => {
            // Check authentication infomation in context for the user 
            if (context.user) {
                // Push the new book into the user's savedBooks field array
                const user = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookInput }},
                    { new: true }
                );
                return user;
            }
            // If the user is not authetnicated, throw AuthenticationError
            throw AuthenticationError;
        },

        removeBook: async (parent, args, context) => {
            // Check authentication information in context for the user
            if (context.user) {
                // Pull the book with bookId from the user's savedBooks field array
                const user = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: args }},
                    { new: true }
                );
                return user;
            }
            throw AuthenticationError;
        }
    }

}

module.exports = resolvers;