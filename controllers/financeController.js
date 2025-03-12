import { StatusCodes } from "http-status-codes";
import path from "path";
import Tesseract from "tesseract.js";
import { nanoid } from "nanoid";

import {
  parseAcknowledgementReceipt,
  parseVoucherText,
  processFinancialStatement,
  shoppeOrderSummary,
} from "../utils/helper.js";

// Helper function to validate if the text contains financial statement indicators
const isValidFinancialStatement = (text) => {
  // Check for specific fields or keywords that are commonly found in financial statements
  const requiredFields = [
    "revenue",
    "expense",
    "profit",
    "income",
    "total",
    "amount",
    "price",
    "item",
    "subtotal",
    "balance",
    "date",
    "cash",
    "voucher",
  ];
  const textLower = text.toLowerCase();

  // Check if any required field is found in the text
  return requiredFields.some((field) => textLower.includes(field));
};

export const verifyStatement = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }

  try {
    let groupedData = [];

    // Create an array of promises for all the file processing
    const processingPromises = req.files.map(async (file, key) => {
      const filePath = path.join(
        "uploads/",
        `${nanoid()}-${file.originalname}`
      );

      if (file.mimetype === "application/pdf") {
        // let pdfText = "";
        // PdfParse(file.buffer)
        //   .then((data) => {
        //     console.log(data.text);
        //   })
        //   .catch((err) => console.error(err));
      } else {
        // Await the recognition result for each file
        const {
          data: { text },
        } = await Tesseract.recognize(
          file.buffer,
          "eng", // Language setting
          {
            // logger: (m) => console.log(m), // Optional: logs progress
          }
        );

        // Process the extracted text
        const parsedData = processFinancialStatement(text);
        let result;

        if (text.includes("CASH VOUCHER")) {
          // for cash voucher
          const voucherObject = parseVoucherText(text);
          result = voucherObject;
          console.log(voucherObject, "voucherObject");
        } else if (
          text.includes(
            "ACKNOWLEDGEMENT RECIEPT" ||
              text.includes("ACKNOWLEDGEMENT RECEIPT")
          )
        ) {
          //for acknowledgement receipt
          const acknowledgementReceipt = parseAcknowledgementReceipt(text);
          result = acknowledgementReceipt;

          // console.log(acknowledgementReceipt, "acknowledgementReceipt");
        } else {
          // const regularReceipt = parseOrderSummary(text);
          // console.log(regularReceipt);

          // const shoppeOrderSummary = parseShoppeOrderSummary(text);
          const shoppeOrderSummaryReceipt = shoppeOrderSummary(text);
          result = shoppeOrderSummaryReceipt;
          // console.log(shoppeOrderSummaryReceipt);
        }

        const formattedResult = {
          ...result,
          fileName: file.originalname,
        };

        console.log(formattedResult);
        groupedData.push(formattedResult);
        // const shoppeOrderSummary = parseShoppeOrderSummary(text);
        // console.log(shoppeOrderSummary, "shoppeOrderSummary ----");
      }

      // // Validate that the text contains indicators of a financial statement
      // if (!isValidFinancialStatement(text)) {
      //   throw new BadRequestError(
      //     `The file ${file.originalname} does not appear to be a financial statement.`
      //   );
      // }

      // const items = Object.keys(parsedData)
      //   .filter((key) => typeof parsedData[key] === "number")
      //   // .reduce((sum, value) => sum + value, 0) // Filter numeric fields
      //   .reduce((obj, key) => {
      //     obj[key] = parsedData[key]; // Add the numeric fields to the new object
      //     return obj;
      //   }, {});

      // const total = Object.values(items)
      //   .filter((value) => typeof value === "number") // Keep only number values
      //   .reduce((sum, value) => sum + value, 0); // Sum up the values

      // // Add the total as a new field in the object
      // items.total = parseFloat(total.toFixed(2));
      // parsedData.items = items;

      // Object.keys(items).forEach((key) => {
      //   delete parsedData[key];
      // });

      // If valid, save the file to disk
      // writeFileSync(filePath, file.buffer); // Write the file to disk
      // Push the processed data to groupedData

      // await FinanceModel.create({
      //   ...parsedData,
      //   file_name: file.originalname,
      // });
    });

    // Wait for all file processing promises to resolve
    await Promise.all(processingPromises);

    // Once all files are processed, send the response
    return res.status(StatusCodes.ACCEPTED).send(groupedData);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send(
        err.message.includes("does not appear to be a financial statement")
          ? err.message
          : "Error processing the file."
      );
  }
};
