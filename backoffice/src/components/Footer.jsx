import React from "react";

const Footer = () => {
  return (
    <footer className="sticky-footer bg-white">
      <div className="container my-auto">
        <div className="copyright text-center my-auto">
          <span>
            © {new Date().getFullYear()} Gourmi Admin Dashboard — All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
