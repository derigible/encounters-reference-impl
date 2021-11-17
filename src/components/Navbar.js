import React from 'react'

function Navbar({ navigator, member }) {
    return (
        <nav id="nav" className={ (navigator && !member) ?  "open" : '' }>
            <h2> NAVIGATOR TEST TOOL </h2> 
            <ul>
                {/* <li><a href="/">Homepage</a></li> */}
                <li><a href="/chat">Chats</a></li>
                <li><a href="/tickets">Tickets</a></li>
                <li><a href="/userinfo">User Info </a></li>
            </ul>   
        </nav>
    )
}

export default Navbar
