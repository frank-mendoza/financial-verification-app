/* eslint-disable react/prop-types */

import { Flex, List, Text } from "@chakra-ui/react";
import { NumericFormat } from "react-number-format";

const ReceiptDisplay = ({ data }) => {
  const { address, date, items } = data;
  return (
    <div className="doc-details">
      <Text
        fontWeight={700}
        mb={2}
        pt={5}
        borderTop={"1px solid #eeeeee"}
        textStyle={"xl"}
      >
        Document Details
      </Text>

      <div
        style={{
          borderBottom: "1px solid #eeeeee",
          // borderRadius: "8px",
          // marginBottom: "20px",
          paddingBottom: 30,
        }}
      >
        {address && (
          <Text fontSize={16}>
            <strong>Address:</strong> {address}
          </Text>
        )}
        {date && (
          <Text my={3} fontSize={16}>
            <strong>Date:</strong> {date}
          </Text>
        )}
        {/* {manager && (
          <p>
            <strong>Manager:</strong> {manager}
          </p>
        )} */}

        {items && (
          <>
            {/* <Text fontSize={20} textStyle={"xl"} fontWeight={700}>
              Items
            </Text> */}

            <List.Root mt={3}>
              {Object.entries(items).map(
                ([itemName, price], itemIndex) =>
                  itemName !== "total" && (
                    <Flex
                      my={2}
                      key={itemIndex}
                      justifyContent={"space-between"}
                      borderTop={"1px solid #eee"}
                      paddingTop={4}
                    >
                      <Text fontSize={16} textTransform={"capitalize"}>
                        <Text fontWeight={"600"}>
                          {itemName.replace(/_/g, " ")}:
                        </Text>
                      </Text>
                      <NumericFormat
                        value={price.toFixed(2)}
                        // customInput={Input}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <>₱{value}</>}
                      />
                      {/* ;<Text fontSize={16}>₱{price.toFixed(2)}</Text> */}
                    </Flex>
                  )
              )}
            </List.Root>
            {items.total && (
              <Flex mt={10} justifyContent={"end"} gap={2}>
                <Text textStyle={"2xl"} fontWeight={"600"}>
                  Total:
                </Text>{" "}
                <NumericFormat
                  value={items.total.toFixed(2)}
                  // customInput={Input}
                  displayType="text"
                  thousandSeparator
                  renderText={(value) => (
                    <Text textStyle={"2xl"}>₱{value}</Text>
                  )}
                />
              </Flex>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReceiptDisplay;
