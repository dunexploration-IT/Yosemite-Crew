import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getProfiledata, getdoctorprofile } from "../profileApis/Api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [userType, setUserType] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  console.log("usertypess", doctorProfile);

  const initializeUser = async () => {
    const token = await sessionStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setTokens(token);
        setUserId(decodedToken.userId);
        setUserType(decodedToken.userType);

        await refreshProfileData(decodedToken.userId, decodedToken.userType);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);
  const onLogout = async () => {
    setTokens(null);
    setUserId(null);
    setUserType(null);
    setProfileData(null);
    sessionStorage.removeItem("token");
  };
  // Log token and user details
  // console.log("Token:", tokens);
  // console.log("User ID:", userId);
  // console.log("User Type:", userType);

  const refreshProfileData = async (userId, userType) => {
    try {
      if (userType === "Hospital") {
        const data = await getProfiledata(userId);
        setProfileData({
          logoUrl: data.logoUrl,
          businessName: data.businessName,
          activeModes: data.activeModes,
        });
      } else if (userType === "Doctor") {
        const data = await getdoctorprofile(userId);
        // console.log(data[0].personalInfo);
        setProfileData({
          logoUrl: data.personalInfo.image,
          businessName: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
        });
        setDoctorProfile(data);
      } else {
        console.warn("Unhandled userType:", userType);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  // const verifyAndRefreshToken = async (navigate) => {
  //   await checkAndRefreshToken(navigate);
  // };
  return (
    <AuthContext.Provider
      value={{
        userId,
        tokens,
        userType,
        profileData,
        refreshProfileData,
        initializeUser,
        onLogout,
        doctorProfile,
        // verifyAndRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
