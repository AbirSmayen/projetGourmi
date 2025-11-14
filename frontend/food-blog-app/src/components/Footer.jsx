import React from "react"

export default function Footer(){
  return (
    <footer id="footer" className="footer dark-background">
      <div className="container">
        <div className="row gy-3">
          <div className="col-lg-3 col-md-6 d-flex">
            <i className="bi bi-geo-alt icon"></i>
            <div className="address">
              <h4>Address</h4>
              <p>Tunis</p>
              <p>Tunisia</p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 d-flex">
            <i className="bi bi-telephone icon"></i>
            <div>
              <h4>Contact</h4>
              <p>
                <strong>Email:</strong> <span>contact@foodblog.com</span><br />
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 d-flex">
            <i className="bi bi-clock icon"></i>
            <div>
              <h4>About</h4>
              <p>
                Share your favorite recipes and discover new flavors
              </p>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <h4>Follow Us</h4>
            <div className="social-links d-flex">
              <a href="#" className="twitter"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" className="instagram"><i className="bi bi-instagram"></i></a>
              <a href="#" className="linkedin"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">Food Blog</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          Developed by <strong>Abir SMAYEN</strong>
        </div>
      </div>
    </footer>
  )
}