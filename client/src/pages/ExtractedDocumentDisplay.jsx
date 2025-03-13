/* eslint-disable react/prop-types */

import {
  Accordion,
  Avatar,
  Button,
  Dialog,
  Flex,
  HStack,
  Image,
  Portal,
  Span,
  Text,
} from "@chakra-ui/react";
import { CloseButton } from "../components/ui/close-button";
import { useState } from "react";
import FinanceStatementForm from "./FinanceStatementForm";

const ExtractedDocumentDisplay = ({ data, selectedFiles }) => {
  const [openedDoc, setOpenedDoc] = useState("");
  const [openFormModal, setOpenFormModal] = useState(false);
  if (data.length > 0) {
    const updatedVerifiedDocs = data.map((obj) => {
      const foundImg = selectedFiles.find((file) => file.name === obj.fileName);

      if (foundImg) {
        return {
          ...obj,
          url: foundImg.url,
        };
      }
    });

    return (
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Flex justifyContent={"space-between"}>
                <Dialog.Title>
                  Extracted Documents{" "}
                  <Span fontWeight={400}> (click items to show details)</Span>
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Flex>
            </Dialog.Header>
            <Dialog.Body>
              <Accordion.Root
                collapsible
                defaultValue={data[0]?.fileName}
                value={openedDoc}
                onValueChange={(e) => setOpenedDoc(e.value)}
              >
                {updatedVerifiedDocs.map((item, index) => (
                  <Accordion.Item key={index} value={item?.fileName}>
                    <Accordion.ItemTrigger cursor={"pointer"}>
                      <Avatar.Root shape="rounded">
                        <Avatar.Image src={item.url} objectFit={"cover"} />
                        <Avatar.Fallback name={item.fileName} />
                      </Avatar.Root>
                      <HStack flex="1">{item.fileName} </HStack>
                      <Accordion.ItemIndicator />
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent>
                      <Accordion.ItemBody>
                        <Flex gap={10} flexDirection={"column"}>
                          <Image
                            width="500px"
                            // height="200px"
                            src={item.url}
                          />

                          <div>
                            {/* <Heading size={"md"}>Document details:</Heading> */}
                            {Object.entries(item).map(([key, value]) => {
                              const formattedKey = key
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase());

                              if (key === "fileName" || key === "url")
                                return null;
                              return (
                                <Flex my={5} gap={5} key={key}>
                                  <Text fontSize={"1xl"} fontWeight={500}>
                                    {formattedKey}:
                                  </Text>{" "}
                                  <Text fontSize={"1xl"}>
                                    {" "}
                                    {typeof value === "number"
                                      ? "₱"
                                      : null}{" "}
                                    {value}
                                  </Text>
                                </Flex>
                              );
                            })}
                          </div>
                        </Flex>
                      </Accordion.ItemBody>
                    </Accordion.ItemContent>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Close</Button>
              </Dialog.ActionTrigger>
              <Dialog.Root
                style={{ height: "auto" }}
                lazyMount
                open={openFormModal}
                onOpenChange={(e) => setOpenFormModal(e.open)}
                closeOnInteractOutside={false}
                size="xl"
                placement="center"
                motionPreset="slide-in-bottom"
              >
                <Dialog.Trigger asChild>
                  <Button>Next</Button>
                </Dialog.Trigger>

                <FinanceStatementForm />
              </Dialog.Root>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    );
  }
};

export default ExtractedDocumentDisplay;
