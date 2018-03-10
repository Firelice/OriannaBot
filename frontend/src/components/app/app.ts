import Vue from "vue";
import Component from "vue-class-component";

import Sidebar from "../sidebar/sidebar.vue";
import Error from "../error/error.vue";
import { API_HOST } from "../../config";

interface ErrorDetails {
    title: string;
    details: string;
    showLogin: boolean;
}

const ERRORS: { [key: number]: ErrorDetails } = {
    401: {
        title: "Not Authenticated",
        details: "To perform this action, you need to be logged in. Log in, then try what you were doing again.",
        showLogin: true
    },
    403: {
        title: "No Permissions",
        details: "It looks like you don't have permissions to do this. Double check that what you were trying to do makes sense.",
        showLogin: false
    },
    500: {
        title: "Oops",
        details: "Something went horribly wrong trying to process your request. Uhh... try again I guess?",
        showLogin: false
    }
};

@Component({
    components: {
        Error,
        Sidebar
    }
})
export default class App extends Vue {
    private error: null | ErrorDetails = null;
    private user: object | null = null;

    async mounted() {
        // We use fetch instead of the GET helper because we don't want to error if the user isn't logged in.
        const req = await fetch(API_HOST + "/api/v1/user", { credentials: "include" });
        this.user = req.status === 200 ? await req.json() : null;
    }

    /**
     * Makes a GET request to the specified API endpoint. If the endpoint returns
     * an error, it is handled here. If the endpoint returns 404, null is returned.
     * Else, the returned JSON is cast to the specified generic type.
     */
    public async get<T>(url: string): Promise<T | null> {
        const req = await fetch(API_HOST + url, { credentials: "include" });

        if (ERRORS[req.status]) {
            this.error = ERRORS[req.status];
            return null;
        }

        return req.status === 404 ? null : await req.json();
    }

    /**
     * Makes a POST/PUT/PATCH/DELETE request to the specified API endpoint. If
     * the endpoint returns an error, it is handled here.
     */
    public async submit<T = void>(url: string, method: string, data: any): Promise<null | T> {
        const req = await fetch(API_HOST + url, {
            method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (ERRORS[req.status]) {
            this.error = ERRORS[req.status];
        }

        return await req.json();
    }
}