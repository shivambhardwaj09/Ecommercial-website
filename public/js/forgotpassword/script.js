const emailAddress = document.getElementById('email');
const submitBtn = document.getElementById('submit');

submitBtn.addEventListener('click', forgotPassword);

function forgotPassword() {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (event) => {
        let response = JSON.parse(event.target.responseText);
        if (response.status) {
            window.location.href = `http://localhost:5000/reset_request?username=${response.username}&email=${response.email}&verificationKey=${response.verificationKey}`;
        } else {
            alert(`Provide UserId isn't a part of Iron Kingdom family.`);
        }
    });
    xhr.open('POST', 'forgot_password', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        email: emailAddress.value
    }));
}