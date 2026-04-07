
// using native fetch


const PORT = 3002;
// Use a random email to avoid duplicate key errors
const email = `test_user_${Date.now()}@example.com`;

async function testRegistration() {
    try {
        console.log(`Sending registration request for ${email}...`);
        const response = await fetch(`http://localhost:${PORT}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Test User",
                email: email,
                password: "password123",
                role: "student"
            })
        });

        const status = response.status;
        const data = await response.json();

        console.log(`Response Status: ${status}`);
        console.log(`Response Data:`, data);

        if (status === 201) {
            console.log("TEST PASSED: Registration successful.");
        } else {
            console.log("TEST FAILED: Unexpected status code.");
            process.exit(1);
        }
    } catch (error) {
        console.error("TEST FAILED: Network error or server not running.", error.message);
        process.exit(1);
    }
}

testRegistration();
