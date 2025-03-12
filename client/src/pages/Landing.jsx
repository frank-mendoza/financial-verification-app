/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/no-unescaped-entities */
import { toast } from "react-toastify";
import Wrapper from "../assets/wrappers/LandingPage";
import { Loading } from "../components";
import "./Landing.scss";
import customFetch from "../utils/customFetch";
import { useContext, useEffect, useRef, useState } from "react";
import { Form } from "react-router-dom";
import {
  Accordion,
  Avatar,
  Button,
  Center,
  Dialog,
  Flex,
  HStack,
  Image,
  Portal,
  Text,
} from "@chakra-ui/react";

import {
  FileUploadDropzone,
  FileUploadList,
  FileUploadRoot,
} from "../components/ui/file-upload";

import { AppContext } from "../context";
import { CloseButton } from "../components/ui/close-button";

export const action = async () => {
  return null;
};
const MAX_FILE_SIZE = 1 * 1024 * 1024;

const Landing = () => {
  const { handleFileResults, verifiedDocs, setVerifiedDocs } = useContext(
    AppContext
  );
  const [fileList, setFileList] = useState({
    acceptedFiles: [],
    rejectedFiles: [],
  });

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFilesObj, setSelectedFilesObj] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [openedDoc, setOpenedDoc] = useState("");
  const fileInputRef = useRef();

  console.log(verifiedDocs);
  console.log(selectedFiles);
  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFiles([]);
    setSelectedFilesObj(null);
    setFileList({
      acceptedFiles: [],
      rejectedFiles: [],
    });

    const files = [
      ...new Map(e.acceptedFiles.map((item) => [item.name, item])).values(),
    ];

    setFileList(e);

    const fileArray = Array.from(files);
    setSelectedFilesObj(files);

    const validFiles = fileArray.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the maximum file size of 1MB.`);
        return false; // Exclude files that are too large
      }
      // if (file.type === "application/pdf") {
      //   toast.error(`PDF file in not supported!`);
      //   return false; // Exclude files that are too large
      // }
      return true;
    });

    setSelectedFiles(
      validFiles.map((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          file.url = reader.result;
          // setImageSrc(reader.result); // This uses a data URI.
        };
        reader.readAsDataURL(file);
        return file;
      })
    );
  };

  const handleUpload = async () => {
    if (selectedFilesObj.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    for (let i = 0; i < selectedFilesObj.length; i++) {
      formData.append("files", selectedFilesObj[i]); // Append each file to formData
    }

    try {
      const data = await customFetch.post("/verification", formData);
      setTimeout(() => {
        // Clear the file input after submitting

        // setSelectedFiles([]); // Clear the selected files state
        setOpen(true);
        handleFileResults(data.data);
        toast.success("Verified successfully!");
        setIsVerified(true);
        setLoading(false);
      }, 3000);
    } catch (error) {
      setIsVerified(false);
      setLoading(false);
      toast.error(error?.response?.data?.msg || error?.response?.data);
      return null;
    }
  };

  const renderResults = () => {
    if (verifiedDocs.length > 0) {
      const updatedVerifiedDocs = verifiedDocs.map((obj) => {
        const foundImg = selectedFiles.find(
          (file) => file.name === obj.fileName
        );

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
                  <Dialog.Title>Extracted Documents</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                <Accordion.Root
                  collapsible
                  defaultValue={verifiedDocs[0]?.fileName}
                  value={openedDoc}
                  onValueChange={(e) => setOpenedDoc(e.value)}
                >
                  {updatedVerifiedDocs.map((item, index) => (
                    <Accordion.Item key={index} value={item?.fileName}>
                      <Accordion.ItemTrigger>
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
                <Button>Export File</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      );
    }
  };

  useEffect(() => {
    // Cleanup blob URLs when component unmounts or imageSrc changes
    return () => {
      selectedFiles.forEach((file) => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [selectedFiles]);

  return (
    <Wrapper>
      <div className="landing">
        <div className="info">
          <h1>
            Financial <span>Statement</span>
            <br /> Verification <span> App </span>
          </h1>

          <Center flexDirection={"column"}>
            <Form method="post" className="form">
              <FileUploadRoot
                onFileChange={handleFileChange}
                maxW="xl"
                ref={fileInputRef}
                alignItems="stretch"
                maxFiles={5}
                value={fileList}
                name="file"
                accept={["image/jpeg", "image/png", "application/pdf"]}
              >
                <FileUploadDropzone
                  // ref={fileRef}
                  label="Drag and drop here to upload"
                  description=".png, .jpg up to 1MB"
                />
                <FileUploadList clearable files={selectedFiles} />
              </FileUploadRoot>
              <div className="button-wrapper">
                {verifiedDocs.length > 0 ? (
                  <Dialog.Root
                    style={{ height: "auto" }}
                    lazyMount
                    open={open}
                    onOpenChange={(e) => setOpen(e.open)}
                    size="xl"
                    placement="center"
                    motionPreset="slide-in-bottom"
                  >
                    <Dialog.Trigger asChild>
                      <Button
                        variant="solid"
                        size="sm"
                        onClick={() => setOpen(true)}
                      >
                        View Document Details
                      </Button>
                    </Dialog.Trigger>

                    {renderResults()}
                  </Dialog.Root>
                ) : (
                  <Button
                    // className="btn btn-block form-btn"
                    // type="submit"
                    disabled={isVerified}
                    onClick={handleUpload}
                  >
                    Verify Document
                  </Button>
                )}

                <Button
                  variant={"outline"}
                  // className="btn btn-block form-btn"
                  onClick={() => {
                    setSelectedFiles([]);
                    setSelectedFilesObj(null);
                    setVerifiedDocs([]);
                    setIsVerified(false);
                    fileInputRef.current.value = null;
                  }}
                >
                  Clear
                </Button>
              </div>
            </Form>
          </Center>
        </div>
      </div>

      <Loading loading={loading} />
    </Wrapper>
  );
};

export default Landing;
