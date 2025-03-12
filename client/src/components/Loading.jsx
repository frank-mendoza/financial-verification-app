/* eslint-disable react/prop-types */
import { Text } from "@chakra-ui/react";
import SyncLoader from "react-spinners/SyncLoader";
import "./styles.scss";

const Loading = ({ loading }) => {
  if (!loading) return null;
  return (
    <div
      style={{
        position: "fixed",
        height: "100%",
        width: "100%",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        top: 0,
        backgroundColor: "#2221219e",
      }}
    >
      <SyncLoader
        color={"#fff"}
        loading={loading}
        // cssOverride={override}
        size={20}
        aria-label="Loading Spinner"
        data-testid="loader"
        className="dot"
      />
      <Text
        mt={5}
        fontSize={24}
        fontWeight={600}
        color={"#fff"}
        className="dot text-loading"
      >
        Extracting Data
      </Text>
    </div>
  );
};

export default Loading;
