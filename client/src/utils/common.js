const getCurrentUser = () => {
    const storedUserData = localStorage.getItem('userData');
    
    if (!storedUserData) {
        return null; // Return null or an empty object instead of parsing undefined
    }

    try {
        return JSON.parse(storedUserData);
    } catch (error) {
        console.error("Error parsing user data:", error);
        return null; // Return null if parsing fails
    }
};
  
  const getJwtToken = () => {
    const token = localStorage.getItem("e-commerce-user-token");
  
    if (!token) {
      return null;
    }
  
    return `Bearer ${token}`;
  };
  
  const logout = () => {
    localStorage.clear();
  
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };
  
  const getReadableTimestamp = (date) => {
    const dateObj = new Date(date);
  
    const datePart = `${dateObj.getDate()}/${
      dateObj.getMonth() + 1
    }/${dateObj.getFullYear()}`;
    const timePart = `${dateObj.getHours()}:${dateObj.getMinutes()}`;
    const amOrPm = dateObj.getHours() >= 12 ? "PM" : "AM";
  
    return `${datePart} ${timePart} ${amOrPm}`;
  };
  
  
  const shortText = (text, maxLength = 50) => {
    if (!text) {
      return " ";
    }
  
    if(text.length <= maxLength) {
      return text;
    }
  
    let shortText = text.substring(0, maxLength - 3);
  
    shortText += "...";
  
    return shortText;
  };
  
  export { getCurrentUser, getJwtToken, getReadableTimestamp, logout, shortText };