
const form = document.getElementById("shopping-form");
const itemNameInput = document.getElementById("item-name");
const quantityInput = document.getElementById("item-quantity");
const priceInput = document.getElementById("item-price");
const shoppingList = document.getElementById("shopping-list");
const clearButton = document.getElementById("clear-button");

const totalCost = document.getElementById("total-cost");
const purchasedCost = document.getElementById("purchased-cost");
const remainingCount = document.getElementById("remaining-count");

// Load saved items from local storage.
let shoppingItems =
  JSON.parse(localStorage.getItem("shoppingItems")) || [];

// Save items to local storage.
function saveItems() {
  localStorage.setItem(
    "shoppingItems",
    JSON.stringify(shoppingItems)
  );
}

// Format prices in Kenyan shillings.
function formatMoney(amount) {
  return `KSh ${amount.toFixed(2)}`;
}

// Display shopping items and update totals.
function renderItems() {
  shoppingList.innerHTML = "";

  shoppingItems.forEach(function(item) {
    const li = document.createElement("li");
    li.classList.add("shopping-item");

    if (item.purchased) {
      li.classList.add("purchased");
    }

    // Item details.
    const details = document.createElement("div");
    details.classList.add("item-details");

    const name = document.createElement("span");
    name.classList.add("item-name");
    name.textContent = item.name;

    const description = document.createElement("p");
    description.textContent =
      `${item.quantity} × ${formatMoney(item.price)} = ` +
      formatMoney(item.quantity * item.price);

    if (item.purchased) {
      description.textContent += " (Purchased)";
    }

    details.append(name, description);

    // Action buttons.
    const actions = document.createElement("div");
    actions.classList.add("item-actions");

    // Mark Purchased / Undo button.
    const purchaseButton = document.createElement("button");
    purchaseButton.type = "button";
    purchaseButton.classList.add("purchase-button");
    purchaseButton.textContent = item.purchased
      ? "Undo"
      : "Mark Purchased";

    purchaseButton.addEventListener("click", function() {
      item.purchased = !item.purchased;
      saveItems();
      renderItems();
    });

    // Edit button.
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("edit-button");
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function() {
      const newName = prompt("Edit item name:", item.name);

      if (newName === null || newName.trim() === "") {
        return;
      }

      const newQuantity = prompt(
        "Edit quantity:",
        item.quantity
      );

      if (newQuantity === null) {
        return;
      }

      const newPrice = prompt(
        "Edit price per item:",
        item.price
      );

      if (newPrice === null) {
        return;
      }

      const quantity = Number(newQuantity);
      const price = Number(newPrice);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        newPrice.trim() === "" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        alert("Please enter a valid quantity and price.");
        return;
      }

      item.name = newName.trim();
      item.quantity = quantity;
      item.price = price;

      saveItems();
      renderItems();
    });

    // Add only the purchase and edit buttons.
    actions.append(purchaseButton, editButton);

    li.append(details, actions);
    shoppingList.appendChild(li);
  });

  // Calculate total cost of all items.
  const total = shoppingItems.reduce(function(sum, item) {
    return sum + item.quantity * item.price;
  }, 0);

  // Calculate cost of purchased items only.
  const purchased = shoppingItems.reduce(function(sum, item) {
    if (item.purchased) {
      return sum + item.quantity * item.price;
    }

    return sum;
  }, 0);

  // Count items that have not been purchased.
  const remaining = shoppingItems.filter(function(item) {
    return !item.purchased;
  }).length;

  totalCost.textContent = formatMoney(total);
  purchasedCost.textContent = formatMoney(purchased);
  remainingCount.textContent = remaining;
}

// Add a new item.
form.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = itemNameInput.value.trim();
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);

  if (
    name === "" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    priceInput.value.trim() === "" ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    alert("Please enter a valid item, quantity, and price.");
    return;
  }

  const newItem = {
    id: crypto.randomUUID(),
    name: name,
    quantity: quantity,
    price: price,
    purchased: false
  };

  shoppingItems.push(newItem);

  saveItems();
  renderItems();

  form.reset();
  quantityInput.value = 1;
});

// Clear the entire shopping list.
clearButton.addEventListener("click", function() {
  if (shoppingItems.length === 0) {
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to clear the shopping list?"
  );

  if (confirmed) {
    shoppingItems = [];
    saveItems();
    renderItems();
  }
});

// Display saved items when the page loads.
renderItems();
