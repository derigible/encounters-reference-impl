import { useEffect } from 'react'
import { useMessenger } from '@pinkairship/use-messenger'
import { useQuery } from '@apollo/client'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

import { NOTIFICATIONS_QUERY } from '../../gql/queries/notifications'
import { NOTIFICATIONS_SUBSCRIPTION } from '../../gql/subscriptions/notifications_subscription'

export default function Notifications({
  currentUserId,
  notifyNewNotification,
  setActiveNotificationsCount,
}) {
  const { addMessage } = useMessenger()
  const { subscribeToMore, data, loading, error } = useQuery(
    NOTIFICATIONS_QUERY
  )

  useEffect(() => {
    return subscribeToMore({
      document: NOTIFICATIONS_SUBSCRIPTION,
      variables: {},
      updateQuery: (prev, { subscriptionData }) => {
        console.log('updating through ws')
        if (!subscriptionData.data) return prev
        const notification = subscriptionData.data.notifications.notification
        const notifications = [...prev.notifications, notification]
        notifyNewNotification()
        setActiveNotificationsCount(notifications.length)
        return {
          ...prev,
          notifications,
        }
      },
    })
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{`Error! ${error.message}`}</div>

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Resource</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.notifications.map((row) => {
            return (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.category}
                </TableCell>
                <TableCell>{row.notification_type}</TableCell>
                <TableCell>{row.content}</TableCell>
                <TableCell>{`${row.resource_id}-${row.resource_type}`}</TableCell>
                <TableCell align="right">
                  <Button variant="contained">Hide</Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
