import { useEffect } from 'react'
import { useMessenger } from '@pinkairship/use-messenger'
import { useQuery, useMutation } from '@apollo/client'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'

import { NOTIFICATIONS_QUERY } from '../../gql/queries/notifications'
import { HIDE_NOTIFICATION_MUTATION } from '../../gql/mutations/hide_notification_mutation'
import { NOTIFICATIONS_SUBSCRIPTION } from '../../gql/subscriptions/notifications_subscription'

export default function Notifications({
  notifyNewNotification,
  setActiveNotificationsCount,
}) {
  const { addMessage } = useMessenger()
  const {
    subscribeToMore,
    data,
    loading,
    error,
  } = useQuery(NOTIFICATIONS_QUERY, { variables: { withHidden: false } })
  const [hideNotification] = useMutation(HIDE_NOTIFICATION_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          hideNotification: { notification, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[HideNotification]`, errors)
        errors.messages.forEach((m) =>
          addMessage(`[HideNotification] ${m}`, 'error')
        )
      } else {
        console.log('updating through the mutation')
        currentCache.modify({
          fields: {
            notifications(existingNotifications, { readField }) {
              const newNotifications = existingNotifications.filter((n) => {
                return readField('id', n) !== notification.id
              })
              setActiveNotificationsCount(newNotifications.length)
              return newNotifications
            },
          },
        })
      }
    },
  })
  useEffect(() => {
    if (loading || error) return
    setActiveNotificationsCount(data.notifications.length)
  }, [loading, error])

  useEffect(() => {
    return subscribeToMore({
      document: NOTIFICATIONS_SUBSCRIPTION,
      variables: {},
      updateQuery: (prev, { subscriptionData }) => {
        console.log('updating through ws')
        if (!subscriptionData.data) return prev
        const notification = subscriptionData.data.notifications.notification
        let notifications
        if (subscriptionData.data.notifications.remove) {
          notifications = prev.notifications.filter(
            (n) => n.id !== notification.id
          )
        } else {
          notifications = [...prev.notifications, notification]
        }
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
            <TableCell>Id</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Time Sent</TableCell>
            <TableCell>Content</TableCell>
            <TableCell>Resource</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.notifications
            .slice()
            .sort((m1, m2) => parseInt(m2.id) - parseInt(m1.id))
            .map((row) => {
              return (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.id}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.notification_type}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.sent_at}
                  </TableCell>
                  <TableCell>{row.content}</TableCell>
                  <TableCell>{`${row.resource_id}-${row.resource_type}`}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      onClick={() =>
                        hideNotification({
                          variables: { notificationId: row.id },
                        })
                      }
                    >
                      Hide
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
