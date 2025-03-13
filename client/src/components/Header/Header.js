import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, User, ShoppingCart } from 'lucide-react';
import Logo from '../../Assets/Images/foodmartlogo.png';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleAccountDropdown = () => setIsAccountDropdownOpen(!isAccountDropdownOpen);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/products', label: 'Products' },
    { to: '/contact', label: 'Reach Out' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-container">
          <img src={Logo} alt="Krushivrund Farm Logo" className="logo" />
        </Link>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active-nav-link' : ''}`}
              onClick={() => setIsMenuOpen(false)}
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <div className="user-account-container">
            <Link to="/cart">
              <button className="user-account-btn">
                <ShoppingCart size={24} />
              </button>
            </Link>
            <Link to="/account">
              <button className="user-account-btn" onClick={toggleAccountDropdown}>
                <User size={24} />
              </button>
            </Link>
          </div>
          <button className="mobile-menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;