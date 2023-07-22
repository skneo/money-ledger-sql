import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from './Alert'
const Home = (props) => {
    document.title = "Trash";
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [alert, setAlert] = useState({ 'show': false, 'type': '', 'message': '' });
    useEffect(() => {
        if (props.logins.loggedIn === 'no') {
            navigate('/login')
        }
        props.setProgress(10)
        fetch(props.apiServer + '/api/customers/trash', {
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
                setCustomers(data.customers)
                props.setProgress(100)
            })
            .catch((err) => {
                // console.log(err.message);
                setAlert({ show: true, type: 'danger', message: 'Fetching customers failed! Could not connect to server' })
                props.setProgress(100)
            });
    }, [])
    const restoreCustomer = async (id, name) => {
        if (window.confirm(`Sure to restore ${name} ?`)) {
            props.setProgress(10)
            fetch(props.apiServer + '/api/customers/restore', {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': props.logins.authToken,
                },
                body: JSON.stringify({
                    "customerId": id,
                }),
            })
                .then((response) => response.json())
                .then((response) => {
                    // Handle data
                    if (response.trashed == false) {
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
            <div className='container'>
                <div className="my-2 d-flex">
                    <h4>Trashed Customers</h4>
                </div>
                <div >
                    <table id="all_cust" className="table-light table table-striped table-bordered" >
                        <thead>
                            <tr>
                                <th>SN</th>
                                <th>Customer Name</th>
                                <th>Balance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((cust, index) => {
                                return <tr key={cust.name}>
                                    <td>{index + 1}</td>
                                    <td>{cust.name}</td>
                                    <td>{cust.balance}</td>
                                    <td><button onClick={() => restoreCustomer(cust.id, cust.name)} className='btn btn-sm btn-outline-primary' >Restore</button> </td>
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