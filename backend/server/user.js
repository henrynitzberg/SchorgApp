const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Deliverable = require("./models/Deliverable");
const Todo = require("./models/Todo");
const Space = require("./models/Space");

/* User Functions */

async function getUser(email) {
    try {
        return await User.findOne({ email });
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function registerUserStandard(first_name, last_name, email, password) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: hashedPassword,
            todos: [],
            user_deliverables: [],
            user_spaces: [],
            is_google: false
        });

        await newUser.save();
        return await getUser(email);
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

async function registerUserGoogle(first_name, last_name, email) {
    try {
        const newUser = new User({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: null,
            todos: [],
            user_deliverables: [],
            user_spaces: [],
            is_google: true
        });

        await newUser.save();
        return await getUser(email);
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

/* TODO FUNCTIONS */

async function writeTodo(email, todo) {
    try {
        console.log("writing todo: ", todo);

        todo_with_id = {
            ...todo,
            _id: new mongoose.Types.ObjectId(),
        };

        await User.findOneAndUpdate(
            { email },
            { $push: { todos: todo_with_id } },
            { new: true }
        );

        return todo_with_id;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

async function removeTodo(email, todo_id) {
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        console.log("removing todo with id: ", todo_id);

        user.todos = user.todos.filter(todo => (!todo_id == todo._id.toString()));
        await user.save();
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

async function editTodo(email, updatedTodo) {
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found");

        console.log("editing todo: ", updatedTodo);

        const todo = user.todos.id(updatedTodo._id);
        if (!todo) throw new Error("Todo not found");

        Object.assign(todo, updatedTodo);
        await user.save();
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

/* DELIVERABLE FUNCTIONS */

async function writeDeliverable(email, deliverable) {
    try {
        console.log("writing deliverable: ", deliverable);

        deliverable_with_id = {
            ...deliverable,
            _id: new mongoose.Types.ObjectId(),
        };

        await User.findOneAndUpdate(
            { email },
            { $push: { user_deliverables: deliverable_with_id } },
            { new: true }
        );

        return deliverable_with_id;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

/* SPACE FUNCTIONS */

// async function writeSpace(email, space) {
//     try {
//     }
//     catch (err) {
//         console.error(err);
//         throw err;
//     }
// }

// TODO: should probably be a part of settings, which doesn't exist yet...
// async function toggleSpaceDisplay(email, spaceId, shown) {
//     try {
//         await client.connect();

//         const db = client.db("Gage");
//         const users = db.collection("Users");

//         await users.updateOne(
//             { 
//                 email: email, 
//                 "user_spaces._id": ObjectId.createFromHexString(spaceId) 
//             },
//             { 
//                 $set: { 
//                     "user_spaces.$.shown": shown 
//                 } 
//             }
//         );
//     }
//     catch (err) {
//        console.error(err);
//         throw err;
//     }
// }

/* exports */

module.exports = {
    getUser: getUser,
    registerUserStandard: registerUserStandard,
    registerUserGoogle: registerUserGoogle,
    writeDeliverable: writeDeliverable,
    writeTodo: writeTodo,
    removeTodo: removeTodo,
    editTodo: editTodo,
    // writeSpaces: writeSpaces,
    // toggleSpaceDisplay: toggleSpaceDisplay
}
