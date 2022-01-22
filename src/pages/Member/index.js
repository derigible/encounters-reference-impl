import { Typography, Grid } from '@mui/material'

import ChatRoom from '../../components/ChatRoom'

export default function Member() {
  const chatRooms = [
    { 
      category_id: 'BILLING_PHARMACY', 
      owner: {
        name: 'Marc'
      }
    },
    {
      category_id: 'NAVIGATION', 
      owner: {
        name: 'Marc'
      }
    }
  ]
  return (
    <>
      <Typography variant="h2" as="h1" gutterBottom>
        Member
      </Typography>
      <Grid container spacing={2}>
        {
          chatRooms.map((c) => (
            <Grid item xs={6} md={6} key={c.category_id}>
              <ChatRoom chatRoom={c} />
            </Grid>
          ))
        }
      </Grid>
    </>
  )
}
