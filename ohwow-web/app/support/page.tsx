'use client'
import Button from '@mui/material/Button'

export default function SupportPage() {
    const supportEmail = 'happiness@ohwowapp.com';

    const handleEmailClick = () => {
        window.location.href = `mailto:${supportEmail}`;
    };

    return (
        <div style={{ margin: "25%", textAlign: "center" }}>
            <h1>Contact Oh Wow Support</h1>
            <p>If you have any questions or issues, please contact our support team:</p>
            <Button onClick={handleEmailClick}>Email Support</Button>
        </div>
    );
}
