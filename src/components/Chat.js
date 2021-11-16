import React from 'react'
import { Link } from "react-router-dom"

function Chat() {
    return (
        <div>
            <h1>Chat Rooms</h1>
            <br></br>
            <p>Display Chat Info Here</p>
            <br></br>
            <Link href="/chatTab1"><button>PENDING CHATROOM LINKS</button></Link>
            <br></br>
            <br></br>
            <Link href="/chatTab2"><button>REMAINING CHATROOMS</button></Link>
        </div>
    )
};

export default Chat
