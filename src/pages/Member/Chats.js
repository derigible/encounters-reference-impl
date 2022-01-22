
import { Typography } from '@mui/material'

export default function Chats({token}) {
  if (!token) {
    return ( 
      <div>
        <Typography variant="h1">Need to Set Member Token</Typography>
      </div>     
    )
  } 
  return <div>hello chats!</div>
}
