import React from 'react'

function NavbarMember({ member }) {
    return (
        <nav id="membernav" className={ member ? "open" : '' }>
            <h2> MEMBER TEST TOOL </h2> 
            <ul>
                {/* <li><a href="/">Homepage</a></li> */}
                <li><a href="/chat">Chats</a></li>
                <li><a href="/userinfo">User info </a></li>
            </ul>   
        </nav>
    )
}

export default NavbarMember
