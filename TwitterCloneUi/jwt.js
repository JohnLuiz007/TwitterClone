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
        const jwtToken = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        var postArr = new Array();

        const usernameURL = `http://localhost:3000/api/v1/users/${username}/following`;
        const postURL = "http://localhost:3000/api/v1/posts";

        const response = await fetch(postURL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
            },
        });

        if (response.ok) {
            const data = await response.json();

            for (var post of data){
                postArr.push(post);
            }
            console.log("Step1:", data);
        } else {
            console.error("Error loading tweets:", response.status, response.statusText);
        }

        postArr.sort((a, b) => {
            let compareA = new Date(a.dateTimePosted),
                compareB = new Date(b.dateTimePosted);
            return compareB - compareA;
        });
        console.log("Sorted Posts:", postArr);

        const container = document.getElementById("container");
        container.innerHTML = ""; 

        postArr.forEach(postContent => {
            const post = document.createElement("div");
            post.classList.add("post");
            post.innerHTML = `
            <div style="margin-bottom: 20px;"></div>
            <div style="background: darkgrey; padding: 30px; border-radius: 10px; margin-right: 20px;  height: 30px;
            display: flex; flex-direction: row; margin-top: 20px; max-width: 100%; align-items: center;">
            <div id="user-profile">
                <p>${postContent.postedBy}</p>
            </div>
        </div>

        <div style="background-color: darkgrey; padding: 50px; border-radius: 20px; width: 350px; max-width: 100%; height: 150px;  
            display:flex; flex-direction: column; margin-top: 20px; overflow: hidden; word-wrap: break-word;">
            <div class="post-content">
                <p style="color: dark-green; font-weight: 600px; display: flex; flex-align: start; position: relative; top: -15px; left: -10px; 
                padding-bottom: 10px; max-width: 100%;">
                    ${postContent.content}
                </p>
            </div>
            <p class="post-time">${new Date(postContent.dateTimePosted).toLocaleString()}</p>
            <div style="background-color: none; display: flex; flex-direction: row; margin-top: 10px;">
                <button onclick="likePost('${postContent.id}')" id="btnh1" class="btn"><i class="fas fa-heart"></i></button>    
                <button onclick="Toggle3()" id="btnh3" class="btn"><i class="fab fa-gratipay"></i></button>
            </div>
        </div>`;
            container.appendChild(post);
        });
    } catch (error) {
        console.error("Error loading tweets:", error.message);
    }
}

async function postTweet() {
    try {
        const tweetContent = document.getElementById('tweetContent').value;

        if (!tweetContent) {
            console.error("Tweet content is required.");
            return;
        }

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
            console.log('Tweet posted successfully');
            document.getElementById('tweetContent').value = "";
            loadTweets();
        } else {
            console.error("Error posting tweet:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error posting tweet:", error.message);
    }
}

async function likePost(postId) {
    try {
        const jwtToken = localStorage.getItem('token');

        const response = await fetch(`http://localhost:3000/api/v1/posts/${postId}/like`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
            },
        });

        if (response.ok) {
            console.log('Post liked successfully');
            loadTweets();
        } else {
            console.error("Error liking post:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error liking post:", error.message);
    }
}

function logout() {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error during logout:", error.message);
    }
}
