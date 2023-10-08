import { useQuery } from "urql"
import { graphql } from "../gql"
import React from "react"

const postsQueryDocument = graphql(`
    query Aspects {
        aspect {
            id
            assistants {
                id
            }
        }
    }
`)

const Posts = () => {
    const [{ data }] = useQuery({ query: postsQueryDocument })
    return (
        <dl>
            {data!.aspect.map(({ assistants, id }) => (
                <React.Fragment key={id}>
                    <dt>{id}</dt>
                    {assistants!.map(({ id }) => (
                        <dd key={id}>{id}</dd>
                    ))}
                </React.Fragment>
            ))}
        </dl>
    )
}

export default Posts
