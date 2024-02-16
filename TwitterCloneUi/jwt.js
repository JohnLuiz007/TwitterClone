document.addEventListener('DOMContentLoaded', function () {
    // Fetch tweets when the page loads
    loadTweets();

    const tweetForm = document.getElementById('tweetForm');

    tweetForm.addEventListener('submit', function (event) {
        event.preventDefault();
        postTweet();
    });
});

async function loadTweets() {
    try {
        //1.get followed users
        //2.get user post
        //3.get the post of each followed user
        //4.concat all post to an array
        //5.sort all post based on time of posting
        //6.display to Frontend

        const jwtToken = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        var postArr = new Array();
        var users = new Array();

        const usernameURL = `http://localhost:3000/api/v1/users/${username}/following`;
        const postURL = "http://localhost:3000/api/v1/posts";

        const get_follower = await fetch(usernameURL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
            },
        });

        //Step1. get followed users
        if (get_follower.ok) {
            users = await get_follower.json();
            console.log("Users:", users);
            //users.forEach
        }
        else {
            console.error("Something went wrong", get_follower.status, get_follower.statusText);
        }

        //Step2.get own user's post
        const response = await fetch(postURL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
            },
        });

        console.log("Response Status:", response.status);

        if (response.ok) {
            // Parse and process the response if needed
            const data = await response.json();
            console.log("Response Data:", data);

            postArr = data;

        } else {
            console.error("Error loading tweets:", response.status, response.statusText);
        }

        //Step3.get post of all followed users
        //join all retrieved post in one array
        users.forEach(async (follower) => {
            try {
                const fPost = await fetch(`${postURL}?username=${follower}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${jwtToken}`,
                    },
                });
        
                if (fPost.ok) {
                    const fdata = await fPost.json();  
                    postArr = postArr.concat(fdata);
                    console.log("Post:", postArr);
                } else {
                    console.error("Error loading tweets:", fPost.status, fPost.statusText);
                }
            } catch (error) {
                console.error("Error loading tweets:", error.message);
            }
        });
        //Step4.sort all retrieved post based on time of posting
        //Source: https://www.javascripttutorial.net/array/javascript-sort-an-array-of-objects/
        postArr.sort((a,b) => {
            let compareA = new Date(a.dateTimePosted), compareB = new Date(b.dateTimePosted);
            return compareB - compareA;
        });
        console.log("All Posts:",postArr);
        
        //Step6.display to Frontend
        const container = document.getElementById("container");
        postArr.forEach(postContent => {
            const post = document.createElement("div");
            post.classList.add("post");
            post.innerHTML = `
                <div style="background: grey; padding: 60px; border-radius: 100px; margin-right: 20px; width: 20px; height: 20px;
                    display: flex; flex-direction: row; margin-top: 10px;">
                    <div id="user-profile">
                        <!-- You can include user profile information here -->
                        <p>${postContent.postedBy}</p>
                        </div>
                    </div>
                    <div style="background-color: darkgrey; padding: 50px; border-radius: 20px; width: 400px; font-size: 16px; 
                    display:flex; flex-direction: column; margin-top: 10px; overflow: hidden; word-wrap: break-word;">
                    <div class="post-content">
                        <p style="color: dark-green; font-size: 14px; font-weight: 600px; display: flex; flex-align: start; position: relative; top: -15px; left: -10px; "
                        <p>${postContent.content}</p>
                    </div>
                </div>
            `;
            container.appendChild(post);
        });

    } catch (error) {
        console.error("Error loading tweets:", error.message);
    }
}

async function postTweet() {
    try {
        const tweetContent = document.getElementById('tweetContent').value;

        // Validate tweet content
        if (!tweetContent) {
            console.error("Tweet content is required.");
            return;
        }
        //token is retrieved from localStorage for Post request
        const jwtToken = localStorage.getItem('token');

        const response = await fetch("http://localhost:3000/api/v1/posts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: tweetContent,
            }),
        });

        if (response.ok) {
            // Handle successful tweet post (e.g., update UI, load updated tweets, etc.)
            console.log('Tweet posted successfully');
            loadTweets(); // Reload tweets after posting
        } else {
            console.error("Error posting tweet:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error posting tweet:", error.message);
    }
}

function logout() {
    try {
        // Remove token and username from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        // Redirect to the login page or perform any other desired action
        window.location.href = 'login.html'; // Change 'login.html' to your actual login page
    } catch (error) {
        console.error("Error during logout:", error.message);
    }
}
