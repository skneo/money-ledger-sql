import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from './Alert'
const Register = (props) => {
    document.title = "Forgot Password";
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', otpToken: '', otp: '', pwd1: '', pwd2: '' });
    const [alert, setAlert] = useState({ 'show': false, 'type': '', 'message': '' });
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
    //otp
    const sendOTP = async (e) => {
        // e.preventDefault();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
            return setAlert({ show: true, type: 'danger', message: 'Enter a valid email' })
        }
        props.setProgress(10)
        fetch(props.apiServer + '/api/auth/send-otp', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": formData.email,
                "resetPassword": 'yes',
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle data
                if (data.otpToken) {
                    // console.log(data)
                    setAlert({ show: true, type: 'success', message: data.message })
                    setFormData(oldData => ({ ...oldData, otpToken: data.otpToken }));
                } else {
                    setAlert({ show: true, type: 'danger', message: data.error })
                }
                props.setProgress(100)
            })
            .catch((err) => {
                // console.log(err.message);
                setAlert({
                    show: true, type: 'danger', message: 'Request failed! Could not connect to server'
                })
                props.setProgress(100)
            });
    };
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(values => ({ ...values, [name]: value }))
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        props.setProgress(10)
        fetch(props.apiServer + '/api/auth/reset-password', {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "email": formData.email,
                "otp": formData.otp,
                "otpToken": formData.otpToken,
                "password": formData.pwd1,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle data
                if (data.message) {
                    setFormData({ email: '', otpToken: '', otp: '', pwd1: '', pwd2: '' })
                    // props.setLogins({ 'loggedIn': 'yes', 'userName': data.userName, 'authToken': data.authToken });
                    // localStorage.setItem("loggedIn", "yes");
                    // localStorage.setItem("userName", data.userName);
                    // localStorage.setItem("authToken", data.authToken);
                    // navigate('/');
                    setAlert({ show: true, type: 'success', message: data.message })
                } else {
                    setAlert({ show: true, type: 'danger', message: data.error })
                }
                props.setProgress(100)
            })
            .catch((err) => {
                console.log(err.message);
                setAlert({
                    show: true, type: 'danger', message: 'Request failed! Could not connect to server'
                })
                props.setProgress(100)
            });
    };
    function togglePassword() {
        let x = document.getElementById("pwd1");
        if (x.type === "password") {
            x.type = "text";
        } else {
            x.type = "password";
        }
    }
    function validatePassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+])[a-zA-Z\d!@#$%^&*()\-_=+]{8,16}$/;
        return regex.test(password);
    }
    function check() {
        let pwd1 = document.getElementById('pwd1').value;
        let pwd2 = document.getElementById('pwd2').value;
        let validation = validatePassword(pwd1)
        if (validation == true) {
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('message1').style.display = 'none'
        } else {
            document.getElementById('submitBtn').disabled = true;
            document.getElementById('message1').style.display = 'block'
        }
        if ((pwd1 == pwd2) & validation) {
            document.getElementById('message').style.color = 'green';
            document.getElementById('message').innerHTML = 'Both passwords matched';
            document.getElementById('submitBtn').disabled = false;
        } else {
            document.getElementById('message').style.color = 'red';
            document.getElementById('message').innerHTML = 'Both passwords not matched';
            document.getElementById('submitBtn').disabled = true;
        }
    }
    return (
        <>
            {alert.show && <Alert alertType={alert.type} alertMessage={alert.message} />}
            <div className='container my-3'>
                <h4>Forgot Password</h4>
                <form className='col-sm-12 col-md-6' method='POST' onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='email' className='form-label float-start'>Email</label>
                        <input value={formData.email} onChange={handleChange} type='email' className='form-control' id='email' name='email' required />
                    </div>
                    <div className='mb-3'>
                        <button type="button" onClick={sendOTP} className='float-start form-label btn btn-sm btn-outline-primary'>Send OTP</button>
                        <input value={formData.otp} onChange={handleChange} type='password' className='form-control' id='otp' placeholder='enter OTP' name='otp' required />
                    </div>

                    <div className="mb-2">
                        <label htmlFor="pwd1" className="form-label float-start">New Password</label>
                        <input onKeyUp={() => check(this)} value={formData.pwd1} onChange={handleChange} minLength="8" maxLength="16" required type="password" className="form-control"
                            id="pwd1" name="pwd1" />
                        <input type="checkbox" onClick={togglePassword} name='togglePassword' id='togglePassword' />
                        <label htmlFor='togglePassword' className='form-label ms-2'>Show Password</label>
                        <small id='message1' className="float-start text-danger">Password should contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character only from !@#$%^&*()-_=+ and minimum 8 character long</small>
                    </div>
                    <div className="mb-1">
                        <label htmlFor="pwd2" className="form-label float-start">Confirm New Password</label>
                        <input onKeyUp={() => check(this)} value={formData.pwd2} onChange={handleChange} minLength="8" maxLength="16" required type="password" className="form-control"
                            id="pwd2" name="pwd2" />
                        <span id='message' className="float-start"></span><br />
                    </div>
                    <button type='submit' id="submitBtn" className='btn btn-primary'>Submit</button>
                </form>
            </div>
        </>
    )
}

export default Register