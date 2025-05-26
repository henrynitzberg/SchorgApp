import axios from "axios";

const APP_URL = "http://localhost:8000";

/* USER FUNCTIONS */

export async function fetchUserData(email) {
    try {
        const user = await axios.post(APP_URL + "/user/info", {
            email: email
        });

        return user;
    }
    catch (err) {
        throw err;
    }
}

/* TODO FUNCTIONS */

export async function writeTodo(email, todo) {
    try {
        const response = await axios.put(APP_URL + "/user/write-todo", {
            email: email,
            new_todo: todo,
        });

        console.log("response:", response);

        return response.data.new_todo_with_id;
    } catch (err) {
        throw err;
    }
}

export async function removeTodo(email, todo_id) {
    try {
        console.log("removing todo: ", todo_id);
        await axios.put(APP_URL + "/user/remove-todo", {
            email: email,
            removed_todo_id: todo_id
        });
    } catch (err) {
        throw err;
    }
}

export async function editTodo(email, todo) {
    try {
        console.log("editing todo: ", todo);
        await axios.put(APP_URL + "/user/edit-todo", {
            email: email,
            todo: todo
        });
    } catch (err) {
        throw err;
    }
}

/* DELIVERABLE FUNCTIONS */

export async function writeUserDeliverable(email, deliverable) {
    try {
        const response = await axios.put(
            APP_URL + "/user/write-deliverable", {
                email: email,
                new_deliverable: deliverable,
            }
        );

        return response.data.new_deliverable_with_id;
    } catch (err) {
        throw err;
    }
}

/* SPACE FUNCTIONS */

// export async function fetchSpaceData(spaceId) {
//     console.log("id from crud:", spaceId);
//     try {
//         const space = await axios.post(APP_URL + "/space/info", {
//             space_id: spaceId
//         });

//         return space;
//     }
//     catch (err) {
//         throw err;
//     }
// }

// export async function accessClass(accessCode) {
//     try {
//         const space = await axios.post(APP_URL + "/space/access", {
//             access_code: accessCode,
//         });

//         return space;
//     }
//     catch (err) {
//         throw err;
//     }
// }

// export async function toggleSpaceDisplay(email, spaceId, shown) {
//     try {
//         await axios.put(APP_URL + "/user/toggle-space-display", {
//             email: email,
//             spaceId: spaceId,
//             shown: shown
//         });
//     } catch (err) {
//         throw err;
//     }
// }

// export async function updateUserSpaces(email, spaces) {
//     try {
//         await axios.put(APP_URL + "/user/update-spaces", {
//             email: email,
//             new_spaces: spaces,
//         })
//     } catch (err) {
//         throw err;
//     }
// }

// export async function updateSpacePeople(spaceId, people) {
//     try {
//         await axios.put(APP_URL + "/space/update-people", {
//             spaceId: spaceId,
//             new_people: people
//         });

//     } catch (err) {
//         throw err;
//     }
// }