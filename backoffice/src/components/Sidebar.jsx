import { Link } from "react-router-dom";

const Sidebar = () => (
  <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
    <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
      <div className="sidebar-brand-text mx-3">Admin</div>
    </Link>

    <hr className="sidebar-divider my-0" />
    <li className="nav-item">
      <Link className="nav-link" to="/dashboard">
        <span>Dashboard</span>
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link" to="/users">
        <span>Utilisateurs</span>
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link" to="/recipes">
        <span>Recettes</span>
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link" to="/official-recipes">
        <span>Recettes officielles</span>
      </Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link" to="/stats">
        <span>Statistiques</span>
      </Link>
    </li>
  </ul>
);

export default Sidebar;
