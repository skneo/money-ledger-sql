import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from './Alert'
const Home = (props) => {
    document.title = "Change Password";
    const navigate = useNavigate();
    const [alert, setAlert] = useState({ 'show': false, 'type': '', 'message': '' });
    useEffect(() => {
        if (props.logins.loggedIn === 'no') {
            navigate('/login')
        }
    }, [])
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
    const changePassword = async (e) => {
        e.preventDefault();
        props.setProgress(10)
        let pwd1 = document.getElementById('pwd1').value;
        let oldPassword = document.getElementById('old_password').value;
        fetch(props.apiServer + '/api/auth/change-password', {
            method: 'PUT',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': props.logins.authToken,
            },
            body: JSON.stringify({
                "password": pwd1,
                'oldPassword': oldPassword
            }),
        })
            .then((response) => response.json())
            .then((response) => {
                // Handle data
                if (response.passwordChanged) {
                    setAlert({ show: true, type: 'success', message: response.message })
                } else {
                    setAlert({ show: true, type: 'danger', message: response.message })
                }
                props.setProgress(100)
            })
            .catch((err) => {
                // console.log(err.message);
                setAlert({ show: true, type: 'danger', message: 'Request failed! Could not connect to server' })
                props.setProgress(100)
            });
        document.getElementById('pwd1').value = '';
        document.getElementById('pwd2').value = '';
        document.getElementById('old_password').value = '';
    };
    return (
        <>
            {alert.show && <Alert alertType={alert.type} alertMessage={alert.message} />}
            <center>
                <h4 className="mt-3">Change Password</h4>
                <form method="POST" className="mt-3" style={{ "width": "300px" }} onSubmit={changePassword}>
                    <div className="mb-3">
                        <label htmlFor="old_password" className="form-label float-start">Old Password</label>
                        <input required type="password" className="form-control" name="old_password" id='old_password' />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="pwd1" className="form-label float-start">New Password</label>
                        <input onKeyUp={() => check(this)} minLength="8" maxLength="16" required type="password" className="form-control"
                            id="pwd1" name="pwd1" />
                        <small id='message1' className="float-start text-danger">Password should contain at least 1 lowercase letter, 1 uppercase letter, 1 number, 1 special character only from !@#$%^&*()-_=+ and minimum 8 character long</small>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="pwd2" className="form-label float-start">Confirm New Password</label>
                        <input onKeyUp={() => check(this)} minLength="8" maxLength="16" required type="password" className="form-control"
                            id="pwd2" name="pwd2" />
                        <span id='message' className="float-start"></span><br />
                    </div>
                    <button type="submit" id="submitBtn" className="btn btn-success">Submit</button>
                </form>
            </center>
        </>
    )
}

export default Home