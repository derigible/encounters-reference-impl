import React from 'react'

function Navbar(props) {
    return (
        <nav>
            <h2>TEST TOOL </h2> 
            <ul>
                <li><a href="/">Homepage</a></li>
                <li><a href="/chat">Chats</a></li>
                <li><a href="/tickets">Tickets</a></li>
                <li><a href="/userinfo">User Info <span>{props.basketNumber}</span></a></li>
            </ul>   
        </nav>
    )
}

export default Navbar
