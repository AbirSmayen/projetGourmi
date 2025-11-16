import { Link } from "react-router-dom";

const Sidebar = () => (
  <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
    <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
      <div className="sidebar-brand-text mx-3">Admin</div>
    </Link>

    <hr className="sidebar-divider my-0" />
    
    <li className="nav-item">
      <Link className="nav-link" to="/dashboard">
        <i className="fas fa-fw fa-tachometer-alt"></i>
        <span>Dashboard</span>
      </Link>
    </li>
    
    <li className="nav-item">
      <Link className="nav-link" to="/users">
        <i className="fas fa-fw fa-users"></i>
        <span>Users</span>
      </Link>
    </li>
    
    <li className="nav-item">
      <Link className="nav-link" to="/recipes">
        <i className="fas fa-fw fa-utensils"></i>
        <span>Recipes</span>
      </Link>
    </li>
    
    <li className="nav-item">
      <Link className="nav-link" to="/official-recipes">
        <i className="fas fa-fw fa-crown"></i>
        <span>Official recipes</span>
      </Link>
    </li>
    
    <li className="nav-item">
      <Link className="nav-link" to="/interactions">
        <i className="fas fa-fw fa-comments"></i>
        <span>Interactions</span>
      </Link>
    </li>
    
    <li className="nav-item">
      <Link className="nav-link" to="/stats">
        <i className="fas fa-fw fa-chart-area"></i>
        <span>Statistics</span>
      </Link>
    </li>
  </ul>
);

export default Sidebar;