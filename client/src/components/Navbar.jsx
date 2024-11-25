import Wrapper from "../assets/wrappers/Navbar";
import { FaAlignLeft } from "react-icons/fa";
import Logo from "./Logo";
import { Text } from "@chakra-ui/react";
const Navbar = () => {
  return (
    <Wrapper>
      <div className="nav-center">
        <button type="button" className="toggle-btn">
          <FaAlignLeft />
        </button>
        <div>
          <Logo />
          <Text>FSV App</Text>
          <h4 className="logo-text">dashboard</h4>
        </div>
      </div>
    </Wrapper>
  );
};
export default Navbar;
