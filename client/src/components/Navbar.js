import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const Navbar = (props) => {
    const navigate = useNavigate();
    function logout() {
        props.setLogins({ 'loggedIn': 'no', 'userName': 'none', 'authToken': 'none' })
        localStorage.clear();
        navigate('/login')
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Ledger</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link active" aria-current="page" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link active" aria-current="page" to="/trash">Trash</Link>
                        </li>
                        {/* <li className="nav-ite">
                            <Link className="nav-link active" to="/help">Help</Link>
                        </li> */}

                    </ul>
                    {/* user not loggedIn */}
                    {(props.logins.loggedIn === 'no') && <Link to='/login' className='btn btn-primary' >Login</Link>}
                    {/* user loggedIn */}
                    {(props.logins.loggedIn === 'yes') && <div className='btn-group '>
                        <button id='userMenu' type='button' className='btn btn-success dropdown-toggle ' data-bs-toggle='dropdown' aria-expanded='false' value=''>
                            {props.logins.userName}
                        </button>
                        <ul className='dropdown-menu dropdown-menu-lg-end'>
                            <li><Link className='dropdown-item ' to='/change-password'>Change Password</Link></li>
                            <li><button className='dropdown-item' onClick={logout}>Logout</button></li>
                        </ul>
                    </div>
                    }
                </div>
            </div>
        </nav>
    )
}

export default Navbar