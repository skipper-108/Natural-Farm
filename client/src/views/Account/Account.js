import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { FiEdit, FiShoppingCart, FiHeart, FiBox, FiCreditCard, FiBell, FiLogOut } from 'react-icons/fi';
import './Account.css';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import axios from 'axios';

// API base URL
const API_BASE_URL = 'https://krushivrundfarm.onrender.com';

const Account = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rePassword: '',
        phone: '',
        address: ''
    });
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState(''); // For debugging and user feedback
    // Add a state to store signup data temporarily
    const [signupData, setSignupData] = useState(null);

    // Check if user is logged in on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserData = localStorage.getItem('userData');
        
        console.log("Token from localStorage:", token);
        console.log("User data from localStorage:", storedUserData);
        
        if (token && storedUserData) {
            try {
                const parsedUserData = JSON.parse(storedUserData);
                setUserData(parsedUserData);
                setIsLoggedIn(true);
                setStatusMessage('Logged in with stored user data');
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('userData');
            }
        } else {
            setStatusMessage('No stored credentials found, please log in');
        }
    }, []);

    // Reset form data
    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            rePassword: '',
            phone: '',
            address: ''
        });
        setErrors({});
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const toggleAuthMode = () => {
        setAuthMode(authMode === 'login' ? 'signup' : 'login');
        setErrors({});
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (authMode === 'signup') {
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
            if (!formData.address.trim()) newErrors.address = 'Address is required';
            if (formData.password !== formData.rePassword) {
                newErrors.rePassword = 'Passwords do not match';
            }
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsLoading(true);
        setStatusMessage(`Attempting to ${authMode}...`);
        
        try {
            if (authMode === 'signup') {
                // Call signup API with full URL
                const signupData = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    rePassword: formData.rePassword,
                    phone: formData.phone,
                    address: formData.address
                };
                
                // Save the signup data to state for potential later use
                setSignupData(signupData);
                
                console.log("Sending signup data:", signupData);
                const response = await axios.post(`${API_BASE_URL}/signup`, signupData);
                console.log("Signup response:", response.data);
                
                if (response.data && response.data.token) {
                    // Store the user data directly after signup - with ALL fields
                    const newUserData = {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address
                    };
                    
                    // Store token and user data in localStorage
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('userData', JSON.stringify(newUserData));
                    
                    // Update state
                    setUserData(newUserData);
                    setIsLoggedIn(true);
                    setStatusMessage('Signup successful! You are now logged in.');
                    resetForm();
                } else {
                    // If no token in response but otherwise successful
                    resetForm();
                    setAuthMode('login');
                    setStatusMessage('Signup successful! Please login with your credentials.');
                }
            } else {
                // Call login API with full URL
                const loginData = {
                    email: formData.email,
                    password: formData.password
                };
                
                console.log("Sending login data:", loginData);
                const response = await axios.post(`${API_BASE_URL}/login`, loginData);
                console.log("Login response:", response.data);
                
                if (response.data && response.data.token) {
                    // First check if we have this user's data already from a recent signup
                    let userInfo = null;
                    
                    // Check if this is the same email as our recent signup data
                    if (signupData && signupData.email === formData.email) {
                        userInfo = {
                            name: signupData.name,
                            email: signupData.email,
                            phone: signupData.phone,
                            address: signupData.address
                        };
                        console.log("Using recent signup data for user info:", userInfo);
                    } else {
                        // Check if there's stored user data for this email
                        const storedUserData = localStorage.getItem('userData');
                        
                        if (storedUserData) {
                            try {
                                const parsedData = JSON.parse(storedUserData);
                                if (parsedData.email === formData.email) {
                                    // Use stored data if emails match
                                    userInfo = parsedData;
                                    console.log("Using stored user data:", userInfo);
                                }
                            } catch (error) {
                                console.error('Error parsing stored user data:', error);
                            }
                        }
                    }
                    
                    // If no saved data for this email, create minimal user info
                    if (!userInfo) {
                        // If we still don't have user info, try to get it from the server
                        try {
                            // Try to get user data from the server using the token
                            const userResponse = await axios.get(`${API_BASE_URL}/user/profile`, {
                                headers: {
                                    'Authorization': `Bearer ${response.data.token}`
                                }
                            });
                            
                            if (userResponse.data && (userResponse.data.user || userResponse.data.userData)) {
                                userInfo = {
                                    email: formData.email,
                                    name: '',
                                    phone: '',
                                    address: '',
                                    ...((userResponse.data.user || userResponse.data.userData))
                                };
                                console.log("Retrieved user data from server:", userInfo);
                            } else {
                                // Default minimal user info if no data from server
                                userInfo = {
                                    email: formData.email,
                                    name: '',
                                    phone: '',
                                    address: ''
                                };
                                console.log("Using minimal user info - no data from server");
                            }
                        } catch (profileError) {
                            console.error("Error fetching user profile:", profileError);
                            // Default minimal user info if error fetching profile
                            userInfo = {
                                email: formData.email,
                                name: '',
                                phone: '',
                                address: ''
                            };
                            console.log("Using minimal user info due to profile fetch error");
                        }
                    }
                    
                    // Store token and user data in localStorage
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('userData', JSON.stringify(userInfo));
                    
                    // Update state
                    setUserData(userInfo);
                    setIsLoggedIn(true);
                    setStatusMessage('Login successful!');
                    resetForm();
                } else {
                    setStatusMessage('Login response received but no token found');
                    setErrors({ auth: 'Invalid response from server' });
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setStatusMessage(`Authentication error: ${error.message}`);
            
            // Handle API errors
            if (error.response) {
                console.error('Error response details:', error.response.status, error.response.data);
                
                if (error.response.status === 401) {
                    setErrors({ auth: 'Invalid email or password' });
                } else if (error.response.data && error.response.data.message) {
                    setErrors({ auth: error.response.data.message });
                } else if (error.response.data && error.response.data.code === 11000) {
                    // Handle MongoDB duplicate key error
                    if (error.response.data.keyPattern && error.response.data.keyPattern.phone) {
                        setErrors({ phone: 'This phone number is already registered with an account' });
                    } else if (error.response.data.keyPattern && error.response.data.keyPattern.email) {
                        setErrors({ email: 'This email is already registered with an account' });
                    } else {
                        setErrors({ auth: 'A user with this information already exists' });
                    }
                } else {
                    setErrors({ auth: 'Authentication failed. Please try again.' });
                }
            } else {
                setErrors({ auth: 'Network error. Please check your connection.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        try {
            const token = localStorage.getItem('token');
            
            // Optional: Call logout API to invalidate token on server
            if (token) {
                axios.post(`${API_BASE_URL}/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(err => console.log('Logout API error:', err));
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear token and reset state
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            setIsLoggedIn(false);
            setActiveTab('profile');
            resetForm();
            setStatusMessage('You have been logged out');
            // Also clear the signup data
            setSignupData(null);
        }
    };

    // Debug section that can be removed in production
    const debugSection = (
        <div style={{ padding: '10px', background: '#f0f0f0', marginTop: '20px', borderRadius: '5px' }}>
            <h3>Debug Info (remove in production)</h3>
            <p>Status: {statusMessage}</p>
            <p>isLoggedIn: {isLoggedIn ? 'true' : 'false'}</p>
            <p>Token in localStorage: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
            <p>Current auth mode: {authMode}</p>
            <p>Recent signup data available: {signupData ? 'Yes' : 'No'}</p>
            <div>
                <strong>User Data:</strong>
                <pre>{JSON.stringify(userData, null, 2)}</pre>
            </div>
            <button onClick={() => console.log({
                isLoggedIn,
                userData,
                formData,
                errors,
                signupData,
                token: localStorage.getItem('token')
            })}>
                Log State to Console
            </button>
        </div>
    );

    // Function to handle profile edit (placeholder)
    const handleEditProfile = () => {
        // In a real implementation, this would open a form to edit profile details
        alert("Edit profile functionality would be implemented here");
    };

    // Render authentication forms when not logged in
    if (!isLoggedIn) {
        return (
            <div>
                <Header />
                <div className="auth-container">
                    <div className="auth-form-container">
                        <h1>{authMode === 'login' ? 'Login' : 'Sign Up'}</h1>
                        
                        {errors.auth && <div className="auth-error">{errors.auth}</div>}
                        
                        <form onSubmit={handleSubmit} className="auth-form">
                            {authMode === 'signup' && (
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                    />
                                    {errors.name && <div className="form-error">{errors.name}</div>}
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                />
                                {errors.email && <div className="form-error">{errors.email}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-input-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter your password"
                                    />
                                    <button 
                                        type="button" 
                                        className="toggle-password" 
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && <div className="form-error">{errors.password}</div>}
                            </div>
                            
                            {authMode === 'signup' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="rePassword">Confirm Password</label>
                                        <input
                                            type="password"
                                            id="rePassword"
                                            name="rePassword"
                                            value={formData.rePassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm your password"
                                        />
                                        {errors.rePassword && (
                                            <div className="form-error">{errors.rePassword}</div>
                                        )}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="phone">Phone</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter your phone number"
                                        />
                                        {errors.phone && <div className="form-error">{errors.phone}</div>}
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="address">Address</label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter your address"
                                            rows="3"
                                        ></textarea>
                                        {errors.address && <div className="form-error">{errors.address}</div>}
                                    </div>
                                </>
                            )}
                            
                            <button 
                                type="submit" 
                                className="auth-button"
                                disabled={isLoading}
                            >
                                {isLoading 
                                    ? 'Processing...' 
                                    : (authMode === 'login' ? 'Login' : 'Sign Up')}
                            </button>
                        </form>
                        
                        <div className="auth-toggle">
                            {authMode === 'login' ? (
                                <p>Don't have an account? <button onClick={toggleAuthMode}>Sign Up</button></p>
                            ) : (
                                <p>Already have an account? <button onClick={toggleAuthMode}>Login</button></p>
                            )}
                        </div>
                       
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Original account page when logged in
    return (
        <div>
            <Header/>
            <div className="account-container">
                <div className="sidebar">
                    <div className="profile-info">
                        <FaUserCircle className="profile-icon" />
                        <h2>{userData.name || 'User'}</h2>
                        <p>{userData.email || 'email@example.com'}</p>
                    </div>
                    <nav className="anav-links">
                        <a
                            href="#"
                            className={`anav-link ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => handleTabClick('profile')}
                        >
                            <FiEdit className="icon" />
                            Profile
                        </a>
                        
                        
                        <a href="#" className="anav-link logout" onClick={handleLogout}>
                            <FiLogOut className="icon" />
                            Logout
                        </a>
                    </nav>
                </div>

                <div className="content">
                    {activeTab === 'profile' && (
                        <div className="profile-tab">
                            <h1>Profile</h1>
                            <div className="profile-details">
                                <div className="detail-row">
                                    <label>Name:</label>
                                    <span>{userData.name || 'Not provided'}</span>
                                </div>
                                <div className="detail-row">
                                    <label>Email:</label>
                                    <span>{userData.email || 'Not provided'}</span>
                                </div>
                                <div className="detail-row">
                                    <label>Phone:</label>
                                    <span>{userData.phone || 'Not provided'}</span>
                                </div>
                                <div className="detail-row">
                                    <label>Address:</label>
                                    <span>{userData.address || 'Not provided'}</span>
                                </div>
                                <button className="edit-btn" onClick={handleEditProfile}>
                                    <FiEdit className="icon" />
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    )}
                    
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default Account;