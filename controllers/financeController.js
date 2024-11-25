import { StatusCodes } from "http-status-codes";
import path from "path";
import Tesseract from "tesseract.js";
import { nanoid } from "nanoid";
import { writeFileSync } from "fs";

import { BadRequestError } from "../errors/customErrors.js";

const processFinancialStatement = (text) => {
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

      // Await the recognition result for each file
      const {
        data: { text },
      } = await Tesseract.recognize(
        file.buffer,
        "eng", // Language setting
        {
          logger: (m) => console.log(m), // Optional: logs progress
        }
      );

      // Process the extracted text
      const parsedData = processFinancialStatement(text);

      // Validate that the text contains indicators of a financial statement
      if (!isValidFinancialStatement(text)) {
        throw new BadRequestError(
          `The file ${file.originalname} does not appear to be a financial statement.`
        );
      }

      const items = Object.keys(parsedData)
        .filter((key) => typeof parsedData[key] === "number")
        // .reduce((sum, value) => sum + value, 0) // Filter numeric fields
        .reduce((obj, key) => {
          obj[key] = parsedData[key]; // Add the numeric fields to the new object
          return obj;
        }, {});

      const total = Object.values(items)
        .filter((value) => typeof value === "number") // Keep only number values
        .reduce((sum, value) => sum + value, 0); // Sum up the values

      // Add the total as a new field in the object
      items.total = parseFloat(total.toFixed(2));
      parsedData.items = items;

      Object.keys(items).forEach((key) => {
        delete parsedData[key];
      });

      // If valid, save the file to disk
      writeFileSync(filePath, file.buffer); // Write the file to disk
      // Push the processed data to groupedData
      groupedData.push({ ...parsedData, file_name: file.originalname });
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
