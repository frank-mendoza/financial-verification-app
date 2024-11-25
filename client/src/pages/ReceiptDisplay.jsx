/* eslint-disable react/prop-types */

import { Flex, List, Text } from "@chakra-ui/react";

const ReceiptDisplay = ({ data }) => {
  console.log(data);
  const { address, date, manager, items, file_name } = data;
  return (
    <div style={{ maxWidth: "600px", width: "50%" }}>
      <Text fontWeight={900} my={10} mt={0} textStyle={"2xl"}>
        Document Details
      </Text>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "20px",
          padding: "20px",
        }}
      >
        {file_name && (
          <Text textStyle={"1xl"}>
            <strong>File Name:</strong> {file_name}
          </Text>
        )}
        {address && (
          <p>
            <strong>Address:</strong> {address}
          </p>
        )}
        {date && (
          <p>
            <strong>Date:</strong> {date}
          </p>
        )}
        {manager && (
          <p>
            <strong>Manager:</strong> {manager}
          </p>
        )}

        {items && (
          <>
            <Text textStyle={"xl"} fontWeight={700}>
              Items
            </Text>

            <List.Root mt={5}>
              {Object.entries(items).map(
                ([itemName, price], itemIndex) =>
                  itemName !== "total" && (
                    <Flex
                      // my={1}
                      key={itemIndex}
                      justifyContent={"space-between"}
                    >
                      <Text textTransform={"capitalize"}>
                        <strong>{itemName.replace(/_/g, " ")}:</strong>
                      </Text>
                      <Text>${price.toFixed(2)}</Text>
                    </Flex>
                  )
              )}
            </List.Root>
            {items.total && (
              <Flex justifyContent={"end"}>
                <Text textAlign={"end"} textStyle={"2xl"}>
                  <strong>Total:</strong> ${items.total.toFixed(2)}
                </Text>
              </Flex>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptDisplay;
