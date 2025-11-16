import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaUser, FaEnvelope, FaCamera, FaLock, FaSave } from "react-icons/fa";

export default function UserProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    image: "default-avatar.png",
    preferences: {
      regime: [],
      objectifs: []
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const regimeOptions = ["omnivore", "végétarien", "keto"];
  const objectifsOptions = ["perte de poids", "prise de masse", "santé équilibrée", "autre"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/profile", {
        headers: { authorization: `bearer ${token}` }
      });
      
      setProfileData(res.data.user);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load profile"
      });
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File too large",
          text: "Image must be less than 5MB"
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckboxChange = (value, field) => {
    setProfileData(prev => {
      const currentArray = prev.preferences[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: newArray
        }
      };
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      formData.append("firstName", profileData.firstName);
      formData.append("lastName", profileData.lastName);
      formData.append("preferences", JSON.stringify(profileData.preferences));
      
      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      const res = await axios.put(
        "http://localhost:5000/profile",
        formData,
        {
          headers: {
            authorization: `bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile updated successfully",
          timer: 2000,
          showConfirmButton: false
        });
        
        setProfileData(res.data.user);
        setSelectedImage(null);
        setImagePreview(null);
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to update profile"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "New passwords do not match"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "New password must be at least 6 characters long"
      });
      return;
    }

    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { authorization: `bearer ${token}` }
        }
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Password changed successfully",
          timer: 2000,
          showConfirmButton: false
        });
        
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (err) {
      console.error("Error changing password:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to change password"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (profileData.image && profileData.image !== "default-avatar.png") {
      return `http://localhost:5000/images/profiles/${profileData.image}`;
    }
    return "/template/assets/img/default-avatar.png";
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
  <main className="main">
    <section className="section" style={{ paddingTop: "100px", minHeight: "100vh" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">

            <div className="card shadow-sm" style={{ borderRadius: "10px" }}>
              <div className="card-body p-4">

                <h3 className="mb-4" style={{ color: "#ce1212" }}>
                  <FaUser className="me-2" />
                  Edit Profile
                </h3>

                {/* FORMULAIRE UNIQUE */}
                <form onSubmit={handleProfileUpdate}>

                  {/* IMAGE PROFILE */}
                  <div className="mb-4 text-center">
                    <label className="form-label d-block">Profile Picture</label>

                    <div className="position-relative d-inline-block">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                        style={{
                          width: "150px",
                          height: "150px",
                          border: "3px solid #ce1212",
                          overflow: "hidden"
                        }}
                      >
                        <img
                          src={getImageUrl()}
                          alt="Profile Preview"
                          className="rounded-circle"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      </div>

                      <label
                        htmlFor="profileImage"
                        className="position-absolute bottom-0 end-0 btn btn-sm btn-danger rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "40px", cursor: "pointer", marginBottom: "8px" }}
                      >
                        <FaCamera />
                      </label>

                      <input
                        type="file"
                        id="profileImage"
                        className="d-none"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>

                    <p className="text-muted small mt-2">
                      Max size: 5MB | Formats: JPG, PNG, GIF
                    </p>
                  </div>

                  {/* FIRST + LAST NAME */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, firstName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, lastName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-12 mb-4">
                      <label className="form-label">
                        <FaEnvelope className="me-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={profileData.email}
                        disabled
                        style={{ backgroundColor: "#f0f0f0" }}
                      />
                      <small className="text-muted">Email cannot be changed</small>
                    </div>
                  </div>

                  {/* DIET TYPE */}
                  <div className="mb-3">
                    <label className="form-label fw-bold">Diet Type</label>

                    <div className="row g-2">
                      {regimeOptions.map((option) => (
                        <div key={option} className="col-md-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`regime-${option}`}
                              checked={profileData.preferences?.regime?.includes(option) || false}
                              onChange={() => handleCheckboxChange(option, "regime")}
                            />
                            <label className="form-check-label">{option}</label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GOALS */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">Goals</label>

                    <div className="row g-2">
                      {objectifsOptions.map((option) => (
                        <div key={option} className="col-md-6">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={profileData.preferences?.objectifs?.includes(option) || false}
                              onChange={() => handleCheckboxChange(option, "objectifs")}
                            />
                            <label className="form-check-label">{option}</label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PASSWORD FIELDS */}
                  <h4 className="mt-4 mb-3" style={{ color: "#ce1212" }}>
                    <FaLock className="me-2" />
                    Change Password
                  </h4>

                  <div className="mb-3">
                    <label className="form-label">Current Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      placeholder="New password"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Confirm New Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>

                  {/* SUBMIT */}
                  <div className="text-end">
                    <button
                      type="submit"
                      className="btn btn-danger px-4"
                    >
                      <FaSave className="me-2" />
                      Save All Changes
                    </button>
                  </div>

                </form>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  </main>
);

}