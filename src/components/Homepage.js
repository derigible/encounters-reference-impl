import React from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

function HomePage({setIsNavigator, setMember}) {
    return (
        <div>
            <h1>HOMEPAGE</h1>
            <Link href="/member">
                <button onClick={()=>{
                    setMember(true) 
                    setIsNavigator(false)
                    }}>MEMBER</button>
            </Link>
            <Link href="/navigator">
                <button onClick={()=>{
                    setIsNavigator(true) 
                    setMember(false)
                    }}>NAVIGATOR</button> 
            </Link>
        </div>
    )
}

export default HomePage
