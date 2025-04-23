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

export async function updateUserDeliverables(email, deliverables) {
    try {
        await axios.put(APP_URL + "/user/update-deliverables", {
            email: email,
            new_deliverables: deliverables,
        });
    } catch (err) {
        throw err;
    }
}

export async function updateUserSpaces(email, spaces) {
    try {
        await axios.put(APP_URL + "/user/update-spaces", {
            email: email,
            new_spaces: spaces
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