const h5 = document.querySelectorAll('[data-h5]');
const buttonParent = document.querySelectorAll('[data-button-parent]');
let viewId = 0, addCartId = 0, countQuantity;
let minusQuantityBtn, plusQuantityBtn;

function getButtonId(element, str) {
    h5.forEach(innerh5 => {
        buttonParent.forEach(parent => {
            if (innerh5.id === element.id && parent.id === element.id) {
                countQuantity = Number(innerh5.innerText);
                if (str === 'PLUS') {
                    plusQuantityBtn = element;
                    if ((countQuantity+1) > Number(element.dataset.productStock)) {
                        plusQuantityBtn.disabled = true;
                        return;
                    }
                    innerh5.innerText = ++countQuantity;
                    parent.childNodes[1].disabled = false;
                } else if (str === 'MINUS') {
                    minusQuantityBtn = element;
                    if ((countQuantity-1) < 0) {
                        minusQuantityBtn.disabled = true;
                        parent.childNodes[3].disabled = false;
                        return;
                    }
                    innerh5.innerText = --countQuantity;
                }
            }
        });
    });
}

// FUNCTIONS CREATED TO SHOW THE POPUP OF PRODUCT DESCRIPTION
function getViewButtonID(element) {
    viewId = element.id;
    expand();
}

function expand() {
    const popups = document.querySelectorAll(".popuptext");
    popups.forEach(popup => {
        if (matchId(viewId, popup)) {
            popup.classList.toggle("show");
        }
    });
}

function matchId(id, element) {
    if (id === element.id)
        return true;
}

// FUNCTION CREATED TO DELETE THE PRODUCT/REMOVE THE PRODUCT FROM THE CART
function getCartButtonID(element) {
    addCartId = Number(element.id);
    deleteProductFromCart(addCartId);
}

function deleteProductFromCart(addCartId) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'cart/remove_item', true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({
        productId: addCartId
    }));
    xhr.addEventListener('load', (event) => {
        const response = event.target.responseText;
        // if (!response.status) {
        //     alert(response.message);
        // }
        if (response) {
            window.location.href = 'http://localhost:5000/user/cart';
        }
    });
}