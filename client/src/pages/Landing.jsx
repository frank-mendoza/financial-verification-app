/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/no-unescaped-entities */
import { toast } from "react-toastify";
import Wrapper from "../assets/wrappers/LandingPage";
import { Loading } from "../components";
import "./Landing.scss";
import customFetch from "../utils/customFetch";
import { useContext, useRef, useState } from "react";
import { Form } from "react-router-dom";
import { Center, Flex, Grid, GridItem } from "@chakra-ui/react";
import { AppContext } from "../context";
import ReceiptDisplay from "./ReceiptDisplay";

export const action = async () => {
  return null;
};
const MAX_FILE_SIZE = 1 * 1024 * 1024;

const Landing = () => {
  const { handleFileResults, verifiedDocs } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFilesObj, setSelectedFilesObj] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const fileInputRef = useRef();

  // Handle file selection
  const handleFileChange = (e) => {
    const files = e.target.files;

    const fileArray = Object.values(files);
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
        file.url = URL.createObjectURL(file);
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

  const renderResults = (name) => {
    const foundFile = verifiedDocs.find((obj) => obj.file_name === name);

    if (foundFile) {
      return <ReceiptDisplay data={foundFile} />;
    }
  };
  return (
    <Wrapper>
      <div className="landing">
        <div className="info">
          <h1>
            Financial <span>Statement</span>
            <br /> Verification <span> App </span>
          </h1>

          <Center flexDirection={"column"}>
            <Form
              method="post"
              className="form"
              // for file uploads, this is very important
              // send this as formdata not an object
              // encType="multipart/form-data"
            >
              <div className="form-row">
                <label htmlFor="image" className="form-label">
                  Select file to verify
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  className="form-input"
                  multiple
                  onChange={handleFileChange}
                  ref={fileInputRef} // Reference to the file input
                  accept="image/jpeg,image/png"
                />
              </div>
              <div className="button-wrapper">
                <button
                  className="btn btn-block form-btn"
                  type="submit"
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
                    setIsVerified(false);
                    fileInputRef.current.value = null;
                  }}
                >
                  Clear
                </button>
              </div>
            </Form>
            <Grid mt={20} templateColumns="repeat(2, 1fr)" gap="6">
              {selectedFiles.map((file, key) => (
                <GridItem
                  colSpan={isVerified ? 2 : 1}
                  sm={isVerified ? 2 : 1}
                  key={key}
                >
                  <Flex
                    align={"start"}
                    gap={10}
                    flexDirection={{ xs: "column", xl: "row" }}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      // fit={"contain"}
                      style={{
                        width: !isVerified ? "100%" : "50%",
                        objectFit: "contain",
                      }}
                    />

                    {isVerified && renderResults(file.name)}
                  </Flex>
                </GridItem>
              ))}
            </Grid>
          </Center>
        </div>
      </div>

      <Loading loading={loading} />
    </Wrapper>
  );
};

export default Landing;
