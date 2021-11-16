import React from 'react'
import { Link } from 'react-router-dom'

function HomePage() {
    return (
        <div>
            <h1>HOMEPAGE</h1>
            <Link href="/member"><button>MEMBER</button></Link>
            <Link href="/navigator"><button>NAVIGATOR</button></Link> 
        </div>
    )
}

export default HomePage
