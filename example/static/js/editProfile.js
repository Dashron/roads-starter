/*document.getElementById('performEditProfile').addEventListener('click', (event) => {
    let refreshToken = document.getElementById('refreshToken').value;
    let requestBody = { "refreshToken": refreshToken };
    // TODO: turn the following data into an http request to edit the refresh token, and ensure that tokens are properly passed.
    // document.getElementById('editProfile').method document.getElementById('editProfile').action requestBody
    let editForm = document.getElementById('editProfile');

    if (!editForm) {
        throw new Error('Could not find necessary edit form');
    }
console.log(editForm);

    let method = editForm.elements["_methodOverride"] ? editForm.elements["_methodOverride"].value : editForm.method;

    console.log(editForm.action, {
        method: method ,
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    
    fetch(editForm.action, {
        method: method ,
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
            "content-type": "application/json",
            // Todo: This is an awful way of handling this. Technically the cookie value should be taken from the config
            // How can we build this in a way that goes through the normal build process?
            "authorization": "Bearer " + document.cookie.replace(/(?:(?:^|.*;\s*)aaauuuttthhh\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        },
        body: JSON.stringify(requestBody)
    }).then((response) => {
        console.log('response', response);
    }).catch((err) => {
        console.log('err', err);
    });
});*/