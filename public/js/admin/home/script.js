const productsDataContainer = document.querySelector('[data-products-container');
const loadMoreButton = document.querySelector('[load-more]');
const productForm = document.getElementById("update-form");
const mybutton = document.getElementById("myBtn");
const button = document.getElementById('button');

let viewId = 0, deleteId = 0, updateId = 0, currentIndex = 5;
let allProducts = [];
let inputtitle = '', inputprice = '', inputdescription = '', inputstock = '';

loadMoreButton.addEventListener('click', loadMoreProductsDataFromFile);

function getViewButtonID(element) {
    viewId = element.id;
    expand();
}

function getDeleteBtnId(element) {
    deleteId = Number(element.id);
    deleteProductFromFile(deleteId);
}

function openLoginFormI(element) {
    topFunction();
    document.body.classList.add('showLoginForm');
    updateId = Number(element.id);
    console.log(updateId);
    getAllProducts();
}

function openLoginFormII(event) {
    topFunction();
    document.body.classList.add('showLoginForm');
    updateId = Number(event.target.id);
    console.log(updateId);
    getAllProducts();
}

function closeLoginForm() {
    document.body.classList.remove('showLoginForm');
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

function getAllProducts() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/all_products', true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send();
    xhr.addEventListener('load', (event) => {
        const productsData = JSON.parse(event.target.responseText);
        allProducts = productsData;
        console.log(productsData);
        openProductUpdateForm(updateId);
    });
}

function loadMoreProductsDataFromFile() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/loadMore', true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send();
    xhr.addEventListener('load', (event) => {
        const productsData = JSON.parse(event.target.responseText);
        if (currentIndex < productsData.length) {
            displayProducts(productsData);
            allProducts = productsData;
        }
        if (currentIndex === productsData.length) {
            loadMoreButton.style.display = 'none';
        }
        console.log(productsData);
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
            const buttons = document.createElement('div');
            const updateBtn = document.createElement('button');
            const viewBtn = document.createElement('button');
            const deleteBtn = document.createElement('button');
            const span = document.createElement('span');

            div.classList.add('product');
            img.setAttribute('src', product.src);

            h4I.innerText = product.title;
            h4II.innerText = `Rs. ${product.price}`;

            buttons.classList.add('button');

            updateBtn.innerText = 'Update';
            updateBtn.classList.add('btn');
            updateBtn.style.marginRight = '3px';
            updateBtn.style.width = '90px';
            updateBtn.id = product.id;
            updateBtn.addEventListener('click', openLoginFormII);

            viewBtn.innerText = 'View';
            viewBtn.classList.add('popup');
            viewBtn.id = product.id;
            viewBtn.addEventListener('click', showDescription);
            viewBtn.dataset.expandMore;

            deleteBtn.innerText = 'Delete';
            deleteBtn.classList.add('btn');
            deleteBtn.style.marginLeft = '3px';
            deleteBtn.style.width = '90px';
            deleteBtn.id = product.id;
            deleteBtn.addEventListener('click', sendDeleteBtnID);

            span.classList.add('popuptext');
            span.dataset.expandMsg;
            span.id = product.id
            span.innerHTML = `Desc = ${product.description} <br> Instock = ${product.stock}`;
            viewBtn.appendChild(span);

            div.appendChild(img);
            div.appendChild(h4I);
            div.appendChild(h4II);
            buttons.appendChild(updateBtn);
            buttons.appendChild(viewBtn);
            buttons.appendChild(deleteBtn);
            div.appendChild(buttons);
            center.appendChild(div);
            productsDataContainer.appendChild(center);
        }
    });
    currentIndex = currentIndex + 5;
}

function openProductUpdateForm(updateId) {
    clearElements();

    readAllProducts(updateId, (product) => {
        const popupOverlay = document.createElement('div');
        const updateProductPopup = document.createElement('div');
        const popupClose = document.createElement('div');
        const form = document.createElement('div');
        const avatar = document.createElement('div');
        const img = document.createElement('img');
        const header = document.createElement('div');
        const title = document.createElement('div');
        const inputTitle = document.createElement('input');
        const price = document.createElement('div');
        const inputPrice = document.createElement('input');
        const description = document.createElement('div');
        const inputDescription = document.createElement('input');
        const inStock = document.createElement('div');
        const inputInStock = document.createElement('input');
        const hidden = document.createElement('div');
        const inputHidden = document.createElement('input');
        const btnElement = document.createElement('div');
        const btnSubmit = document.createElement('button');
        const btnReset = document.createElement('button');

        popupOverlay.classList.add('popup-overlay');
        updateProductPopup.classList.add('update-product-popup');
        popupClose.classList.add('popup-close');
        popupClose.innerHTML = '&times;';
        popupClose.addEventListener('click', closeLoginForm);
        form.classList.add('form');

        avatar.setAttribute('class', 'avatar');
        img.setAttribute('src', product.src);
        avatar.appendChild(img);

        header.classList.add('header');
        header.innerText = 'Update Product';

        title.classList.add('element');
        inputTitle.type = 'text';
        inputTitle.value = product.title;
        inputTitle.placeholder = 'Title';
        inputTitle.name = 'Title';
        title.appendChild(inputTitle);

        price.classList.add('element');
        inputPrice.type = 'number';
        inputPrice.value = product.price;
        inputPrice.placeholder = 'Price';
        inputPrice.name = 'Price';
        price.appendChild(inputPrice);

        description.classList.add('element');
        inputDescription.type = 'text';
        inputDescription.value = product.description;
        inputDescription.placeholder = 'Description';
        inputDescription.name = 'Description';
        description.appendChild(inputDescription);

        inStock.classList.add('element');
        inputInStock.type = 'number';
        inputInStock.value = product.stock;
        inputInStock.placeholder = 'InStock';
        inputInStock.name = 'InStock';
        inStock.appendChild(inputInStock);

        hidden.classList.add('element');
        inputHidden.type = 'hidden';
        inputHidden.value = product.src;
        hidden.appendChild(inputHidden);

        btnElement.classList.add('element');
        btnSubmit.type = 'submit';
        btnSubmit.innerText = 'UPDATE';
        btnSubmit.id = product.id;
        btnSubmit.addEventListener('click', updateProductToFile);
        btnReset.type = 'reset';
        btnReset.innerText = 'CLEAR';
        btnReset.addEventListener('click', clearFormInputs);
        btnElement.appendChild(btnSubmit)
        btnElement.appendChild(btnReset)

        form.appendChild(avatar);
        form.appendChild(header);
        form.appendChild(title);
        form.appendChild(price);
        form.appendChild(description);
        form.appendChild(inStock);
        form.appendChild(hidden);
        form.appendChild(btnElement);
        updateProductPopup.appendChild(popupClose);
        updateProductPopup.appendChild(form);
        productForm.appendChild(popupOverlay);
        productForm.appendChild(updateProductPopup);
    });
}

function readAllProducts(updateId, callback) {
    const product = allProducts.find(product => {
        return product.id === updateId;
    });
    callback(product);
}

function showDescription(event) {
    viewId = event.target.id;
    expand();
}

function sendDeleteBtnID(event) {
    deleteId = Number(event.target.id);
    deleteProductFromFile(deleteId);
}

function clearElements() {
    while (productForm.firstChild) {
        productForm.removeChild(productForm.firstChild);
    }
}

function updateProductToFile(event) {
    const id = event.target.id;
    const title = productForm.childNodes[1].lastChild.childNodes[2].firstChild.value;
    const price = productForm.childNodes[1].lastChild.childNodes[3].firstChild.value;
    const description = productForm.childNodes[1].lastChild.childNodes[4].firstChild.value;
    const stock = productForm.childNodes[1].lastChild.childNodes[5].firstChild.value;
    const src = productForm.childNodes[1].lastChild.childNodes[6].firstChild.value;
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/admin/update_product', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        id: id,
        title: title,
        price: price,
        description: description,
        stock: stock,
        src: src
    }));
    xhr.addEventListener('load', (event) => {
        const response = JSON.parse(event.target.responseText);
        if (response.status) {
            alert(response.message);
            window.location.href = 'http://localhost:5000/admin';
        } else {
            alert('Error Occured while Updating this product');
        }
    });
}

function clearFormInputs() {
    productForm.childNodes[1].lastChild.childNodes[2].firstChild.value = "";
    productForm.childNodes[1].lastChild.childNodes[3].firstChild.value = "";
    productForm.childNodes[1].lastChild.childNodes[4].firstChild.value = "";
    productForm.childNodes[1].lastChild.childNodes[5].firstChild.value = "";
    productForm.childNodes[1].lastChild.childNodes[6].firstChild.value = "";
}

function deleteProductFromFile(deleteId) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/admin/delete_product', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        productId: deleteId
    }));
    xhr.addEventListener('load', (event) => {
        const response = JSON.parse(event.target.responseText);
        if (response.status) {
            alert(response.message);
            window.location.href = 'http://localhost:5000/admin';
        } else {
            alert('Error Occured while deleting this product');
        }
    });
}

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
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