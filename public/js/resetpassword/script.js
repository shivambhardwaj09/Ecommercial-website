const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmpassword');
const hidden = document.getElementById('hidden');
const submitBtn = document.getElementById('submit');

submitBtn.addEventListener('click', resetPassword);

function resetPassword() {

    if (password.value !== confirmPassword.value) {
        return alert(`Password doesn't match`);
    }
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (event) => {
        let response = JSON.parse(event.target.responseText);
        if (response.status) {
            alert(response.message);
            window.location.href = `http://localhost:5000/login`;
        } else {
            alert(response.message);
        }
    });
    xhr.open('POST', `/user/password_reset_request?verification_key=${hidden.value}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        password: password.value,
        hidden: hidden.value
    }));
}