// ObjectId() method for converting studentId string into an ObjectId for querying database
const { ObjectId } = require('mongoose').Types;
const { User, Thought } = require('../models');

module.exports = {
    // Get all users
    async getUsers(req, res) {
        try {
            const users = await User.find();
            const userObj = {
                users
            };
            return res.json(userObj);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    // Get a single user
    async getSingleUser(req, res) {
        try {
            const user = await User.findOne({ _id: req.params.userId })
                .select('-__v')
                .populate('friends')
                .populate('thoughts');

            if (!user) {
                return res.status(404).json({ message: 'No user with that ID' });
            }

            res.json({
                user
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    // create a new user
    async createUser(req, res) {
        try {
            const user = await User.create(req.body);
            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // Delete a user and remove them
    async deleteUser(req, res) {
        try {
            const user = await User.findOneAndRemove({ _id: req.params.userId });

            if (!user) {
                return res.status(404).json({ message: 'No such user exists' })
            }

            await Thought.deleteMany({ _id: { $in: user.thoughts } });

            res.json({ message: 'User successfully deleted' });
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },

    // Add an friend to a user
    async addFriend(req, res) {
        try {
            console.log('You are adding an friend');
            console.log(req.body);
            const user = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $addToSet: { friends: req.params.friendId } },
                { new: true }
            );

            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'No user found with that ID :(' })
            }

            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // Remove assignment from a student
    async removeAssignment(req, res) {
        try {
            const student = await Student.findOneAndUpdate(
                { _id: req.params.studentId },
                { $pull: { assignment: { assignmentId: req.params.assignmentId } } },
                { runValidators: true, new: true }
            );

            if (!student) {
                return res
                    .status(404)
                    .json({ message: 'No student found with that ID :(' });
            }

            res.json(student);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};
