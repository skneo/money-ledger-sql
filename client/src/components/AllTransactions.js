import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Alert from './Alert'
const Home = (props) => {
    document.title = "All Transactions";
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState({ 'name': '', balance: 0, transactions: [] });
    const [alert, setAlert] = useState({ 'show': false, 'type': '', 'message': '' });
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const [formData, setFormData] = useState({ 'date': formattedDate, 'amount': '', 'remark': '', money: '' });
    let url = new URL(window.location.href);
    let cust_id = url.searchParams.get("cust_id");
    useEffect(() => {
        if (props.logins.loggedIn === 'no') {
            navigate('/login')
        }
        props.setProgress(10)
        fetch(props.apiServer + '/api/customers/transactions/' + cust_id, {
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
                if (data.name) {
                    setCustomerData(data)
                } else {
                    setAlert({ show: true, type: 'danger', message: data.message })
                }
                props.setProgress(100)
            })
            .catch((err) => {
                // console.log(err.message);
                setAlert({ show: true, type: 'danger', message: 'Fetching transactions failed! Could not connect to server' })
                props.setProgress(100)
            });
    }, [])
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(values => ({ ...values, [name]: value }))
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const gave = document.querySelector('#gave');
        const got = document.querySelector('#got');
        let money = 'got';
        if (gave.checked) {
            money = 'gave'
        }
        if (window.confirm(`${money === 'gave' ? 'You gave ' : 'You got '} ${formData.amount} Rs \nDate: ${formData.date}\nSure to save ?`)) {
            document.getElementById('modalClose').click();

            props.setProgress(10)
            // console.log(formData)
            fetch(props.apiServer + '/api/customers/add-transaction', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': props.logins.authToken,
                },
                body: JSON.stringify({
                    "customerId": cust_id,
                    "amount": formData.amount,
                    "money": money,
                    "date": formData.date,
                    "remark": formData.remark,
                }),
            })
                .then((response) => response.json())
                .then((response) => {
                    // Handle data
                    setFormData({ 'date': formattedDate, 'amount': '', 'remark': '' });
                    if (response.transaction) {
                        setCustomerData(values => ({ ...values, balance: response.transaction.balance, transactions: [...customerData.transactions, response.transaction] }))
                        gave.checked = false;
                        got.checked = false;
                        setAlert({ show: true, type: 'success', message: response.message })
                    } else {
                        setAlert({ show: true, type: 'danger', message: response.message })
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
    const handleDelete = async (e) => {
        if (window.confirm(`Move ${customerData.name} to trash ?`)) {
            props.setProgress(10)
            fetch(props.apiServer + '/api/customers/delete-customer', {
                method: 'DELETE',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': props.logins.authToken,
                },
                body: JSON.stringify({
                    "customerId": cust_id,
                }),
            })
                .then((response) => response.json())
                .then((response) => {
                    // Handle data
                    if (response.trashed) {
                        setAlert({ show: true, type: 'success', message: response.message })
                        setTimeout(() => navigate('/'), 3000);
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
        }
    };
    return (
        <>
            {alert.show && <Alert alertType={alert.type} alertMessage={alert.message} />}
            <div className='container my-3'>
                <div className=''>
                    <Link to='/'><i className="bi bi-arrow-left fs-4 border px-3 rounded"></i></Link>
                    <a href='#' onClick={handleDelete}><i className="bi bi-trash3 mx-3 fs-4 float-end text-danger"></i></a>
                </div>
                <div className="fs-5">
                    <span >{customerData.name}: </span>
                    <span className={`${customerData.balance > 0 ? 'text-danger' : 'text-success'} ms-1`}>&#8377; {customerData.balance}</span>
                </div>
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">{customerData.name}</h5>
                                <button id='modalClose' type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form action="" method="POST" onSubmit={handleSubmit}>
                                    <div className="mb-2">
                                        <label htmlFor="amount" className="form-label float-start">Amount</label>
                                        <input className="form-control" placeholder='&#8377;' value={formData.amount} onChange={handleChange} min='0' type="number" name="amount" required />
                                    </div>
                                    <div className='d-flex mb-3'>
                                        <div className="form-check ">
                                            <input className="form-check-input" type="radio" name="money" id="gave" required />
                                            <label className="form-check-label" htmlFor="gave">
                                                You Gave
                                            </label>
                                        </div>
                                        <div className="form-check ms-5">
                                            <input className="form-check-input" type="radio" name="money" id="got" required />
                                            <label className="form-check-label" htmlFor="got">
                                                You Got
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="date" className="form-label float-start">Date</label>
                                        <input className="form-control" value={formData.date} onChange={handleChange} type="date" name="date" required />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="remark" className="form-label float-start">Remark</label>
                                        <input className="form-control " type="text" value={formData.remark} onChange={handleChange} name="remark" placeholder="enter remark if any" />
                                    </div>
                                    <input type="submit" className="btn btn-primary mt-2" value='Save' />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-center my-1">
                    <h5>All Transactions</h5>
                    <a href='#' data-bs-toggle="modal" data-bs-target="#exampleModal"> <i className="bi bi-plus-circle ms-3 fs-5 "></i></a>
                </div>
                <div className='table-responsive'>
                    <table id="all_cust" className="table-light table table-striped table-bordered" >
                        <thead>
                            <tr>
                                <th>SN</th>
                                <th>Date</th>
                                <th>You Gave</th>
                                <th>You Got</th>
                                <th>Balance</th>
                                <th>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerData.transactions.slice().reverse().map((trans, index) => {
                                return <tr key={trans.id}>
                                    <td>{customerData.transactions.length - index}</td>
                                    <td>{trans.date} </td>
                                    {trans.amount < 0 ? <><td>{-trans.amount}</td><td>-</td></> : <><td>-</td><td>{trans.amount}</td></>}
                                    <td>{trans.balance} </td>
                                    <td>{trans.remark} </td>
                                </tr>
                            })}
                        </tbody>
                    </table>
                </div>
            </div >
        </>
    )
}

export default Home