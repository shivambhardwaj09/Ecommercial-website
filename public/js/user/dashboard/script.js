const email = document.getElementById('email');
const changePassBtn = document.getElementById('change-pass-btn');
const parentInput = document.getElementById('input');
const parentBtn = document.getElementById('button');
const mainParent = document.getElementById('insert-dynamic-elements');
let inputValue = '';

changePassBtn.addEventListener('click', changePassword);

function changePassword() {
    clearElements();
    const label = document.createElement('label');
    const inputNewPassword = document.createElement('input');
    const button = document.createElement('button');
    const close = document.createElement('button');

    label.innerText = 'New Password';
    label.classList.add('label-products');
    inputNewPassword.type = 'password';
    inputNewPassword.setAttribute('placeholder', 'New Password');
    inputNewPassword.classList.add('input');
    button.innerText = 'Submit';
    button.style.marginRight = '20px';
    button.classList.add('btn-submit');
    close.innerText = 'Close';
    close.classList.add('btn-submit');
    
    button.addEventListener('click', updatePasswordToUser);
    close.addEventListener('click', closeForm);

    parentInput.appendChild(label);
    parentInput.appendChild(inputNewPassword);
    parentBtn.appendChild(button);
    parentBtn.appendChild(close);
    parentInput.appendChild(parentBtn);
    mainParent.appendChild(parentInput);
}

function updatePasswordToUser() {
    let xhr = new XMLHttpRequest;
    xhr.addEventListener('load', (event) => {
        let response = JSON.parse(event.target.responseText);
        if (response.status) {
            alert('Password Updated Successfully');
        } else {
            alert('Error Occured while updating your Password, Please Try Later');
        }
    });
    xhr.open('POST', '/user/change_password', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        email: email.innerText,
        password: parentInput.childNodes[1].value
    }));
    clearElements();
}

function closeForm() {
    clearElements();
}

function clearElements() {
    while (parentInput.firstChild) {
        parentInput.removeChild(parentInput.firstChild);
    }
    while (parentBtn.firstChild) {
        parentBtn.removeChild(parentBtn.firstChild);
    }
}