const email = document.getElementById('email');
const changePassBtn = document.getElementById('change-pass-btn');
const addProductBtn = document.getElementById('add-products-btn');
const parentInput = document.getElementById('input');
const parentBtn = document.getElementById('button');
const parentAddProducts = document.getElementById('add-products');
const mainParent = document.getElementById('insert-dynamic-elements');
let inputValue = '', inputProductNameValue = '', inputProductPriceValue = '';
let inputProductDescValue = '', inputProductInStockValue = '', inputProductImgValue = '';

changePassBtn.addEventListener('click', changePassword);
addProductBtn.addEventListener('click', addNewProductToFile);

function changePassword() {
    clearElements();
    parentAddProducts.innerHTML = "";
    const label = document.createElement('label');
    const input = document.createElement('input');
    const button = document.createElement('button');
    const close = document.createElement('button');

    label.innerText = 'New Password';
    label.classList.add('label-change-pass');
    input.type = 'text';
    input.classList.add('input');
    input.placeholder = 'New Password';
    button.innerText = 'Submit';
    button.style.marginRight = '20px';
    button.classList.add('btn-submit');
    close.innerText = 'Close';
    close.classList.add('btn-submit');
    
    button.addEventListener('click', updatePasswordToUser);
    close.addEventListener('click', closeForm);
    
    parentInput.appendChild(label);
    parentInput.appendChild(input);
    parentBtn.appendChild(button);
    parentBtn.appendChild(close);
    parentInput.appendChild(parentBtn);
    mainParent.appendChild(parentInput);
    inputValue = input.value;
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
    clearAddProductsElement();
}

function addNewProductToFile() {
    clearAddProductsElement();
    parentInput.innerHTML = "";

    const productNameLabel = document.createElement('label');
    const productPriceLabel = document.createElement('label');
    const productDescLabel = document.createElement('label');
    const productInStockLabel = document.createElement('label');
    const productImgLabel = document.createElement('label');
    const productName = document.createElement('input');
    const productPrice = document.createElement('input');
    const productDesc = document.createElement('input');
    const productInStock = document.createElement('input');
    const productImg = document.createElement('input');
    const button = document.createElement('button');
    const close = document.createElement('button');
    
    productNameLabel.innerText = 'Product Name';
    productNameLabel.classList.add('label-products');
    productName.type = 'text';
    productName.placeholder = 'Product Name';
    productName.classList.add('input');

    productPriceLabel.innerText = 'Product Price';
    productPriceLabel.classList.add('label-products');
    productPrice.type = 'number';
    productPrice.placeholder = 'Product Price';
    productPrice.classList.add('input');

    productDescLabel.innerText = 'Product Description';
    productDescLabel.classList.add('label-products');
    productDesc.type = 'text';
    productDesc.placeholder = 'Product Description';
    productDesc.classList.add('input');

    productInStockLabel.innerText = 'Product Qauntity';
    productInStockLabel.classList.add('label-products');
    productInStock.type = 'number';
    productInStock.placeholder = 'Product Qauntity';
    productInStock.classList.add('input');
    
    productImgLabel.innerText = 'Product Image';
    productImgLabel.classList.add('label-products');
    productImg.type = 'file';
    productImg.classList.add('file');

    button.innerText = 'Add Product';
    button.style.marginRight = '20px';
    button.classList.add('btn-submit');
    close.innerText = 'Close';
    close.classList.add('btn-submit');
    
    button.addEventListener('click', updateProductToFile);
    close.addEventListener('click', closeForm);

    parentAddProducts.appendChild(productNameLabel);
    parentAddProducts.appendChild(productName);
    parentAddProducts.appendChild(productPriceLabel);
    parentAddProducts.appendChild(productPrice);
    parentAddProducts.appendChild(productDescLabel);
    parentAddProducts.appendChild(productDesc);
    parentAddProducts.appendChild(productInStockLabel);
    parentAddProducts.appendChild(productInStock);
    parentAddProducts.appendChild(productImgLabel);
    parentAddProducts.appendChild(productImg);
    parentBtn.appendChild(button);
    parentBtn.appendChild(close);
    parentAddProducts.appendChild(parentBtn);
    mainParent.appendChild(parentAddProducts);
}

function updateProductToFile() {
    let xhr = new XMLHttpRequest;
    xhr.addEventListener('load', (event) => {
        let response = JSON.parse(event.target.responseText);
        if (response.status) {
            alert('Products Added Successfully');
        } else {
            alert('Error Occured while updating your Password, Please Try Later');
        }
    });
    xhr.open('POST', '/admin/add_products', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        productName: parentAddProducts.childNodes[1].value,
        productPrice: parentAddProducts.childNodes[3].value,
        productDescription: parentAddProducts.childNodes[5].value,
        productInStock: parentAddProducts.childNodes[7].value,
        productImgValue: parentAddProducts.childNodes[9].files[0].name  
    }));
    clearAddProductsElement();
}

function clearElements() {
    while (parentInput.firstChild) {
        parentInput.removeChild(parentInput.firstChild);
    }
    while (parentBtn.firstChild) {
        parentBtn.removeChild(parentBtn.firstChild);
    }
}

function clearAddProductsElement() {
    while (parentAddProducts.firstChild) {
        parentAddProducts.removeChild(parentAddProducts.firstChild);
    }
    while (parentBtn.firstChild) {
        parentBtn.removeChild(parentBtn.firstChild);
    }
}