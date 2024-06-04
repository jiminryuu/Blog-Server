document.addEventListener("DOMContentLoaded", () => {
    // Check if a user is already logged in
    let loggedIn = getCookie("username");
    let loginPage = document.getElementById("login-page");
    let contentPage = document.getElementById("content-page");
    
    if (loggedIn != null) {
        // If a user gives a cookie, then it is already logged in
        showContent();
        getblog_posts();
    } else {
        // If no user is logged in, show the login page
        showLogin();
    }
    

    // hide the content and show login
    function showLogin() {
        loginPage.style.display = "block";
        contentPage.style.display = "none";
        let loginInput = document.getElementById("username")
        loginInput.value = "";
    }
    
    // hide the login and show the content
    function showContent() {
        loginPage.style.display = "none";
        contentPage.style.display = "block";
        let blog_postBox = document.getElementById("post-input")
        blog_postBox.value = "";

    }
    
    
    // Function to get a cookie by name
    function getCookie(name) {
        let cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            //get the desired cookie we are looking for
            let cookieName = cookie.split("=")[0];
            let cookieValue = cookie.split("=")[1];

            //if we found the cookie that we are looking for then return the value of it
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null;
    }



    // Handle the login button click
    let loginButton = document.getElementById("login-button");
    loginButton.addEventListener("click", () => {

        let usernameInput = document.getElementById("username");
        let username = usernameInput.value;

        if (username) {
            // Set a request to the server to send a cookie
            let xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/login',true );
            xhr.setRequestHeader('Content-Type', 'text/plain');
            let data = username;
            xhr.send("name:" + data +"\n")

            xhr.onload = function()
            {
                if(xhr.status === 200) // if we succeed, show the content page and the blog_posts in the database
                {
                    showContent();
                    getblog_posts();
                } else
                {
                    document.getElementById("login-page").textContent = "COULD NOT LOGIN, PLEASE TRY AGAIN LATER"
                }
                
            }

            
            
        }
    });
    


    //handle the post requests to create a new blog_post
    let postButton = document.getElementById("post-button");
    postButton.addEventListener("click", () => {

        if(getCookie("username")) //check that they have a username
        {
            //get the blog_post
            let blog_postInput = document.getElementById("post-input");
            let blog_post = blog_postInput.value;

            if(blog_post) {
                //send a request to add this blog_post to the database to the server
                let xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/blog_post', true);
                xhr.setRequestHeader('Content-Type', 'application/json')
                let user = getCookie("username");
                

                let data = { //turn the blog_post into json
                    input : blog_post,
                    username : user
                }

                data = JSON.stringify(data);
                xhr.send(data);

                xhr.onload = function()
                {
                    getblog_posts();
                }
            }
        } else
        {
            showLogin();
        }



        


    });

    //handle the update requests
    let contentDiv = document.getElementById('content');
    //check if something inside the content div is clicked
    contentDiv.addEventListener('click', function (event) {

        if(getCookie("username")) // check that they have a username
        {
            // Check if the clicked element is a button
            if (event.target.tagName === "BUTTON") {
                // Handle the button click event
                const button = event.target;
                
                // parse the button id to get the id of the message it is refering too
                const id = button.id.replace("update-button", '');

                //get the id of the text box it is refering to and get the value of the text in it
                const textbox = document.getElementById(`post${id}`)
                const text = textbox.value;

                const xhr = new XMLHttpRequest();
                xhr.open('PUT', `/api/blog_post/${id}`, true);
                xhr.setRequestHeader('Content-Type', 'application/json')
                let user = getCookie("username"); //get the user who sent the update request
                

                let data = { //turn the blog_post into json
                    input : text,
                    username : user
                }

                data = JSON.stringify(data);
                xhr.send(data);

                xhr.onload = function()
                {
                    getblog_posts();
                }
            }
        }else
        {
            showLogin();
        }


    });

    //get the blog_posts from the server
    function getblog_posts()
    {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/blog_post', true);
        xhr.send();

        xhr.onload = function() {
            if ( xhr.status === 200)
            {
                let blog_posts = JSON.parse(xhr.response); //get response
                let id = 0
                let HTML = '';
                for(var key in blog_posts){ //for each blog_post, create a new post and an update button
                    id++;
                    console.log(blog_posts[key] + id)

                    HTML += '<div>'
                    let inputHTML = `<input type="text" id="post${id}" value="${blog_posts[key]}" size = "75">`;
                    let buttonHTML =`<button type="button" id="update-button${id}">Update blog_post</button>`;    
                    HTML += inputHTML
                    HTML += buttonHTML
                    HTML += '</div>'
                }

                document.getElementById("content").innerHTML = HTML ;
            } else
            {
                document.getElementById("content").textContent = 'Error fetching data';
            }
        }
    }
    
});