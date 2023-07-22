import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Alert from './Alert'
const Home = (props) => {
    document.title = "Home";
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [alert, setAlert] = useState({ 'show': false, 'type': '', 'message': '' });
    const [balance, setBalance] = useState({ 'getRs': 0, 'giveRs': 0 });
    const [custName, setCustName] = useState('')
    useEffect(() => {
        if (props.logins.loggedIn === 'no') {
            navigate('/login')
        }
        props.setProgress(10)
        fetch(props.apiServer + '/api/customers/all-customers', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': props.logins.authToken,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle data
                if (data.customers) {
                    setCustomers(data.customers)
                } else {
                    setAlert({ show: true, type: 'danger', message: data.error })
                }
                props.setProgress(100)
            })
            .catch((err) => {
                // console.log(err.message);
                setAlert({ show: true, type: 'danger', message: 'Fetching customers failed! Could not connect to server' })
                props.setProgress(100)
            });
    }, [])
    useEffect(() => {
        let giveRs = 0, getRs = 0;
        customers.forEach(cust => {
            if (cust.balance < 0) {
                getRs -= cust.balance;
            } else {
                giveRs += cust.balance;
            }
        });
        setBalance({ getRs, giveRs });
    }, [customers]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (window.confirm(`Sure to add ${custName} ?`)) {
            document.getElementById('modalClose').click();
            props.setProgress(10)
            fetch(props.apiServer + '/api/customers/add-customer', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': props.logins.authToken,
                },
                body: JSON.stringify({
                    "name": custName,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    // Handle data
                    setCustName("");
                    if (data.customer) {
                        setCustomers([...customers, data.customer])
                        setAlert({ show: true, type: 'success', message: data.message })
                    } else {
                        setAlert({ show: true, type: 'danger', message: data.message })
                    }
                    props.setProgress(100)
                })
                .catch((err) => {
                    // console.log(err.message);
                    setAlert({ show: true, type: 'danger', message: 'Adding customer failed! Could not connect to server' })
                    props.setProgress(100)
                });
        }
    };
    return (
        <>
            {alert.show && <Alert alertType={alert.type} alertMessage={alert.message} />}
            <div className='container'>
                <center className="mt-3 fs-4">
                    <span className="text-success me-2">Get &#8377; {balance.getRs}</span> &
                    <span className="text-danger ms-2">Give &#8377; {balance.giveRs}</span>
                </center>
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Add Customer</h5>
                                <button id='modalClose' type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form method="POST" onSubmit={handleSubmit}>
                                    <div className="">
                                        <label htmlFor="cust_name" className="form-label float-start">Customer Name</label>
                                        <input type="text" value={custName} onChange={(e) => setCustName(e.target.value)} className="form-control" name="cust_name" required />
                                    </div>
                                    <button type='submit' className="btn btn-primary mt-3">Add</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my-2 d-flex">
                    <h4>All Customers</h4>
                    <a href='#' data-bs-toggle="modal" data-bs-target="#exampleModal"> <i className="bi bi-plus-circle ms-5 fs-5"></i></a>
                </div>
                <div className='table-responsive'>
                    <table id="all_cust" className="table-light table table-striped table-bordered" >
                        <thead>
                            <tr>
                                <th>SN</th>
                                <th>Customer Name</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((cust, index) => {
                                return <tr key={cust.name}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <Link to={`/all-transactions?cust_id=${cust.id}`} className=''>{cust.name}</Link>
                                    </td>
                                    <td>&#8377; {cust.balance} </td>
                                </tr>
                            })}
                        </tbody>
                    </table>
                </div>
                <div>
                    <p>* Positive balance means you will return money to customer</p>
                    <p>* Negative balance means customer will return money to you</p>
                </div>
            </div >
        </>
    )
}

export default Home