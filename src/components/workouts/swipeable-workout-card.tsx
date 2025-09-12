import {
  SwipeableListItem,
  LeadingActions,
  TrailingActions,
  SwipeAction,
  SwipeableList,
  Type,
} from 'react-swipeable-list'
import 'react-swipeable-list/dist/styles.css'
import WorkoutCard from '@/components/workouts/workout-card'
import { Button } from '@heroui/button'
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react'

interface SwipeableWorkoutCardProps {
  workout: any
  onDelete: (id: string) => void
  onEdit: () => void
  onView: () => void
}

export default function SwipeableWorkoutCard({
  workout,
  onDelete,
  onEdit,
  onView,
}: SwipeableWorkoutCardProps) {
  const leadingActions = () => (
    <LeadingActions>
      <SwipeAction onClick={onEdit}>
        <Button
          color='primary'
          size='sm'
          className='h-full w-full'
          onPress={onEdit}>
          Edit
          <IconEdit size={16} />
        </Button>
      </SwipeAction>
      <SwipeAction onClick={onView}>
        <Button
          color='secondary'
          size='sm'
          className='h-full w-full'
          onPress={onView}>
          View
          <IconEye size={16} />
        </Button>
      </SwipeAction>
    </LeadingActions>
  )

  const trailingActions = () => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => onDelete(workout.id)}
        Tag='div'>
        <Button
          color='danger'
          size='sm'
          className='h-full w-full'
          onPress={() => onDelete(workout.id)}>
          Delete
          <IconTrash size={16} />
        </Button>
      </SwipeAction>
    </TrailingActions>
  )

  return (
    <SwipeableList threshold={0.25} type={Type.IOS}>
      <SwipeableListItem
        leadingActions={leadingActions()}
        trailingActions={trailingActions()}>
        <WorkoutCard workout={workout} onDelete={() => onDelete(workout.id)} />
      </SwipeableListItem>
    </SwipeableList>
  )
}
