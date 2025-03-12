export const parseVoucherText = (text) => {
  const cvNoMatch = text.match(/CV No\s*(\d{4}-\d+)/);
  const cvNo = cvNoMatch ? cvNoMatch[1].trim() : null;

  const dateMatch = text.match(/Date:\s*([A-Za-z]+\s\d{1,2},\s\d{4})/);
  const date = dateMatch ? dateMatch[1].trim() : null;

  const payToMatch = text.match(/Pay to\s*(.*)/);
  const payedTo = payToMatch ? payToMatch[1].trim() : null;

  const amountWordsMatch = text.match(/The sum of (.*?)P\s?([\d,.]+)/i);
  const amountInWords = amountWordsMatch ? amountWordsMatch[1].trim() : null;

  const particularsMatch = text.match(
    /PARTICULARS AMOUNT\s*\n\s*(.*?) P\s?([\d,.]+)/i
  );
  const particulars = particularsMatch ? particularsMatch[1].trim() : null;
  const amountInFigures = particularsMatch
    ? parseFloat(particularsMatch[2].replace(/,/g, ""))
    : null;

  const cashReceivedByMatch = text.match(/Cash Received by\/Date:\s*(.*)/);
  const cashReceivedBy = cashReceivedByMatch
    ? cashReceivedByMatch[1].trim()
    : null;

  let result = {
    cvNo,
    date,
    particulars,
    amountInWords,
    amountInFigures,
    payedTo,
    cashReceivedBy,
  };

  // Add voucherType if "CASH VOUCHER" is in the text
  if (text.includes("CASH VOUCHER")) {
    result.voucherType = "CASH VOUCHER";
  }

  return result;
};

export function parseAcknowledgementReceipt(text) {
  const cvNoMatch = text.match(/No\.\s*(\d{4}-\d+)/);
  const cvNo = cvNoMatch ? cvNoMatch[1].trim() : null;

  const dateMatch = text.match(/Date:\s*([A-Za-z]+\s\d{1,2},\s\d{4})/);
  const date = dateMatch ? dateMatch[1].trim() : null;

  const amountWordsMatch = text.match(/received the amount of ([^]*?) only/i);
  const amountInWords = amountWordsMatch
    ? amountWordsMatch[1].replace(/\s+/g, " ").trim()
    : null;

  const amountFiguresMatch = text.match(/\(P\s*([\d,]+)/);
  const amountInFigures = amountFiguresMatch
    ? parseFloat(amountFiguresMatch[1].replace(/,/g, ""))
    : null;

  const cashReceivedByMatch = text.match(/I,\s*(.*?),\s*hereby received/i);
  const cashReceivedBy = cashReceivedByMatch
    ? cashReceivedByMatch[1].trim()
    : null;

  // Extract "as a/an [purpose]" part
  const particularsMatch = text.match(/as a\/an (.*?)(?:\.|\n|$)/i);
  const particulars = particularsMatch ? particularsMatch[1].trim() : "N/A";

  let result = {
    cvNo,
    date,
    particulars,
    amountInWords,
    amountInFigures,
    payedTo: "", // Empty as per your requirement
    cashReceivedBy,
  };

  // Add voucherType if "CASH VOUCHER" is in the text
  if (text.includes("ACKNOWLEDGEMENT RECIEPT")) {
    result.voucherType = "ACKNOWLEDGEMENT RECIEPT";
  }

  return result;
}

export function parseOrderSummary(text) {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/\[0\]/g, "").trim())
    .filter((line) => line);

  const subTotalMatch = text.match(/Subtotal.*?£([\d,.]+)/i);
  const shippingFeeMatch = text.match(/Shipping Fee.*?£([\d,.]+)/i);
  const totalMatch = text.match(/Total.*?£([\d,.]+)/i);
  const orderNoMatch = text.match(/Order No\.\s*(\d+)/i);
  const placedOnMatch = text.match(/Placed on (.+)/i);
  const paidOnMatch = text.match(/Paid on (.+)/i);
  const deliveredOnMatch = text.match(/Delivered on (.+)/i);
  const completedOnMatch = text.match(/Completed on (.+)/i);

  // Find the "Paid by" line and the line after it
  const paidByIndex = lines.findIndex((line) => line === "Paid by");
  const paidBy =
    paidByIndex !== -1 && lines[paidByIndex + 1]
      ? lines[paidByIndex + 1].replace(/£[\d,.]+/, "").trim()
      : null;

  return {
    subTotal: subTotalMatch
      ? parseFloat(subTotalMatch[1].replace(/,/g, ""))
      : null,
    shippingFee: shippingFeeMatch
      ? parseFloat(shippingFeeMatch[1].replace(/,/g, ""))
      : null,
    total: totalMatch ? parseFloat(totalMatch[1].replace(/,/g, "")) : null,
    paymentMethod: paidBy,
    orderNo: orderNoMatch ? orderNoMatch[1].trim() : null,
    placedOn: placedOnMatch ? placedOnMatch[1].trim() : null,
    paidOn: paidOnMatch ? paidOnMatch[1].trim() : null,
    deliveredOn: deliveredOnMatch ? deliveredOnMatch[1].trim() : null,
    completedOn: completedOnMatch ? completedOnMatch[1].trim() : null,
  };
}

export function shoppeOrderSummary(text) {
  // const lines = text
  //   .split("\n")
  //   .map((line) => line.replace(/\[0\]/g, "").trim())
  //   .filter(Boolean); // Simplified

  const parseAmount = (amount) =>
    amount ? parseFloat(amount.replace(/,/g, "")) : null;

  const getFirstMatch = (regex) => {
    const match = text.match(regex);

    return match ? match[1].trim() : null;
  };

  // Parsing individual fields
  const merchandiseSubtotal = getFirstMatch(/Merchandise Subtotal £([\d,.]+)/i);
  const shippingFee = getFirstMatch(/Shipping Fee P([\d,.]+)/i);
  const shippingDiscountSubtotal = getFirstMatch(
    /Shipping Discount Subtotal © P([\d,.]+)/i
  );
  const shopeVoucherApplied = getFirstMatch(
    /Shope Voucher Applied #([\d,.]+)/i
  );
  const orderTotal = getFirstMatch(/Order Total £([\d,.]+)/i);
  const paymentMethod = getFirstMatch(/Payment Method (\w+)/i);

  return {
    merchandiseSubtotal: parseAmount(merchandiseSubtotal),
    shippingFee: parseAmount(shippingFee),
    shippingDiscountSubtotal: parseAmount(shippingDiscountSubtotal),
    shopeVoucherApplied: parseAmount(shopeVoucherApplied),
    orderTotal: parseAmount(orderTotal),
    paymentMethod,
  };
}

// for shoppe items only, need revisions
export const parseShoppeOrderSummary = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  const orderDetails = [];
  let subtotal = null;
  let totalQuantity = null;

  const productLineRegex =
    /^(\d+)\s+(.*?)\s+([₱£]?\d+(?:\.\d{2})?)\s+(\d+)\s+([₱£]?\d+(?:\.\d{2})?)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const productMatch = line.match(productLineRegex);
    if (productMatch) {
      const productName = productMatch[2].trim();
      const productPrice = parseFloat(productMatch[3].replace(/[₱£,]/g, ""));
      const quantity = parseInt(productMatch[4], 10);
      const itemSubtotal = parseFloat(productMatch[5].replace(/[₱£,]/g, ""));

      orderDetails.push({
        productName,
        productPrice,
        quantity,
        subtotal: itemSubtotal,
      });
    }

    if (line.toLowerCase().startsWith("subtotal")) {
      subtotal = parseFloat(line.replace(/[^\d.]/g, ""));
    }

    if (line.toLowerCase().includes("total quantity")) {
      totalQuantity = parseInt(line.replace(/[^\d]/g, ""), 10);
    }
  }

  return {
    paymentMethod: null,
    buyerName: null,
    buyerAddress: null,
    orderDetails,
    subtotal,
    totalQuantity,
    grandTotal: null,
    totalAmountInWords: null,
  };
};

export const processFinancialStatement = (text) => {
  console.log(text, "----");

  // for receipt 1
  // const amountMatch = text.match(/amount of (.*?)(\(P\d+\))/i);
  // const paymentMatch = text.match(/payment for (.*?)(?:\.|$)/i);

  // const amountValue = amountMatch
  //   ? amountMatch[2].replace(/[()]/g, "").trim()
  //   : null;
  // const payment = paymentMatch ? paymentMatch[1].trim() : null;

  // console.log({ amountText, amountValue, payment });

  // Remove the heading line "Financial Statement for Year 2024"
  const lines = text.split("\n").slice(1); // Skip the first line

  const filteredLines = [];
  let skip = false;

  lines.forEach((line) => {
    if (line.startsWith("****")) {
      // Toggle skip mode on encountering a line with only asterisks
      skip = !skip;
    } else if (!skip && line) {
      // Add line to filteredLines only if skip is off and line is not empty
      filteredLines.push(line);
    }
  });

  // Initialize an empty object to store the extracted data
  const data = {};

  // Process each line and extract the key-value pairs
  filteredLines.forEach((line) => {
    let [key, value] = line.includes(":")
      ? line.split(":").map((part) => part.trim()) // Split by colon if present
      : line.match(/^(.*?)(\d+[\d,]*\.*\d*)$/) // Regex to handle no-colon cases
      ? line
          .match(/^(.*?)(\d+[\d,]*\.*\d*)$/)
          .slice(1, 3)
          .map((part) => part.trim())
      : [line, ""]; // Fallback for lines without values

    if (key && value) {
      const formattedKey = key
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/_+$/, "");

      data[formattedKey] = parseFloat(value.replace(/,/g, "")) || value;
    }
  });

  return data;
};
