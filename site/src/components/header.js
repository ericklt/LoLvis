import React from 'react';
import {Link} from 'react-router-dom';

class Header extends React.Component {
  render() {
    return(
      <header className="top-bar navbar-fixed-top animated-header">
        <div className="container">
          <div className="navbar-header">
            <div className="navbar-brand">
              <Link to={'/'}><img src={process.env.PUBLIC_URL + '/images/logo.png'} className="logo-img" alt="logo" /></Link>
            </div>
          </div>
          <nav className="collapse navbar-collapse navbar-right">
            <div className="main-menu">
              <ul className="nav navbar-nav navbar-right">
                <li><Link to={'/'}>Home</Link></li>
                <li><Link to={'/champions'}>Campeões</Link></li>
                <li><Link to={'/map'}>Mapa</Link></li>
              </ul>
            </div>
          </nav>
        </div>
      </header>
    );
  }
}

export default Header;