// LIST PRODUCTS
let listProductHTML = document.querySelector(".listProduct");
let listProducts = [];

const addProductsToHTML = () => {
    listProductHTML.innerHTML = '';
    if (listProducts.length > 0) {
        listProducts.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('col-6', 'col-md-6', 'col-lg-4', 'product-card');
            newProduct.innerHTML = `
                <div class="card h-100">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}" />
                    <div class="card-body">
                        <h5 class="card-title text-center">${product.name}</h5>
                        <p class="card-text">${product.price}</p>
                        <button type="button" class="addCart btn btn-success">Add To Cart</button>
                    </div>
                </div>
            `;
            listProductHTML.appendChild(newProduct);
        });
    }
};

const loadProducts = () => {
    fetch("products.json")
        .then(response => response.json())
        .then(data => {
            listProducts = data;
            addProductsToHTML();
        });
};

// LISTING SERVICES
let serviceListHTML = document.querySelector(".serviceList");
let serviceList = [];

const addServicesToHTML = () => {
    serviceListHTML.innerHTML = '';
    if (serviceList.length > 0) {
        serviceList.forEach(service => {
            let newService = document.createElement('div');
            newService.classList.add('col-6', 'col-md-6', 'col-lg-4', 'service-card');
            newService.innerHTML = `
                <div class="card h-100">
                    <img src="${service.image}" class="card-img-top" alt="${service.name}" />
                    <div class="card-body">
                        <h5 class="card-title text-center">${service.name}</h5>
                        <p class="card-text">${service.description}</p>
                        <button type="button" class="btn btn-primary">Book Now</button>
                    </div>
                </div>
            `;
            serviceListHTML.appendChild(newService);
        });
    }
};

const loadServices = () => {
    fetch("services.json")
        .then(response => response.json())
        .then(data => {
            serviceList = data;
            addServicesToHTML();
        });
};

// Initialize both
loadProducts();
loadServices();

// CLICK EVENT TO ADD PRODUCT TO CART 
listProductHTML.addEventListener('click', (e) => {
    let positionClick = e.target;
})

// ALERTS FOR SUB & CONTACT
function subscription(){
    alert("Thank you for subscribing")
}
function contact(){
    alert("Your message has been sent")
}