import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const Help = (props) => {
    document.title = "Help";
    const navigate = useNavigate();
    useEffect(() => {
        if (props.logins.loggedIn === 'no') {
            navigate('/login')
        }
    }, [navigate, props.logins.loggedIn])
    return (
        <>
            <div className='container my-3'>
                this is help
            </div>
        </>
    )
}
export default Help