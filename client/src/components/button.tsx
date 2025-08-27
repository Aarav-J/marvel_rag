'use client'
import { cookieClick } from "@/utils";

const CookieButton = () => { 
    const handleClick = () => {
        cookieClick();
    }
    
    return ( 
        <button onClick={handleClick}>Get Cookies</button>
    )
}

export default CookieButton;