import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from './Alert'
const Login = (props) => {
    document.title = "Login";
    const navigate = useNavigate();
    useEffect(() => {
        if (props.logins.loggedIn === 'yes') {
            navigate('/')
        } else {
            let loggedIn = localStorage.getItem("loggedIn");
            if (loggedIn === 'yes') {
                props.setLogins({
                    'loggedIn': 'yes',
                    'userName': localStorage.getItem("userName"),
                    'authToken': localStorage.getItem("authToken")
                });
                navigate('/');
            }
        }
    }, [])
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        props.setProgress(10)
        fetch(props.apiServer + '/api/auth/login', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": email,
                "password": password,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle data
                setPassword("");
                setEmail("");
                if (data.loggedIn === 'yes') {
                    props.setLogins({ 'loggedIn': 'yes', 'userName': data.userName, 'authToken': data.authToken });
                    localStorage.setItem("loggedIn", "yes");
                    localStorage.setItem("userName", data.userName);
                    localStorage.setItem("authToken", data.authToken);
                    navigate('/');
                } else {
                    setShowAlert(true)
                    setAlertMessage('Login failed! Wrong credentials')
                }
                props.setProgress(100)
            })
            .catch((err) => {
                console.log(err.message);
                setShowAlert(true)
                setAlertMessage('Login failed! Could not connect to server')
                props.setProgress(100)
            });
    };
    function togglePassword() {
        let x = document.getElementById("password");
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }
    }
    return (
        <>
            {showAlert && <Alert alertType='danger' alertMessage={alertMessage} />}
            <div className='container my-3'>
                <h4>Login</h4>
                <form className='col-sm-12 col-md-6' method='POST' onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='email' className='form-label float-start'>Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type='email' className='form-control' id='email' name='email' required />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='password' className='form-label float-start'>Password </label>
                        <Link to='/forgot-password' className='float-end'>Forgot Password</Link>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type='password' className='form-control' id='password' name='password' required />
                        <input type="checkbox" onClick={togglePassword} name='togglePassword' id='togglePassword' />
                        <label htmlFor='togglePassword' className='form-label ms-2'>Show Password</label>
                    </div>
                    <button type='submit' className='btn btn-primary'>Submit</button>
                </form>
                <div className='mt-5'>
                    Don't have account? <Link to='/register'> Register</Link>
                </div>
            </div>
        </>
    )
}

export default Login