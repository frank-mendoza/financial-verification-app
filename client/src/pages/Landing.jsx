/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/no-unescaped-entities */
import { toast } from "react-toastify";
import Wrapper from "../assets/wrappers/LandingPage";
import { Loading } from "../components";
import "./Landing.scss";
import customFetch from "../utils/customFetch";
import { useContext, useEffect, useRef, useState } from "react";
import { Form } from "react-router-dom";
import { Button, Center, Flex, Image, Text } from "@chakra-ui/react";

import {
  FileUploadDropzone,
  FileUploadList,
  FileUploadRoot,
} from "../components/ui/file-upload";

import {
  DialogBody,
  DialogCloseTrigger,
  DialogActionTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { AppContext } from "../context";
import ReceiptDisplay from "./ReceiptDisplay";

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
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFilesObj, setSelectedFilesObj] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [showDetails, setShowDetails] = useState({
    id: "",
    show: false,
  });
  const fileInputRef = useRef();

  // Handle file selection
  const handleFileChange = (e) => {
    console.log(e);
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
      if (file.type === "application/pdf") {
        toast.error(`PDF file in not supported!`);
        return false; // Exclude files that are too large
      }
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

      handleFileResults(data.data);
      toast.success("Verified successfully!");
      setIsVerified(true);
      // Clear the file input after submitting

      // setSelectedFiles([]); // Clear the selected files state
      setLoading(false);
    } catch (error) {
      setIsVerified(false);
      setLoading(false);
      toast.error(error?.response?.data?.msg || error?.response?.data);
      return null;
    }
  };

  const renderResults = (file) => {
    const foundFile = verifiedDocs.find((obj) => obj.file_name === file.name);

    if (foundFile) {
      return (
        file.url && (
          <Flex flexDirection={"column"} alignItems={"center"} gap={0}>
            <div>
              <Image
                className="doc-image"
                src={file.url}
                alt={file.name}
                rounded="md"
                height={300}
                maxWidth={"100%"}
                width={300}
              />
              <Text
                mt={5}
                textAlign={"left"}
                truncate
                textStyle={"md"}
                fontWeight={"medium"}
              >
                {file.name}
              </Text>
            </div>
            <Flex
              width={"100%"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <DialogRoot
                placement={"center"}
                motionPreset="slide-in-bottom"
                size={"lg"}
              >
                <DialogTrigger asChild>
                  <Button
                    variant={"surface"}
                    onClick={() =>
                      setShowDetails({
                        id: file.name,
                        show: true,
                      })
                    }
                    colorPalette={"cyan"}
                  >
                    Show Verified Data
                  </Button>
                </DialogTrigger>

                {file.name === showDetails.id && (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{file.name}</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                      {isVerified && <ReceiptDisplay data={foundFile} />}
                    </DialogBody>
                    <DialogFooter justifyContent={"space-between"}>
                      <DialogActionTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDetails({
                              id: "",
                              show: false,
                            });
                          }}
                        >
                          Close
                        </Button>
                      </DialogActionTrigger>
                      {/* <Button>Export File</Button> */}
                    </DialogFooter>
                    <DialogCloseTrigger />
                  </DialogContent>
                )}
              </DialogRoot>
              <Button
                colorPalette={"red"}
                variant={"surface"}
                onClick={() => {
                  const foundFile = selectedFiles.find(
                    (obj) => obj.name === file.name
                  );

                  const getFilteredFiles = (files, key) => {
                    return files.filter((obj) => obj[key] !== file.name);
                  };
                  if (foundFile) {
                    const filtedred = getFilteredFiles(selectedFiles, "name");

                    const filtedredVerifiedDoc = getFilteredFiles(
                      verifiedDocs,
                      "file_name"
                    );

                    const filtedredVerifiedDocObj = getFilteredFiles(
                      selectedFilesObj,
                      "name"
                    );
                    const filtedredFileList = getFilteredFiles(
                      fileList.acceptedFiles,
                      "name"
                    );

                    fileList.acceptedFiles = filtedredFileList;
                    setFileList(fileList);
                    setVerifiedDocs(filtedredVerifiedDoc);
                    setSelectedFiles(filtedred);
                    setSelectedFilesObj(filtedredVerifiedDocObj);
                    setIsVerified(false);
                  }
                }}
              >
                Remove
              </Button>
            </Flex>
          </Flex>
        )
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
                accept={["image/jpeg", "image/png"]}
              >
                <FileUploadDropzone
                  // ref={fileRef}
                  label="Drag and drop here to upload"
                  description=".png, .jpg up to 1MB"
                />
                <FileUploadList clearable files={selectedFiles} />
              </FileUploadRoot>
              <div className="button-wrapper">
                <button
                  className="btn btn-block form-btn"
                  // type="submit"
                  disabled={isVerified}
                  onClick={handleUpload}
                >
                  Verify Document
                </button>

                <button
                  className="btn btn-block form-btn"
                  onClick={() => {
                    setSelectedFiles([]);
                    setSelectedFilesObj(null);
                    setVerifiedDocs([]);
                    fileInputRef.current.value = null;
                  }}
                >
                  Clear
                </button>
              </div>
            </Form>
            <Flex mt={20} gap="6" className="content-flex">
              {selectedFiles.map((file, key) => (
                <Flex
                  key={key}
                  align={"start"}
                  justifyContent={"center"}
                  gap={10}
                >
                  {renderResults(file)}
                </Flex>
              ))}
            </Flex>
          </Center>
        </div>
      </div>

      <Loading loading={loading} />
    </Wrapper>
  );
};

export default Landing;
