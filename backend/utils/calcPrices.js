function addDecimals(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

// NOTE: the code below has been changed from the course code to fix an issue
// with type coercion of strings to numbers.
// Our addDecimals function expects a number and returns a string, so it is not
// correct to call it passing a string as the argument.

export function calcPrices(orderItems) {
  // Calculate the items price in whole number (pennies) to avoid issues with
  // floating point number calculations
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + (item.price * 100 * item.qty) / 100,
    0
  );

  // Fixed shipping price of $35
  const shippingPrice = 35;

  // Calculate 5% service fee on items price
  const serviceFee = 0.5 * itemsPrice;

  // Calculate the tax price (15% on items)
  const taxPrice = 0.075 * itemsPrice;

  // Calculate the total price including service fee
  const totalPrice = itemsPrice + serviceFee + shippingPrice + taxPrice;

  // return prices as strings fixed to 2 decimal places
  return {
    itemsPrice: addDecimals(itemsPrice),
    serviceFee: addDecimals(serviceFee),
    shippingPrice: addDecimals(shippingPrice),
    taxPrice: addDecimals(taxPrice),
    totalPrice: addDecimals(totalPrice),
  };
}