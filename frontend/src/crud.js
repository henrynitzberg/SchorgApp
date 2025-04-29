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

export async function fetchSpaceData(accessCode) {
    try {
        const space = await axios.post(APP_URL + "/space/info", {
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

export async function removeTodos(email, todos) {
    try {
        console.log("removing todos: ", todos);
        await axios.put(APP_URL + "/user/remove-todos", {
            email: email,
            removed_todos: todos
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