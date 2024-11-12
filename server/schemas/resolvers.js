const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        async me(parent, args, context) {
            if (!context.user) {
              throw new Error('You need to be logged in!');
            }
      
            const foundUser = await User.findOne({ _id: context.user._id });
            return foundUser;
          },
        async getSingleUser(parent, { id, username }, context) {
            const foundUser = await User.findOne({
                $or: [{ _id: id || context.user?._id }, { username }],
            });

            if (!foundUser) {
                throw new Error('Cannot find a user with this id or username');
            }

            return foundUser;
        },
    },

    Mutation: {
        async addUser(parent, args) {
            const user = await User.create(args);

            if (!user) {
                throw new Error ('Something went wrong!');           
             }
             
            const token = signToken(user);
            return { token, user};
        },

        async loginUser(parent, { username, email, password }) {
            const user = await User.findOne({ $or: [{ username }, { email }] });
             if (!user) {
                throw new Error('Cannot find this user');
             }

             const correctPw = await user.isCorrectPassword(password);

             if(!correctPw) {
                throw new Error ('Wrong password');
             }

             const token = signToken(user);
             return { token, user };
        },

        async saveBook(parent, { bookData }, context) {
            if (!context.user) {
                throw new Error('You need to be logged in to save a book');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: bookData } },
                { new: true, runValidators: true }
            );

            return updatedUser;
        },

        async deleteBook(parent, { bookId }, context) {
            if (!context.user) {
                throw new Error('You need to be logged in to delete a book');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );

            if (!updatedUser) {
                throw new Error('Could not find user with this id');
            }
            
            return updatedUser;
        },
    },
};

module.exports = resolvers;