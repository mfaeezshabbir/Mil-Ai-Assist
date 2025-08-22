import React from "react";
import Image from "next/image";
import logo from "../assets/logo.svg";

const SysLogo: React.FC = () => (
  <Image src={logo} width={48} height={48} alt="Logo" />
);

export default SysLogo;
