// Add timeline element
(() => {
    let form = document.getElementById("addTimelineEventForm");
    
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            
            if (!document.cookie) {
                alert('No auth');
                return;
            }

            let authValue = document.cookie.replace(/(?:(?:^|.*;\s*)aaauuuttthhh\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            let data = {};

            return fetch(form.action, {
                body: JSON.stringify(data),
                headers: {
                    'content-type': 'application/json',
                    'authorization': 'Bearer ' + authValue
                },
                method: 'POST'
            })
            .then((response) => {
                return response.text().then((text) => {
                    return {
                        response: response,
                        text: text
                    };
                });
            })
            .then((responseData) => {
                if (responseData.response.ok) {
                    window.location.reload(true);
                } else {
                    alert(responseData.text);
                }
            });
        });
    }
})();

// Delete timeline element

function removeEvent(event) {
    let target = event.target;

    if (!target.attributes.href) {
        console.log('not a link');
        return;
    }

    event.preventDefault();

    if (!document.cookie) {
        alert('No auth');
        return;
    }

    let authValue = document.cookie.replace(/(?:(?:^|.*;\s*)aaauuuttthhh\s*\=\s*([^;]*).*$)|^.*$/, "$1");

    return fetch(target.attributes.href.value, {
        headers: {
            'authorization': 'Bearer ' + authValue
        },
        method: 'DELETE'
    })
    .then((response) => {
        return response.text().then((text) => {
            return {
                response: response,
                text: text
            };
        });
    })
    .then((responseData) => {
        if (responseData.response.ok) {
            target.parentNode.removeChild(target);
        } else {
            alert(responseData.text);
        }
    });
}

(() => {
    let list = document.getElementById('timelinelist');
    list.addEventListener('click', removeEvent);
})();