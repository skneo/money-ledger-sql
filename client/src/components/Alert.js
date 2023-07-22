export default function Alert(props) {
    return (
        <div className={`alert alert-${props.alertType} py-2`} role='alert'>
            <strong>{props.alertMessage}</strong>
        </div>
    )
}