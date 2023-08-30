const API_KEY = `ZmoeZcqh2EmYtwsMcoJLTL1nhFXEI9nrT3j3LXmK`
const NASA_URL = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
const POST_ERROR_MSG = `<p class="text-danger postErrorMessage"><strong>There was an error sending the comment to the server. Please try again later.</strong></p>`
const MAX_LOGIN_LEN = 24
const CURRENT_DATE = findCurrentDate()
let collapseIdCounter = 0
let collapseId = "myCollapse0"
let startDate = null            // for the start fetch
let endDate = null              // for the end fetch
let html = ''
let commentListeners = []       // to store ids of each image (for comments)
let userName = ''
let firstDate = null            // what the first image the user see on page
let updateStatus = new Map()    // key: id of image , value: last update
let intervalId = null


/**
 * find the current date in yyyy-mm-dd format
 * @returns {string} - string of the date in yyyy-mm-dd format
 */
function findCurrentDate() {
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 2);
    return currentDate.toISOString().split('T')[0];

}


/**
 * a module for all string validation functions
 * @type {{validateOneWord: (function(*): boolean), validateLengthField: (function(*, *): boolean),
 * onlyLettersAndNumbers: (function(*): boolean), validateNotEmptyField: (function(*): boolean)}}
 */
const validateForm = (function () {

    /**
     * check if the input is empty
     * @param theInput - the string to validate
     * @returns {boolean} - return false if empty
     */
    const validateNotEmptyField = function(theInput) {
        return theInput !== '';
    }

    /**
     * check if the input is one word
     * @param theInput - the string to validate
     * @returns {boolean} - return false if more than one word
     */
    const validateOneWord = function(theInput) {
        return !theInput.includes(" ");
    }

    /**
     * check if the input is not longer than "length"
     * @param theInput - the string to validate
     * @param length - the required length
     * @returns {boolean} - return false if longer than "length"
     */
    const validateLengthField = function(theInput, length) {
        return theInput.length <= length;
    }

    /**
     * check if the input contains only letters (a-z) and numbers
     * @param theInput - the string to validate
     * @returns {boolean} - return false if not contains only letters and/or numbers
     */
    const onlyLettersAndNumbers = function(theInput) {
        return /^[A-Za-z0-9]*$/.test(theInput);
    }


    return {
        validateNotEmptyField: validateNotEmptyField,
        validateOneWord: validateOneWord,
        validateLengthField: validateLengthField,
        onlyLettersAndNumbers: onlyLettersAndNumbers,
    }
})();

/**
 * get new collapse id, so we can know the user press on this button
 * @returns {string} - new id
 */
function getNewCollapseId() {

    // find the numeric characters in the string using a regular expression
    let matches = collapseId.match(/\d+/g);

    // extract the numeric characters and convert them to a number
    let num = Number(matches[0]) + collapseIdCounter;

    // convert the number back to a string
    let numString = String(num);

    // replace the numeric characters in the original string with the new string
    collapseId = collapseId.replace(/\d+/g, numString);

    collapseIdCounter++

    return collapseId
}


document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("usernameForm").addEventListener("submit", handleLogin);
    document.getElementById("chooseDate").addEventListener("submit", displayImg);
    document.getElementById("moreButton").addEventListener("click", displayMoreImg);

});


/**
 * check validation login, if ok - display the main page. if not - display error message
 * @param event
 */
function handleLogin(event) {
    event.preventDefault();

    const input = document.getElementById("loginUsername").value.trim()
    if (validateForm.validateNotEmptyField(input) && validateForm.validateOneWord(input) &&
        validateForm.validateLengthField(input, MAX_LOGIN_LEN) && validateForm.onlyLettersAndNumbers(input)) {
        userName = input
        document.getElementById("userNameError").innerHTML = ''
        document.getElementById("openingScreen").classList.add("d-none")
        document.getElementById("mainPage").classList.remove("d-none")
        document.getElementById("endDate").value = CURRENT_DATE
    }
    else {
        document.getElementById("userNameError").innerHTML =
            `<p class="text-danger">Please enter name with maximum ${MAX_LOGIN_LEN} letters / digits (no spaces)</p>`
    }

}


/**
 * status of the response
 * @param response
 * @returns {Promise<never>|Promise<unknown>}
 */
function status(response) {

    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
}

/**
 * when the user press of the "more" button, get the next images
 * @param event
 */
function displayMoreImg(event) {
    event.preventDefault();
    document.getElementById("spinners").classList.remove("d-none")

    // update the start date to one day back, and the end date to 3 days back
    const convertToDate = new Date(Date.parse(startDate));
    convertToDate.setDate(convertToDate.getDate() - 1);
    endDate = convertToDate.toISOString().slice(0,10);
    convertToDate.setDate(convertToDate.getDate() - 2);
    startDate = convertToDate.toISOString().slice(0,10);

    fetchForMoreImages()
}


/**
 * after the user press choose, update start and end dates, and display the images
 * @param event
 */
function displayImg(event) {
    event.preventDefault();

    document.getElementById("moreButton").classList.add("d-none")
    document.getElementById("spinners").classList.remove("d-none")
    document.getElementById("errorMessageForImg").classList.add("d-none")

    // get the date from the user (string)
    endDate = document.getElementById("endDate").value

    // convert the string to Date
    const convertToDate = new Date(Date.parse(endDate));

    // update the start date to the (user_date - 2_days)
    startDate = convertToDate
    startDate.setDate(convertToDate.getDate() - 2);

    // get the start date in format yyyy-mm-dd
    startDate = startDate.toISOString().slice(0,10);

    html = ''
    commentListeners = []
    firstDate = endDate
    document.getElementById("addImg").innerHTML = html
    fetchForMoreImages()

}

/**
 * get from the server the comments by image id
 * @param imgID
 */
function fetchComments(imgID) {

    fetch(`/api/getComments?id=${imgID}`)
        .then(status)
        .then(function(response) {
            return response.json();
        }).then(function(json) {
            buildComments(json, imgID);
    })
        .catch(function(error) {
            document.getElementById("GeneralErrorMessage").classList.remove("d-none")
            document.getElementById("GeneralErrorMessage").scrollIntoView();
            setTimeout(function() {
                document.getElementById("GeneralErrorMessage").classList.add("d-none")
            }, 4000);
        });

}

/**
 * fetch 3 more images from NASA , display, then listener to each comment section of image,
 * and fetch the comments from the server, and add the polling
 */
function fetchForMoreImages() {

    fetch(`${NASA_URL}&start_date=${startDate}&end_date=${endDate}`)
        .then(status)
        .then(res => res.json())
        .then(json => {
            html = ''
            // build the images and the info
            json.reverse().forEach(function(item){
                html += createMorePics(item.url, item.date, item.title, item.explanation, item.copyright, item.media_type)
            })
            document.getElementById("addImg").innerHTML += html
            // add listener for comments
            commentListeners.forEach(elementId => {
                const element = document.getElementById(elementId);
                element.addEventListener('click', updateCommentList);
                fetchComments(elementId)
            });

            document.getElementById("moreButton").classList.remove("d-none")
            document.getElementById("spinners").classList.add("d-none")
        })
        .catch(function(err) {
            document.getElementById("errorMessageForImg").classList.remove("d-none")
            document.getElementById("spinners").classList.add("d-none")
            clearInterval(intervalId)
            console.log(err)
        }).finally(function() {
        // always executed
    });

    // polling
    intervalId = setInterval(pollServer, 15000);
}

// this function build 2 rows: first row with the image and details (list), and the second row with the comments section
// returns the html with all the data
/**
 * this function build 2 rows: first row with the image and details (list),
 * and the second row with the comments section returns the html with all the data
 * @param url - the url of the image
 * @param date - date of the image
 * @param title - title of the image
 * @param explanation - explanation of the image
 * @param copyright - copyright of the image
 * @param media_type - type of the file (image/video)
 * @returns {string} - the html
 */
function createMorePics(url, date, title, explanation, copyright, media_type) {

    let htmlData = ``
    const newCollapseId = getNewCollapseId()
    htmlData += `<div class="row my-3 mx-5"><div class="col-md-6">`
    if (media_type === 'video') {  // if the file is of video type
        htmlData += `<div class="ratio ratio-16x9"><iframe src="${url}" style="max-width: 100%;height: 100%;" title="video" allowfullscreen></iframe></div>`
    }
    else if (media_type === 'image') {  // if the file is of image/gif type
        htmlData += `<img class="img-thumbnail" width="400" src="${url}" alt="nasa image"/>`

    }
    else {      // undefined type
        htmlData += `<p>Cannot upload this file.</p>`
    }
    htmlData += `</div><div class="col-md-6"><ul class="list-group">
      <li class="list-group-item list-group-item-success"><strong class="text-info">Date:</strong> ${date}</li><li class="list-group-item list-group-item-success"><strong class="text-info">Title:</strong> ${title}</li>
      <li class="list-group-item list-group-item-success"><div class="overflow-auto" style="height: 150px;"><strong class="text-info">Explanation:</strong> ${explanation}</div></li>
      <li class="list-group-item list-group-item-success"><strong class="text-info">Copyright:</strong> ${copyright}</li></ul></div></div><div class="row my-3 mx-5 text-start">
      <div class="col-12"><button type="button" class="btn btn-primary" data-bs-toggle="collapse" data-bs-target="#${newCollapseId}">Comments</button>
      <div id="${newCollapseId}" class="collapse my-1"><ul class="list-group" id="${url}"></ul><textarea class="form-control mt-2" rows="3" maxLength="128" placeholder="Leave a comment here..."></textarea>
      <div class="input-group-btn"><button type="button" class="btn btn-success mt-1" id="${date}">send</button>
      </div></div></div></div><br>`

    commentListeners.push(`${date}`)
    return htmlData;

}


/**
 * send to the server the comment so the server will be updated, and get the comments from the server
 * @param event
 */
function updateCommentList (event) {
    event.preventDefault();

    const imgId = event.target.id
    const comment = event.target.parentNode.previousElementSibling.value.trim()
    if (validateForm.validateNotEmptyField(comment)) {  // if true - comment is not empty
        fetch("/api/postComments", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"imgDate": imgId, "userNameComment": userName, "comment": comment})
        }).then(status)
            .then(function(response) {
            return response.json();
        }).then(function(json) {
            fetchComments(json.imgDate)
        }).catch(function(err) {
            event.target.insertAdjacentHTML('afterend', POST_ERROR_MSG);
            setTimeout(function() {
                for(const msg of document.getElementsByClassName("text-danger postErrorMessage"))
                    msg.remove()
            }, 4000);

        }).finally(function() {
            // always executed
        });
    }

}

/**
 * delete comments if the user can delete
 * @param event
 */
function deleteComments(event) {
    event.preventDefault();

    const imgId = event.target.parentNode.parentNode.parentNode.lastElementChild.lastElementChild.id
    const commentId = event.target.parentNode.id

    fetch(`/api/deleteComm?id=${imgId}&commentId=${commentId}&name=${userName}`, {
        method: "DELETE"
    })
        .then(status)
        .then(function(response) {
            return response.json();
        }).then(function(json) {
        event.target.parentElement.remove()
    })
        .catch(function(error) {
            document.getElementById("GeneralErrorMessage").classList.remove("d-none")
            document.getElementById("GeneralErrorMessage").scrollIntoView();
            setTimeout(function() {
                document.getElementById("GeneralErrorMessage").classList.add("d-none")
            }, 4000);
        });

}


/**
 * polling every 15 seconds to see if there is need to update the html
 */
function pollServer() {
  // Make a request to the server to get the latest data
  fetch(`/api/polling?first=${firstDate}&last=${startDate}`)
    .then(response => response.json())
    .then(json => {
        // check if the timestamp is lower or - and then update DOM
        for(const item of json) {
            if (Number(updateStatus.get(item.id)) < Number(item.list.lastUpdate) || !(updateStatus.has(item.id))) {
                updateStatus.set(item.id, item.list.lastUpdate)
                buildComments(item.list, item.id)
            }
        }
    }).catch(function(error) {
      document.getElementById("GeneralErrorMessage").classList.remove("d-none")
      document.getElementById("GeneralErrorMessage").scrollIntoView();
      setTimeout(function() {
          document.getElementById("GeneralErrorMessage").classList.add("d-none")
      }, 4000);
  });
}

/**
 * build the html comments section with list and delete button (if needed)
 * @param json
 * @param imgID
 */
function buildComments(json, imgID) {

    let list = ``
    json.listOfComments.forEach(function (item) { // over the list of comments and make the html
        list += `<li class="list-group-item list-group-item-warning" id="${item.id}"><strong>${item.user}:</strong> ${item.text}`
        if (userName === item.user) {
            list += `<button class="btn btn-danger float-end ${userName}">Delete</button>`
        }
        list += `</li>`

    })

    const imageId = document.getElementById(imgID)
    // get to the location of the list in the html and update the list
    imageId.parentNode.previousSibling.previousSibling.previousElementSibling.innerHTML = list
    imageId.parentNode.previousElementSibling.value = ''  // clear textarea

    updateStatus.set(imgID, Number(json.lastUpdate))
    // for the deleted buttons
    let deleteButtons = document.getElementsByClassName(`btn btn-danger float-end ${userName}`)
    for (button of deleteButtons)
        button.addEventListener('click', deleteComments);
}
