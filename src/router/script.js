let total = 0;

function addCart(product, selectId) {

    let price = document.getElementById(selectId).value;

    total += parseInt(price);

    let item = document.createElement("li");

    item.innerText = product + " - ₹" + price;

    document.getElementById("cart").appendChild(item);

    document.getElementById("total").innerText = total;

}

function addKidsPack() {

    total += 99;

    let item = document.createElement("li");

    item.innerText = "Kids Snack Pack - ₹99";

    document.getElementById("cart").appendChild(item);

    document.getElementById("total").innerText = total;

}

function showCheckout() {

    document.getElementById("checkout").style.display = "block";

}

function payment() {

    let name = document.getElementById("name").value;

    if (name == "") {
        alert("Please enter delivery details");
    }
    else {
        alert("Payment Successful! Your healthy snacks are on the way.");
    }

}