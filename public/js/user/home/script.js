const productsDataContainer = document.querySelector('[data-products-container');
const loadMoreButton = document.querySelector('[load-more]');
const mybutton = document.getElementById("myBtn");

let viewId = 0, addCartId = 0, currentIndex = 5;

loadMoreButton.addEventListener('click', loadMoreProductsDataFromFile);

function getViewButtonID(element) {
    viewId = element.id;
    expand();
}

function getCartButtonID(element) {
    addCartId = Number(element.id);
    addProductToCart(addCartId);
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

function loadMoreProductsDataFromFile() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/loadMore', true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send();
    xhr.addEventListener('load', (event) => {
        const productsData = JSON.parse(event.target.responseText);
        console.log(productsData);
        if (currentIndex < productsData.length)
            displayProducts(productsData);
        if (currentIndex >= productsData.length) {
            loadMoreButton.style.display = 'none';
        }
    });
}

function displayProducts(productsData) {
    productsData.forEach((product, index) => {
        if (index >= currentIndex && index < currentIndex + 5) {

            const center = document.createElement('center');
            const div = document.createElement('div');
            const img = document.createElement('img');
            const h4I = document.createElement('h4');
            const h4II = document.createElement('h4');
            const addToCartBtn = document.createElement('button');
            const button = document.createElement('button');
            const span = document.createElement('span');

            div.classList.add('product');
            img.setAttribute('src', product.src);
            h4I.innerText = product.title;
            h4II.innerText = `Rs. ${product.price}`;
            addToCartBtn.innerText = 'Add To Cart';
            addToCartBtn.classList.add('btn-add-to-cart');
            addToCartBtn.id = product.id;
            addToCartBtn.addEventListener('click', sendAddToCartBtnId);
            addToCartBtn.style.marginRight = '5px';
            getAddedCartItems((object) => {
                if (object[product.id]) {
                    const addToCartBtn = document.getElementById(product.id);
                    addToCartBtn.disabled = true;
                    addToCartBtn.innerText = 'Added';
                }
            });
            button.innerText = 'View';
            button.classList.add('popup');
            button.id = product.id;
            button.addEventListener('click', showDescription);
            button.dataset.expandMore;
            span.classList.add('popuptext');
            span.dataset.expandMsg;
            span.id = product.id
            span.innerHTML = `Desc = ${product.description} <br> Instock = ${product.stock}`;

            button.appendChild(span);
            div.appendChild(img);
            div.appendChild(h4I);
            div.appendChild(h4II);
            div.appendChild(addToCartBtn)
            div.appendChild(button);
            center.appendChild(div);
            productsDataContainer.appendChild(center);
        }
    });
    currentIndex = currentIndex + 5;
}

function showDescription(event) {
    viewId = event.target.id;
    expand();
}

function sendAddToCartBtnId(event) {
    addCartId = Number(event.target.id);
    addProductToCart(addCartId);
}

function addProductToCart(addCartId) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/add_to_cart', true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({
        productId: addCartId
    }));
    xhr.addEventListener('load', (err, event) => {
        if (err) {
            getAddedCartItems((object) => {
                if (object[addCartId]) {
                    const addToCartButton = document.getElementById(addCartId);
                    addToCartButton.disabled = true;
                    addToCartButton.innerText = 'Added';
                }
            });
            return;
        }
        const response = JSON.parse(event.target.responseText);
        if (!response.status) {
            alert(response.message);
        }

    });
}

function getAddedCartItems(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/cart_items', true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send();
    xhr.addEventListener('load', (event) => {
        const response = JSON.parse(event.target.responseText);
        callback(response.cartItems);
    });
}

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {
    scrollFunction()
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}