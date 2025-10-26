import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '~/components/ui/pagination'

interface Props {
  currentPage: number
  handlePagePagination: (value: number) => void
  lastPage: number
}

export default function AppPagination({
  currentPage,
  handlePagePagination,
  lastPage,
}: Props) {
  return (
    <Pagination>
      <PaginationContent>
        {Array.from(
          {
            length: lastPage,
          },
          (_, index) => {
          // Only show the first page, the last page, the current page, and two pages on either side of the current page
            if (
              index === 0
              || index === lastPage - 1
              || Math.abs(currentPage - (index + 1)) <= 2
            ) {
              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={index + 1 === currentPage}
                    onClick={() => handlePagePagination(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            }
            else if (
            // Only show one ellipsis on either side of the current page
              index === currentPage - 4
              || index === currentPage + 2
            ) {
              return <PaginationEllipsis key={index} />
            }
            return null
          },
        )}
      </PaginationContent>
    </Pagination>
  )
}
