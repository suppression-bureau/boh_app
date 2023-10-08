import { useQuery } from 'urql'
import { graphql } from '../gql'

const postsQueryDocument = graphql(`
  query Aspects {
    aspect {
      id
      items {
        id
      }
    }
  }
`)

const Posts = () => {
  const [{ data }] = useQuery({ query: postsQueryDocument })
  return (
    <>
      {data?.aspect.map(({ items, id }) => (
        <p>
          {id}{' '}
          {items!.map(({ id }) => (
            <span>{id}</span>
          ))}
        </p>
      ))}
    </>
  )
}

export default Posts
