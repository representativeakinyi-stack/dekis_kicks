const supabaseUrl = "https://cbvlvvkvxrimyptxhjqj.supabase.co";
const supabaseKey = "sb_publishable_ER1sZcCbfjSRW9FZUeeT5w_PWGpdnW1";

const client = supabase.createClient(supabaseUrl, supabaseKey);

let cart = [];
let allShoes = [];

/* LOAD SHOES */
async function loadShoes() {
    const { data, error } = await client.from("shoes").select("*");

    if (error) {
        console.log(error);
        return;
    }

    allShoes = data;
    displayShoes(data);
}

/* DISPLAY SHOES */
function displayShoes(shoes) {
    const container = document.getElementById("products");
    container.innerHTML = "";

    shoes.forEach(shoe => {

        const image = shoe.image_url || "https://via.placeholder.com/300";

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${image}">
            <h3>${shoe.name}</h3>
            <p>KSh ${shoe.price}</p>

            <button class="add" onclick='addToCart(${JSON.stringify(shoe)})'>
                Add to Cart
            </button>
        `;

        container.appendChild(card);
    });
}

/* SEARCH */
function filterShoes() {
    const input = document.getElementById("searchInput").value.toLowerCase();

    const filtered = allShoes.filter(shoe =>
        shoe.name.toLowerCase().includes(input)
    );

    displayShoes(filtered);
}

/* CART */
function addToCart(shoe) {
    cart.push(shoe);
    updateCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

function updateCart() {
    document.getElementById("cart-count").innerText = cart.length;

    const box = document.getElementById("cart-box");

    let total = 0;
    let html = "<h3>Your Cart</h3>";

    cart.forEach((item, i) => {
        total += Number(item.price);

        html += `
            <p>
                ${item.name} - KSh ${item.price}
                <button class="remove" onclick="removeItem(${i})">Remove</button>
            </p>
        `;
    });

    html += `<h3>Total: KSh ${total}</h3>`;
    box.innerHTML = html;
}

/* CHECKOUT */
function checkout() {
    if (cart.length === 0) return alert("Cart is empty!");

    let msg = "Hello Dekis_Kicks,%0A%0AI want to order:%0A%0A";

    cart.forEach((item, i) => {
        msg += `${i + 1}. ${item.name} - KSh ${item.price}%0A`;
    });

    window.open(`https://wa.me/254794864204?text=${msg}`, "_blank");
}

/* SAVE ORDER */
async function saveOrder() {

    const name = document.getElementById("customerName").value;
    const phone = document.getElementById("customerPhone").value;
    const county = document.getElementById("customerCounty").value;
    const area = document.getElementById("customerArea").value;
    const notes = document.getElementById("deliveryNotes").value;

    if (!name || !phone || !county || !area) {
        alert("Fill all details");
        return false;
    }

    const items = cart.map(i => i.name).join(", ");
    const total = cart.reduce((s, i) => s + Number(i.price), 0);

    const { error } = await client.from("orders").insert([{
        customer_name: name,
        phone,
        county,
        area,
        notes,
        items,
        total
    }]);

    if (error) {
        alert(error.message);
        return false;
    }

    return true;
}

/* M-PESA */
async function paidNow() {

    if (cart.length === 0) return alert("Cart empty!");

    const saved = await saveOrder();
    if (!saved) return;

    let msg = "I have paid via M-Pesa.%0A%0A";

    cart.forEach((item, i) => {
        msg += `${i + 1}. ${item.name} - KSh ${item.price}%0A`;
    });

    window.open(`https://wa.me/254794864204?text=${msg}`, "_blank");

    cart = [];
    updateCart();
}

/* START */
loadShoes();