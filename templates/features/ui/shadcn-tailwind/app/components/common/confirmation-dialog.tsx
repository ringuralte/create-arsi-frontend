import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

interface Props {
  description?: string
  handleConfirm: () => void
  handleOpenChange: (open: boolean) => void
  isPending: boolean
  onCancel?: () => void
  open: boolean
  title?: string
}

/**
 * A confirmation dialog component.
 *
 * @param description The description to display
 * @param handleConfirm The function to call when the user confirms
 * @param handleOpenChange The function to call when the dialog is opened or closed
 * @param isPending Whether the confirmation is pending
 * @param onCancel The function to call when the user cancels
 * @param open Whether the dialog is open
 * @param title The title to display
 *
 * @example
 * <ConfirmationDialog
 *   description="Are you sure you want to delete this item?"
 *   handleConfirm={handleDelete}
 *   handleOpenChange={toggleDelete}
 *   isPending={deleteItem.isPending}
 *   open={openDelete}
 *   title="Delete item"
 * />
 */
function ConfirmationDialog({
  description,
  handleConfirm,
  handleOpenChange,
  isPending,
  onCancel,
  open,
  title,
}: Props) {
  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? 'Delete item'}</DialogTitle>
          <DialogDescription>
            {description ?? 'Are you sure you want to delete this item?'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-x-4 p-1">
          <Button
            onClick={() => {
              handleOpenChange(false)
              if (onCancel) {
                onCancel()
              }
            }}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            onClick={handleConfirm}
            type="button"
            variant="destructive"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationDialog
