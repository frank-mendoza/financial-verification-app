/* eslint-disable react/prop-types */
import MoonLoader from "react-spinners/MoonLoader";

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
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        top: 0,
        backgroundColor: "#3837379e",
      }}
    >
      <MoonLoader
        color={"#fff"}
        loading={loading}
        // cssOverride={override}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default Loading;
