import axios from "axios";

const APP_URL = "http://localhost:8000";

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

export async function fetchSpaceData(spaceId) {
    console.log("id from crud:", spaceId);
    try {
        const space = await axios.post(APP_URL + "/space/info", {
            space_id: spaceId
        });

        return space;
    }
    catch (err) {
        throw err;
    }
}

export async function accessClass(accessCode) {
    try {
        const space = await axios.post(APP_URL + "/space/access", {
            access_code: accessCode,
        });

        return space;
    }
    catch (err) {
        throw err;
    }
}

export async function toggleSpaceDisplay(email, spaceId, shown) {
    try {
        await axios.put(APP_URL + "/user/toggle-space-display", {
            email: email,
            spaceId: spaceId,
            shown: shown
        });
    } catch (err) {
        throw err;
    }
}

export async function updateUserDeliverables(email, deliverables) {
    try {
        const response = await axios.put(
            APP_URL + "/user/update-deliverables", {
                email: email,
                new_deliverables: deliverables,
            }
        );

        return response.data.new_deliverables_with_id;
    } catch (err) {
        throw err;
    }
}

export async function updateTodos(email, todos) {
    // title
    // description
    // start date
    // end date
    // start time
    // end time
    // deliverable
    // space
    // color

    try {
        const response = await axios.put(APP_URL + "/user/update-todos", {
            email: email,
            new_todos: todos,
        });

        console.log("response:", response);

        return response.data.new_todos_with_id;
    } catch (err) {
        throw err;
    }
}

export async function removeTodos(email, todo_ids) {
    try {
        console.log("removing todos: ", todo_ids);
        await axios.put(APP_URL + "/user/remove-todos", {
            email: email,
            removed_todo_ids: todo_ids
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

export async function updateUserSpaces(email, spaces) {
    try {
        await axios.put(APP_URL + "/user/update-spaces", {
            email: email,
            new_spaces: spaces,
        })
    } catch (err) {
        throw err;
    }
}

export async function updateSpacePeople(spaceId, people) {
    try {
        await axios.put(APP_URL + "/space/update-people", {
            spaceId: spaceId,
            new_people: people
        });

    } catch (err) {
        throw err;
    }
}