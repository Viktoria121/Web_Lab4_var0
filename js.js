document.addEventListener("DOMContentLoaded", () => {
    const exitButton= document.querySelector(".exit");
    const countToBuy = document.querySelector("#count-to-buy")
    const removeOrder = document.querySelector("#remove-order")
    const productPanel = document.querySelector("#product-panel")
    const initialCart = getCartFromLocalStorage();
    let allPizzas = [];
    renderCart(initialCart);
    updateSummaryPrice();

    fetch("pizzas.json")
        .then((response) => response.json())
        .then((pizzas) => {
            allPizzas = pizzas
            renderProducts(pizzas)
            document.getElementById("count-selected-options").textContent = pizzas.length
        })

    function renderProducts(pizzas) {
        productPanel.innerHTML = "";

        pizzas.forEach((pizza) => {
            const pizzasDiv = document.createElement("div")
            pizzasDiv.className = "product-info"

            const title = pizza.title
                ? `<span class="title" data-title="${pizza.title}">${pizza.title === 'new' ? 'Нова' : 'Популярна'}</span>`
                : ""

            pizzasDiv.innerHTML = `
            ${title}
            <img class="pizza-img" src="${pizza.image}" alt="${pizza.name}" >
            <span class="product-name">${pizza.name}</span>
            <span class="description">${pizza.description}</span>
            <span class="composition">${pizza.composition}</span>
            <div class="size-options">
                ${Object.entries(pizza.sizes).map(([key, data]) => `
                    <div class="size" data-size="${key}">
                        <span class="diameter">
                            <img src="images/size-icon.svg" alt="діаметр">
                            ${data.diameter}
                        </span>
                        <span class="weight">
                            <img src="images/weight.svg" alt="вага">
                            ${data.weight}
                        </span>
                        <span class="select-size-product-price">${data.price}</span>
                        <span class="currency">грн</span>
                        <button class="add-to-basket">Купити</button>
                    </div>
                `).join("")}
            </div>                
        `;

            productPanel.appendChild(pizzasDiv);
        });
    }

    function renderCart(cart) {
        const container = document.querySelector("#order-products");
        container.innerHTML = "";

        cart.forEach((item, index) => {
            const el = document.createElement("div");
            el.className = "order-product";

            el.innerHTML = `
            <p class="name-product">${item.name} (${item.sizeText})</p>
            <span class="product-size">
                <span class="diameter">
                    <img class="image-help" src="images/size-icon.svg" alt="діаметр">
                    ${item.diameter}
                </span>
                <span class="weight">
                    <img class="image-help" src="images/weight.svg" alt="вага">
                    ${item.weight}
                </span>
            </span>
            <span class="count-and-price">
                ${item.price * item.count}грн
                <button class="reduce" data-button="button" data-index="${index}">—</button>
                <span class="count">${item.count}</span>
                <button class="increase" data-button="button" data-index="${index}">+</button>
                <button class="cancel" data-button="button" data-index="${index}">x</button>
            </span>
            <img class="order-product-image" src="${item.image}" alt="піца">
        `;

            container.appendChild(el);
        });

        updateSummaryPrice();
        updateCountTOBuy();
    }

    function updateCountTOBuy(){
        countToBuy.textContent = document.querySelectorAll("#order-products > *").length
    }

    function getCartFromLocalStorage(){
        return JSON.parse(localStorage.getItem("cart")) || []
    }

    function saveCartToStorage(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function updateSummaryPrice(){
        const cart = getCartFromLocalStorage();
        let sum=0;

        cart.forEach(product =>{
            sum += product.price * product.count
        })
        document.querySelector(".summary-price").textContent = `${sum} грн`;
    }

    productPanel.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-basket")) {
            const sizeDiv = e.target.closest(".size");
            const productInfo = e.target.closest(".product-info");

            const item = {
                name: productInfo.querySelector(".product-name").textContent,
                size: sizeDiv.dataset.size,
                sizeText: sizeDiv.dataset.size === "small" ? "Мала" : "Велика",
                diameter: sizeDiv.querySelector(".diameter").textContent.trim(),
                weight: sizeDiv.querySelector(".weight").textContent.trim(),
                price: parseFloat(sizeDiv.querySelector(".select-size-product-price").textContent),
                count: 1,
                image: productInfo.querySelector(".pizza-img").getAttribute("src")
            };

            const cart = getCartFromLocalStorage();
            const existingItem = cart.find(
                (p) => p.name === item.name && p.size === item.size
            );

            if (existingItem) {
                existingItem.count += 1;
            } else {
                cart.push(item);
            }

            saveCartToStorage(cart);
            renderCart(cart);
            updateSummaryPrice();
        }
    });

    document.querySelector("#order-products").addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        const cart = getCartFromLocalStorage();

        if (e.target.classList.contains("cancel")) {
            cart.splice(index, 1);
        }
        if (e.target.classList.contains("reduce")) {
            if (cart[index].count > 1) {
                cart[index].count--;
            } else {
                cart.splice(index, 1);
            }
        }
        if (e.target.classList.contains("increase")) {
            cart[index].count++;
        }

        saveCartToStorage(cart);
        renderCart(cart);
        updateSummaryPrice();
    });

    document.querySelector("#all-options").addEventListener("click", (e) =>{
        if(e.target.classList.contains("optional")){
            document.querySelectorAll(".optional").forEach(option =>{
                option.dataset.selectOptions = "no-select"
            })
            e.target.dataset.selectOptions="select"

            const selectedCategory = e.target.textContent.trim()
            const modifiedCategory = e.target.textContent.trim().slice(0, -1) + "а";

            if (selectedCategory === "Усі") {
                renderProducts(allPizzas);
            } else {
                const filtered = allPizzas.filter(pizza =>
                    pizza.description.includes(selectedCategory) ||
                    (pizza.description.includes(modifiedCategory))
                );
                renderProducts(filtered);
            }

            document.getElementById("count-selected-options").textContent = document.querySelectorAll(".product-info").length;
        }
    })

    removeOrder.addEventListener("click", () => {
        localStorage.removeItem("cart");
        renderCart([]);
    });

    exitButton.addEventListener("click", () => {
        if (window.opener != null) {
            window.close();
        } else {
            alert("Цю вкладку неможливо закрити скриптом.");
        }
    })
})