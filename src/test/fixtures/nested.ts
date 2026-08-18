interface User {
    id: string;
    name: string;
}

export function handleUser(user: User): void {
    if (user.id) {
        console.log("Found user:", user.name);
        try {
            const data = JSON.stringify(user);
            console.log("User JSON:", data);
        } catch (err) {
            console.log("Error stringifying user");
        }
    }
}
